const crypto = require("crypto");
const mongoose = require("mongoose");
const shortid = require("shortid");
const { UAParser } = require("ua-parser-js");
const QRCode = require("qrcode");
const ClickEvent = require("../models/clickEvent.model");
const Url = require("../models/url.model");
const { isReservedSlug, normalizeSlug } = require("../utils/reservedSlugs");

const ALIAS_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;
const CLAIM_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

const isAdmin = (user) => Boolean(user?.roles?.includes("admin"));
const isOwner = (url, user) =>
  Boolean(
    url?.createdby &&
    user?._id &&
    url.createdby.toString() === user._id.toString(),
  );
const canManage = (url, user) => isAdmin(user) || isOwner(url, user);
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

function validateDestination(value) {
  if (typeof value !== "string" || !value.trim()) return "URL is required";
  if (value.trim().length > 8192) return "URL is too long";
  try {
    const parsed = new URL(value.trim());
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Only HTTP and HTTPS URLs are supported";
    }
  } catch {
    return "Enter a valid absolute URL";
  }
  return null;
}

function validateAlias(alias) {
  if (!alias) return null;
  if (isReservedSlug(alias)) return "That alias is reserved";
  if (!ALIAS_PATTERN.test(alias)) {
    return "Alias must be 3-32 characters using only letters, numbers, hyphens, or underscores";
  }
  return null;
}

function shortUrlFor(req, shortID) {
  return `${req.protocol}://${req.get("host")}/${shortID}`;
}

async function generateUniqueShortID() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = shortid
      .generate()
      .replace(/[^A-Za-z0-9_-]/g, "")
      .slice(0, 6);
    if (candidate.length >= 4 && !(await Url.exists({ shortID: candidate })))
      return candidate;
  }
  throw new Error("Unable to generate a unique short ID");
}

function serializeUrl(req, url, extra = {}) {
  return {
    _id: url._id,
    linkId: url._id,
    shortID: url.shortID,
    url: shortUrlFor(req, url.shortID),
    shortUrl: shortUrlFor(req, url.shortID),
    redirectUrl: url.redirectUrl,
    alias: url.alias || null,
    title: url.title || "",
    status: url.status === "active" ? "active" : "blocked",
    createdby: url.createdby || null,
    createdAt: url.createdAt,
    updatedAt: url.updatedAt,
    ...extra,
  };
}

