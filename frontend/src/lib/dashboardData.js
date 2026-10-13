import instance from "../axios";

export const DASHBOARD_LIMIT = 1000;

const demoNow = Date.now();

export const DEMO_URLS = [
  {
    _id: "demo-instagram",
    shortID: "8k3m2a",
    redirectUrl: "https://www.instagram.com/_alok_js",
    createdAt: new Date(demoNow - 7 * 86400000).toISOString(),
    visitHistory: [
      {
        _id: "demo-1",
        timestamp: new Date(demoNow - 2 * 3600000).toISOString(),
      },
      {
        _id: "demo-2",
        timestamp: new Date(demoNow - 11 * 3600000).toISOString(),
      },
    ],
  },
  {
    _id: "demo-youtube",
    shortID: "4q1x9p",
    redirectUrl: "https://www.youtube.com/@alok_tech",
    createdAt: new Date(demoNow - 8 * 86400000).toISOString(),
    visitHistory: [
      {
        _id: "demo-3",
        timestamp: new Date(demoNow - 1 * 86400000).toISOString(),
      },
      {
        _id: "demo-4",
        timestamp: new Date(demoNow - 2 * 86400000).toISOString(),
      },
      {
        _id: "demo-5",
        timestamp: new Date(demoNow - 4 * 86400000).toISOString(),
      },
    ],
  },
  {
    _id: "demo-telegram",
    shortID: "6m0t7r",
    redirectUrl: "https://t.me/alok_js",
    createdAt: new Date(demoNow - 9 * 86400000).toISOString(),
    visitHistory: [
      {
        _id: "demo-6",
        timestamp: new Date(demoNow - 3 * 86400000).toISOString(),
      },
    ],
  },
  {
    _id: "demo-github",
    shortID: "2s5v8n",
    redirectUrl: "https://github.com/alokishere",
    createdAt: new Date(demoNow - 10 * 86400000).toISOString(),
    visitHistory: [],
  },
];

export const DEMO_INSIGHTS = {
  countries: [
    { label: "India", value: "6.2K", percent: 50 },
    { label: "United States", value: "1.8K", percent: 15 },
    { label: "United Kingdom", value: "780", percent: 6 },
    { label: "Canada", value: "540", percent: 4 },
    { label: "Germany", value: "430", percent: 3 },
  ],
  referrers: [
    { label: "Direct", value: "4.8K", percent: 38, color: "#6f8069" },
    { label: "Instagram", value: "2.7K", percent: 22, color: "#d2a25d" },
    { label: "WhatsApp", value: "1.9K", percent: 15, color: "#4da776" },
    { label: "Google", value: "1.2K", percent: 10, color: "#9aae8f" },
    { label: "YouTube", value: "680", percent: 5, color: "#e26b4a" },
    { label: "Others", value: "1.1K", percent: 9, color: "#b9b9b4" },
  ],
  devices: [
    { label: "Mobile", value: "8.1K", percent: 65, color: "#6f8069" },
    { label: "Desktop", value: "3.2K", percent: 26, color: "#93a88d" },
    { label: "Tablet", value: "650", percent: 5, color: "#c9d5c0" },
    { label: "Others", value: "1.2K", percent: 10, color: "#b9b9b4" },
  ],
  browsers: [
    { label: "Chrome", value: "6.8K", percent: 55 },
    { label: "Safari", value: "2.4K", percent: 19 },
    { label: "Edge", value: "1.1K", percent: 9 },
    { label: "Firefox", value: "860", percent: 7 },
  ],
};

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
