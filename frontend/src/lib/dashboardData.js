import instance from "../axios";

export const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const getDisplayName = (user) => {
  const value =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "there";
  return value.split(" ")[0];
};

export const getInitials = (user) => {
  const name =
    user?.name || user?.fullName || user?.username || user?.email || "Alok";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export const getShortUrl = (url) => {
  if (url?.url) return url.url;
  if (url?.shortUrl) return url.shortUrl;
  return `${instance.defaults.baseURL}/${url?.shortID || ""}`;
};

export const getClicks = (url) =>
  Array.isArray(url?.visitHistory)
    ? url.visitHistory.length
    : Number(url?.clicks || 0);

export const formatCompact = (value) => {
  if (value >= 1000)
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return String(value);
};

export const fetchUrls = async () => {
  const response = await instance.get("/urls/");
  return Array.isArray(response.data) ? response.data : [];
};

export const flattenVisits = (urls) =>
  urls.flatMap((url) =>
    (url.visitHistory || []).map((visit) => ({ ...visit, url })),
  );

export const formatDate = (
  value,
  options = { day: "2-digit", month: "short", year: "numeric" },
) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", options);
};

export const formatRelativeTime = (value) => {
  if (!value) return "—";
  const minutes = Math.max(
    1,
    Math.round((Date.now() - new Date(value).getTime()) / 60000),
  );
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} days ago`;
};