async function getallUrls(req, res) {
  try {
    const query = isAdmin(req.user)
      ? { createdby: { $ne: null } }
      : { createdby: req.user._id };
    const urls = await Url.find(query).sort({ createdAt: -1 });
    return res.status(200).json(urls);
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function generateNewShortID(req, res) {
  try {
    const body = req.body || {};
    const destination = typeof body.url === "string" ? body.url.trim() : "";
    const alias = normalizeSlug(body.alias);
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const urlError = validateDestination(destination);
    const aliasError = validateAlias(alias);

    if (urlError) return res.status(400).json({ error: urlError });
    if (aliasError) return res.status(400).json({ error: aliasError });
    if (title.length > 120)
      return res
        .status(400)
        .json({ error: "Title must be 120 characters or less" });

    const newShortID = alias || (await generateUniqueShortID());
    if (await Url.exists({ shortID: newShortID })) {
      return res.status(409).json({ error: "That alias is already in use" });
    }

    let claimToken = null;
    const createPayload = {
      shortID: newShortID,
      redirectUrl: destination,
      alias: alias || undefined,
      title,
      createdby: req.user?._id || null,
    };
    if (!req.user) {
      claimToken = crypto.randomBytes(32).toString("base64url");
      createPayload.guestClaimTokenHash = hashToken(claimToken);
      createPayload.guestClaimExpiresAt = new Date(
        Date.now() + CLAIM_LIFETIME_MS,
      );
    }

    const url = await Url.create(createPayload);
    return res
      .status(201)
      .json(serializeUrl(req, url, claimToken ? { claimToken } : {}));
  } catch (error) {
    if (error?.code === 11000)
      return res.status(409).json({ error: "That alias is already in use" });
    console.error("Create URL error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function claimGuestUrls(req, res) {
  const claims = Array.isArray(req.body?.claims)
    ? req.body.claims.slice(0, 50)
    : [];
  if (!claims.length)
    return res
      .status(400)
      .json({ error: "At least one guest link claim is required" });

  const claimed = [];
  const failed = [];
  for (const claim of claims) {
    const linkId = typeof claim?.linkId === "string" ? claim.linkId : "";
    const token = typeof claim?.claimToken === "string" ? claim.claimToken : "";
    if (!mongoose.isValidObjectId(linkId) || !token) {
      failed.push({ linkId, reason: "Invalid claim" });
      continue;
    }
    const tokenHash = hashToken(token);
    try {
      let url = await Url.findOneAndUpdate(
        {
          _id: linkId,
          createdby: null,
          guestClaimTokenHash: tokenHash,
          guestClaimExpiresAt: { $gt: new Date() },
        },
        { $set: { createdby: req.user._id, claimedAt: new Date() } },
        { new: true, select: "+guestClaimTokenHash +guestClaimExpiresAt" },
      );
      if (!url) {
        url = await Url.findOne({
          _id: linkId,
          createdby: req.user._id,
          guestClaimTokenHash: tokenHash,
        }).select("+guestClaimTokenHash +guestClaimExpiresAt");
      }
      if (url)
        claimed.push({
          linkId: url._id,
          shortID: url.shortID,
          status: "claimed",
        });
      else
        failed.push({
          linkId,
          reason:
            "Claim is invalid, expired, or already belongs to another account",
        });
    } catch {
      failed.push({ linkId, reason: "Claim could not be processed" });
    }
  }
  return res.status(200).json({ claimed, failed });
}

async function updateUrl(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ error: "Link not found" });
    const url = await Url.findById(req.params.id);
    if (!url) return res.status(404).json({ error: "Link not found" });
    if (!canManage(url, req.user))
      return res.status(403).json({ error: "Forbidden" });

    const updates = {};
    if (Object.hasOwn(req.body || {}, "title")) {
      const title =
        typeof req.body.title === "string" ? req.body.title.trim() : "";
      if (title.length > 120)
        return res
          .status(400)
          .json({ error: "Title must be 120 characters or less" });
      updates.title = title;
    }
    if (
      Object.hasOwn(req.body || {}, "url") ||
      Object.hasOwn(req.body || {}, "redirectUrl")
    ) {
      const destination = String(
        req.body.url ?? req.body.redirectUrl ?? "",
      ).trim();
      const error = validateDestination(destination);
      if (error) return res.status(400).json({ error });
      updates.redirectUrl = destination;
    }
    if (Object.hasOwn(req.body || {}, "alias")) {
      const alias = normalizeSlug(req.body.alias);
      const error = validateAlias(alias);
      if (error) return res.status(400).json({ error });
      const nextShortID = alias || (await generateUniqueShortID());
      if (
        nextShortID !== url.shortID &&
        (await Url.exists({ shortID: nextShortID, _id: { $ne: url._id } }))
      ) {
        return res.status(409).json({ error: "That alias is already in use" });
      }
      updates.shortID = nextShortID;
      updates.alias = alias || undefined;
    }
    if (!Object.keys(updates).length)
      return res
        .status(400)
        .json({ error: "No supported changes were provided" });

    Object.assign(url, updates);
    await url.save();
    return res.status(200).json(serializeUrl(req, url));
  } catch (error) {
    if (error?.code === 11000)
      return res.status(409).json({ error: "That alias is already in use" });
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function setUrlStatus(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ error: "Link not found" });
    const url = await Url.findById(req.params.id);
    if (!url) return res.status(404).json({ error: "Link not found" });
    if (!canManage(url, req.user))
      return res.status(403).json({ error: "Forbidden" });
    if (!["active", "blocked"].includes(req.body?.status)) {
      return res
        .status(400)
        .json({ error: "Status must be active or blocked" });
    }
    url.status = req.body.status;
    await url.save();
    return res.status(200).json(serializeUrl(req, url));
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteUrl(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ error: "Link not found" });
    const url = await Url.findById(req.params.id);
    if (!url) return res.status(404).json({ error: "Link not found" });
    if (!canManage(url, req.user))
      return res.status(403).json({ error: "Forbidden" });
    await ClickEvent.deleteMany({ urlId: url._id });
    await url.deleteOne();
    return res.status(200).json({ message: "Link deleted", id: url._id });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getRedirectUrl(req, res) {
  try {
    const urlEntry = await Url.findOne({ shortID: req.params.shortID });
    if (!urlEntry) return res.status(404).json({ error: "Short ID not found" });
    if (urlEntry.status !== "active") {
      return res
        .status(410)
        .json({ error: "This short link is currently unavailable" });
    }

    const userAgent = req.get("user-agent") || "";
    const result = new UAParser(userAgent).getResult();
    const deviceType = ["mobile", "tablet"].includes(result.device.type)
      ? result.device.type
      : result.device.type
        ? "unknown"
        : userAgent.includes("Mobile")
          ? "mobile"
          : "desktop";
    await ClickEvent.create({
      urlId: urlEntry._id,
      timestamp: new Date(),
      country: "unknown",
      region: "unknown",
      city: "unknown",
      deviceType,
      browser: result.browser.name || "unknown",
      os: result.os.name || "unknown",
      referrer: req.get("referer") || "direct",
      source: req.query?.source === "qr" ? "qr" : "link",
    });
    return res.redirect(urlEntry.redirectUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    return res.status(500).json({ error: "Unable to process redirect" });
  }
}

async function getAnalytics(req, res) {
  try {
    const urlEntry = await Url.findOne({ shortID: req.params.shortID });
    if (!urlEntry) return res.status(404).json({ error: "Short ID not found" });
    if (!canManage(urlEntry, req.user)) {
      return res
        .status(403)
        .json({
          error: "Forbidden - You can only view analytics for URLs you own",
        });
    }
    const visitHistory = await ClickEvent.find({ urlId: urlEntry._id }).sort({
      timestamp: -1,
    });
    const linkClicks = visitHistory.filter((event) => event.source !== "qr");
    const qrScans = visitHistory.filter((event) => event.source === "qr");
    return res
      .status(200)
      .json({
        visitHistory,
        totalVisits: visitHistory.length,
        linkClicks: linkClicks.length,
        qrScans: qrScans.length,
        url: serializeUrl(req, urlEntry),
      });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getQrCode(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Link not found" });
    }
    const urlEntry = await Url.findById(req.params.id);
    if (!urlEntry) return res.status(404).json({ error: "Link not found" });
    if (!canManage(urlEntry, req.user)) {
      return res.status(403).json({ error: "Forbidden - You can only generate QR codes for URLs you own" });
    }

    const shortUrl = shortUrlFor(req, urlEntry.shortID);
    const qrUrl = `${shortUrl}?source=qr`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
      type: "image/png",
      width: 720,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#252823", light: "#ffffff" },
    });
    return res.status(200).json({
      linkId: urlEntry._id,
      shortID: urlEntry.shortID,
      shortUrl,
      qrUrl,
      qrCodeDataUrl,
      mimeType: "image/png",
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return res.status(500).json({ error: "Unable to generate QR code" });
  }
}

async function getRecentActivity(req, res) {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 30;
    const ownerQuery = isAdmin(req.user)
      ? { createdby: { $ne: null } }
      : { createdby: req.user._id };
    const urls = await Url.find(ownerQuery)
      .select("shortID title redirectUrl createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const urlIds = urls.map((url) => url._id);
    const events = urlIds.length
      ? await ClickEvent.find({ urlId: { $in: urlIds } })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean()
      : [];
    const urlsById = new Map(urls.map((url) => [url._id.toString(), url]));
    const eventItems = events.map((event) => {
      const url = urlsById.get(event.urlId.toString());
      const isQrScan = event.source === "qr";
      return {
        id: `event-${event._id}`,
        type: isQrScan ? "qr_scan" : "link_click",
        timestamp: event.timestamp,
        linkId: event.urlId,
        shortID: url?.shortID || "",
        title: isQrScan ? "QR code scanned" : "Short link clicked",
        detail: url?.shortID ? `u.alokdev.in/${url.shortID}` : "A link in your workspace",
        source: event.source || "link",
      };
    });
    const creationItems = urls.slice(0, limit).map((url) => ({
      id: `link-${url._id}`,
      type: "link_created",
      timestamp: url.createdAt,
      linkId: url._id,
      shortID: url.shortID,
      title: "Short link created",
      detail: `u.alokdev.in/${url.shortID}`,
      source: "workspace",
    }));
    const activity = [...eventItems, ...creationItems]
      .sort((first, second) => new Date(second.timestamp) - new Date(first.timestamp))
      .slice(0, limit);
    return res.status(200).json({ activity });
  } catch {
    return res.status(500).json({ error: "Unable to load recent activity" });
  }
}

module.exports = {
  claimGuestUrls,
  deleteUrl,
  generateNewShortID,
  getRedirectUrl,
  getAnalytics,
  getallUrls,
  getQrCode,
  getRecentActivity,
  setUrlStatus,
  updateUrl,
};
