import { claimGuestLinks } from "./urlApi";

export const GUEST_LINKS_KEY = "urlsortner_guest_links_v1";
export const POST_AUTH_INTENT_KEY = "urlsortner_post_auth_intent_v1";

const storageAvailable = () => typeof window !== "undefined" && Boolean(window.localStorage);

export const getGuestLinks = () => {
  if (!storageAvailable()) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_LINKS_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (link) => link && typeof link.shortID === "string" && typeof link.shortUrl === "string",
    );
  } catch {
    return [];
  }
};

const writeGuestLinks = (links) => {
  try {
    localStorage.setItem(GUEST_LINKS_KEY, JSON.stringify(links));
    return { ok: true };
  } catch {
    return { ok: false, error: "This link was created, but your browser could not save it locally." };
  }
};

export const saveGuestLink = (result) => {
  const linkId = String(result.linkId || result._id || "");
  const record = {
    localId: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${result.shortID}`,
    linkId,
    claimToken: result.claimToken || "",
    shortID: result.shortID,
    shortUrl: result.shortUrl || result.url,
    originalUrl: result.redirectUrl,
    title: result.title || "",
    createdAt: result.createdAt || new Date().toISOString(),
  };
  const existing = getGuestLinks().filter(
    (link) => !(link.linkId && link.linkId === linkId) && link.shortID !== record.shortID,
  );
  const links = [record, ...existing].slice(0, 50);
  return { ...writeGuestLinks(links), record, links };
};

export const removeClaimedGuestLinks = (claimed = []) => {
  const ids = new Set(claimed.map((item) => String(item.linkId)));
  const shortIDs = new Set(claimed.map((item) => item.shortID));
  return writeGuestLinks(
    getGuestLinks().filter(
      (link) => !ids.has(String(link.linkId)) && !shortIDs.has(link.shortID),
    ),
  );
};

export const migrateGuestLinks = async () => {
  const eligible = getGuestLinks().filter((link) => link.linkId && link.claimToken);
  if (!eligible.length) return { claimed: [], failed: [] };
  const result = await claimGuestLinks(
    eligible.map(({ linkId, claimToken }) => ({ linkId, claimToken })),
  );
  removeClaimedGuestLinks(result.claimed || []);
  return result;
};

export const savePostAuthIntent = (intent) => {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(POST_AUTH_INTENT_KEY, JSON.stringify(intent));
  } catch {
    // Authentication still works even when storage is unavailable.
  }
};

export const consumePostAuthIntent = () => {
  if (!storageAvailable()) return null;
  try {
    const intent = JSON.parse(localStorage.getItem(POST_AUTH_INTENT_KEY) || "null");
    localStorage.removeItem(POST_AUTH_INTENT_KEY);
    return intent;
  } catch {
    localStorage.removeItem(POST_AUTH_INTENT_KEY);
    return null;
  }
};
