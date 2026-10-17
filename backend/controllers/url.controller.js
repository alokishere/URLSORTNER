const shortid = require("shortid");
const Url = require("../models/url.model");
const ClickEvent = require("../models/clickEvent.model");
const jwt = require("jsonwebtoken");
const { UAParser } = require("ua-parser-js");

async function getallUrls(req, res) {
  try {
    const userId = req.user && req.user._id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if user is admin
    const isAdmin = req.user.roles && req.user.roles.includes("admin");

    let urls;
    if (isAdmin) {
      // Admin can see all URLs
      urls = await Url.find();
    } else {
      // Regular users can only see their own URLs
      urls = await Url.find({ createdby: userId });
    }

    res.status(200).json(urls);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

async function generateNewShortID(req, res) {
  try {
    const body = req.body || {};
    const alias = typeof body.alias === "string" ? body.alias.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const token = req.cookies?.token;

    if (!body.url) {
      return res.status(400).json({ error: "URL is required" });
    }

    if (alias && !/^[A-Za-z0-9_-]{3,32}$/.test(alias)) {
      return res.status(400).json({
        error: "Alias must be 3-32 characters using only letters, numbers, hyphens, or underscores",
      });
    }

    if (title.length > 120) {
      return res.status(400).json({ error: "Title must be 120 characters or less" });
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized Token" });
    }

    const userId = decoded.id || decoded._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized User" });
    }

    const hostname = req.get("host");
    let newShortID = alias;

    if (newShortID) {
      const existingAlias = await Url.findOne({ shortID: newShortID });
      if (existingAlias) {
        return res.status(409).json({ error: "That alias is already in use" });
      }
    } else {
      // Keep generating until a unique ID is found.
      while (true) {
        const id = shortid.generate().slice(0, 4);
        const existingUrl = await Url.findOne({ shortID: id });
        if (!existingUrl) {
          newShortID = id;
          break;
        }
      }
    }

    await Url.create({
      shortID: newShortID,
      redirectUrl: body.url,
      alias: alias || undefined,
      title,
      visitHistory: [],
      createdby: userId,
    });

    return res.status(201).json({
      shortID: newShortID,
      url: hostname + "/" + newShortID,
      alias: alias || null,
      title,
      createdby: userId,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "That alias is already in use" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getRedirectUrl(req, res) {
  try {
    const { shortID } = req.params;

    const urlEntry = await Url.findOne({ shortID });

    if (!urlEntry) {
      return res.status(404).json({
        error: "Short ID not found",
      });
    }

    const userAgent = req.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const deviceType =
      result.device.type === "mobile" || result.device.type === "tablet"
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
    });

    return res.redirect(urlEntry.redirectUrl);
  } catch (error) {
    console.error("Redirect error:", error);

    return res.status(500).json({
      error: "Unable to process redirect",
    });
  }
}

async function getAnalytics(req, res) {
  try {
    const shortID = req.params.shortID;
    const userId = req.user && req.user._id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const urlEntry = await Url.findOne({ shortID: shortID });
    if (!urlEntry) {
      return res.status(404).json({ error: "Short ID not found" });
    }

    // Check if user is admin or owner of the URL
    const isAdmin = req.user.roles && req.user.roles.includes("admin");
    const isOwner = urlEntry.createdby.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({
          error: "Forbidden - You can only view analytics for URLs you created",
        });
    }

    const visitHistory = await ClickEvent.find({ urlId: urlEntry._id }).sort({
      timestamp: -1,
    });
    res.status(200).json({
      visitHistory,
      totalVisits: visitHistory.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  generateNewShortID,
  getRedirectUrl,
  getAnalytics,
  getallUrls,
};
