import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  Globe2,
  LayoutDashboard,
  Link as LinkIcon,
  Link2,
  LockKeyhole,
  MousePointerClick,
  Play,
  QrCode,
  Settings,
  ShieldCheck,
  Sparkles,
  Zap,
  Building,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthModal } from "../auth/authModalStore";
import { Reveal, Stagger, StaggerItem } from "../components/MotionPrimitives";
import { createShortUrl, getRequestErrorMessage } from "../lib/urlApi";
import {
  getGuestLinks,
  saveGuestLink,
  savePostAuthIntent,
} from "../lib/guestLinks";

const features = [
  {
    icon: Zap,
    title: "Instant Shortening",
    description:
      "Create clean links in one click with automatic titles and tags.",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Clicks, referrers, geography and devices in real time.",
  },
  {
    icon: Globe2,
    title: "Custom Domains",
    description: "Branded domains are on the roadmap and coming soon.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    description: "99.99% uptime, SSL by default and spam protection.",
  },
];

const steps = [
  {
    number: "01",
    icon: LinkIcon,
    title: "Paste URL",
    description: "Drop in any long link. We clean it up automatically.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Create Short Link",
    description: "Get a short URL, QR code and editable slug instantly.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Track Performance",
    description: "Watch clicks, sources and geography in real time.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For trying short links.",
    features: [
      "100 links / month",
      "Basic click stats",
      "Ek URL domain",
      "QR codes",
    ],
    action: "Start for free",
  },
  {
    name: "Pro",
    price: "$12",
    description: "For creators and growth.",
    features: [
      "10,000 links / month",
      "Full analytics + history",
      "1 custom domain",
      "UTM builder + API",
    ],
    action: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Business",
    price: "$49",
    description: "For teams at scale.",
    features: [
      "Unlimited links",
      "Team workspaces + SSO",
      "Multiple domains",
      "Priority support + SLA",
    ],
    action: "Talk to sales",
  },
];

const faqItems = [
  {
    question: "How fast can I shorten a link?",
    answer:
      "Paste any URL and get a short link instantly. No signup is needed for your first links.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes. Custom domains are available on paid plans with SSL and guided DNS setup.",
  },
  {
    question: "What analytics do I get?",
    answer:
      "You can review clicks, visit history, locations, devices, browsers, and referrers when the backend records them.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. The free plan is designed for trying short links before you need advanced controls.",
  },
  {
    question: "Can I manage links as a team?",
    answer:
      "Team workspaces are represented in the Business plan and can be enabled when backend support is available.",
  },
];

const chartValues = [35, 44, 39, 52, 49, 63, 57, 70, 64, 82, 59, 74, 79, 88];
const topLinks = [
  ["go.acme.com/launch", "8,412", "92%"],
  ["go.acme.com/pricing", "5,209", "68%"],
  ["go.acme.com/blog-q3", "3,884", "50%"],
  ["go.acme.com/demo", "2,103", "29%"],
];

const Brand = () => (
  <img
    src="/primarylogo.png"
    alt="Ek URL"
    className="h-10 w-auto max-w-32 object-contain object-left"
  />
);

const ProductPreview = () => {
  const navItems = [
    [LayoutDashboard, "Overview"],
    [Link2, "Links"],
    [BarChart3, "Analytics"],
    [Globe2, "Domains"],
    [QrCode, "QR Codes"],
    [Settings, "Settings"],
  ];
  const metrics = [
    ["Total clicks", "48,290", "+12.4%"],
    ["Active links", "1,842", "+3.1%"],
    ["Click-through rate", "4.8%", "+0.6%"],
    ["Top country", "United States", "32% share"],
  ];

  return (
    <div
      className="overflow-hidden rounded-[18px] border border-(--border) bg-(--surface) shadow-[0_22px_65px_rgba(31,33,28,0.08)]"
      aria-label="Static product preview using illustrative analytics data"
    >
      <div className="flex h-11 items-center justify-between border-b border-(--border) px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="hidden items-center gap-1.5 sm:flex"
            aria-hidden="true"
          >
            <i className="h-2 w-2 rounded-full bg-(--border)" />
            <i className="h-2 w-2 rounded-full bg-(--border)" />
            <i className="h-2 w-2 rounded-full bg-(--border)" />
          </span>
          <span className="truncate rounded-full border border-(--border) bg-(--background) px-3 py-1 text-[10px] text-(--secondary-text)">
            app.ekurl.in/dashboard
          </span>
        </div>
        <span className="ml-2 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-(--border) px-2.5 py-1 text-[10px] text-(--primary-text)">
          <CalendarDays className="h-3 w-3" aria-hidden="true" />
          Last 30 days
          <ChevronDown className="h-3 w-3" aria-hidden="true" />
        </span>
      </div>
      <div className="grid md:grid-cols-[176px_minmax(0,1fr)]">
        <aside className="hidden border-r border-(--border) bg-[#fafbf8] p-3 md:flex md:flex-col">
          <div className="space-y-1">
            {navItems.map(([Icon, label], index) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[11px] ${index === 0 ? "bg-(--surface-soft) font-semibold text-(--primary-text)" : "text-(--secondary-text)"}`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
          <div className="mt-auto rounded-xl border border-(--border) bg-(--surface) p-3">
            <p className="text-[9px] text-(--secondary-text)">Monthly usage</p>
            <p className="mt-1 text-[11px] font-semibold">
              6,840 / 10,000 clicks
            </p>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-(--surface-soft)">
              <div className="h-full w-[68%] rounded-full bg-(--primary)" />
            </div>
          </div>
        </aside>
        <div className="min-w-0 p-3 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-(--primary-text) sm:text-base">
                Link performance
              </h3>
              <p className="mt-0.5 text-[10px] text-(--secondary-text)">
                Updated 2 minutes ago
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-(--border) px-3 py-2 text-[10px] text-(--secondary-text)">
                Export
              </span>
              <span className="rounded-lg bg-(--accent) px-3 py-2 text-[10px] font-semibold text-(--surface)">
                + New link
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
            {metrics.map(([label, value, helper]) => (
              <div
                key={label}
                className="min-w-0 rounded-xl border border-(--border) bg-(--surface) p-3"
              >
                <p className="truncate text-[9px] text-(--secondary-text)">
                  {label}
                </p>
                <p className="mt-1 truncate text-base font-semibold tracking-[-0.025em] text-(--primary-text)">
                  {value}
                </p>
                <span className="mt-1 inline-flex rounded-full bg-(--surface-soft) px-1.5 py-0.5 text-[8px] text-(--primary-deep)">
                  {helper}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-[1.35fr_.95fr]">
            <div className="rounded-xl border border-(--border) p-3.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-(--primary-text)">
                  Clicks over time
                </span>
                <span className="inline-flex items-center gap-1.5 text-(--secondary-text)">
                  <i className="h-1.5 w-1.5 rounded-full bg-(--primary)" />
                  All links
                </span>
              </div>
              <div className="mt-4 flex h-32 items-end gap-1.5 sm:gap-2">
                {chartValues.map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className={`flex-1 rounded-t-[5px] ${index === chartValues.length - 1 ? "bg-(--primary)" : "bg-(--surface-soft)"}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[8px] text-(--secondary-text)">
                <span>Sep 19</span>
                <span>Sep 29</span>
                <span>Oct 9</span>
                <span>Oct 18</span>
              </div>
            </div>
            <div className="rounded-xl border border-(--border) p-3.5">
              <p className="text-[10px] font-semibold text-(--primary-text)">
                Top links
              </p>
              <div className="mt-3 space-y-3">
                {topLinks.map(([link, clicks, width]) => (
                  <div key={link}>
                    <div className="flex items-center justify-between gap-2 text-[9px]">
                      <span className="min-w-0 truncate text-(--primary-text)">
                        {link}
                      </span>
                      <span className="shrink-0 text-(--secondary-text)">
                        {clicks}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-(--surface-soft)">
                      <div
                        className="h-full rounded-full bg-(--primary)"
                        style={{ width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const openAuth = useAuthModal();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [guestLinks, setGuestLinks] = useState(getGuestLinks);
  const [storageError, setStorageError] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const requestInFlight = useRef(false);
  const shortUrl = result?.shortUrl || result?.url || "";

  const shortenUrl = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);
    setCopied(false);
    if (requestInFlight.current) return;
    if (!url.trim()) {
      setError("Paste a URL to create a short link.");
      return;
    }
    try {
      new URL(url.trim());
    } catch {
      setError("Enter a complete URL, including https://.");
      return;
    }
    setLoading(true);
    requestInFlight.current = true;
    let created;
    try {
      created = await createShortUrl({ url: url.trim() });
    } catch (requestError) {
      setError(
        getRequestErrorMessage(
          requestError,
          "We could not create that link. Check the URL and try again.",
        ),
      );
      return;
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
    setError("");
    setResult(created);
    setUrl("");
    if (created.claimToken) {
      const saved = saveGuestLink(created);
      setGuestLinks(saved.links);
      setStorageError(saved.ok ? "" : saved.error);
    }
  };

  const copyShortUrl = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const requestProtectedFeature = (type, link) => {
    const destination =
      type === "qr"
        ? `/dashboard/links?qr=${encodeURIComponent(link.shortID)}`
        : `/dashboard/links/${encodeURIComponent(link.shortID)}/analytics`;
    savePostAuthIntent({
      type,
      shortID: link.shortID,
      linkId: link.linkId || link._id || null,
    });
    openAuth("login", destination);
  };

  return (
    <div className="landing-shell min-h-dvh overflow-x-clip text-(--primary-text)">
      <a
        href="#main-content"
        className="focus-ring sr-only z-50 rounded-lg bg-(--surface) px-4 py-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-30 border-b border-(--border)/75 bg-(--background)/92 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="focus-ring cursor-pointer rounded-lg text-left"
            aria-label="Back to top"
          >
            <Brand />
          </button>
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-7 text-[13px] text-(--secondary-text) md:flex"
          >
            <a
              className="transition-colors hover:text-(--primary-text)"
              href="#features"
            >
              Features
            </a>
            <a
              className="transition-colors hover:text-(--primary-text)"
              href="#analytics"
            >
              Analytics
            </a>
            <a
              className="transition-colors hover:text-(--primary-text)"
              href="#pricing"
            >
              Pricing
            </a>
            <a
              className="transition-colors hover:text-(--primary-text)"
              href="#faq"
            >
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="focus-ring inline-flex min-h-10 cursor-pointer items-center whitespace-nowrap rounded-lg px-2 text-xs font-medium text-(--primary-text) transition-colors hover:bg-(--surface-soft) sm:px-3 sm:text-[13px]"
            >
              Log in
            </button>
            <motion.button
              type="button"
              onClick={() => openAuth("register")}
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center whitespace-nowrap rounded-[10px] bg-(--accent) px-3 text-xs font-semibold text-(--surface) transition-colors hover:bg-(--accent-deep) sm:px-4 sm:text-[13px]"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="mx-auto max-w-[1120px] px-4 pb-24 pt-16 text-center sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-24">
          <Reveal className="mx-auto flex max-w-[760px] flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1.5 text-[11px] font-medium text-(--secondary-text)">
              <span className="h-1.5 w-1.5 rounded-full bg-(--primary)" />
              Shorten and save guest links without signing up
            </div>
            <h1 className="mt-6 text-balance text-[2.9rem] font-bold leading-[0.98] tracking-[-0.055em] text-(--primary-text) sm:text-[4.1rem] lg:text-[4.5rem]">
              <span className="block">Short links.</span>
              <span className="block">Real possibilities.</span>
            </h1>
            <p className="mt-5 max-w-[520px] text-pretty text-base leading-7 text-(--secondary-text) sm:text-lg">
              Turn long URLs into clean, memorable links with powerful
              analytics.
            </p>
            <form
              onSubmit={shortenUrl}
              className="mt-8 w-full max-w-[580px] text-left"
            >
              <label htmlFor="landing-url" className="sr-only">
                Paste your long URL
              </label>
              <div className="flex flex-col gap-2 rounded-[16px] border border-(--border) bg-(--surface) p-1.5 shadow-[0_8px_26px_rgba(31,33,28,0.04)] transition-[border-color,box-shadow] duration-200 focus-within:border-(--primary) focus-within:ring-4 focus-within:ring-(--secondary)/55 sm:flex-row">
                <span className="pointer-events-none hidden items-center pl-3 text-(--secondary-text) sm:flex">
                  <Link2 className="h-4 w-4" aria-hidden="true" />
                </span>
                <input
                  id="landing-url"
                  type="url"
                  inputMode="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="Paste your long URL here..."
                  aria-describedby={error ? "landing-url-error" : undefined}
                  className="min-h-12 min-w-0 flex-1 rounded-xl bg-transparent px-3 text-base text-(--primary-text) outline-none placeholder:text-(--secondary-text)/80 sm:text-sm"
                />
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={reduceMotion ? undefined : { y: -1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  className="focus-ring inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--accent) px-6 text-sm font-semibold text-(--surface) transition-colors hover:bg-(--accent-deep) disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Shorten URL"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </motion.button>
              </div>
              {error && (
                <p
                  id="landing-url-error"
                  role="alert"
                  className="mt-2 rounded-xl border border-[#d9a79b] bg-[#f8e9e5] px-3 py-2 text-sm text-(--danger)"
                >
                  {error}
                </p>
              )}
              {result && (
                <div className="mt-3 rounded-xl border border-(--primary)/35 bg-(--secondary)/45 p-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      className="hidden h-5 w-5 shrink-0 text-(--success) sm:block"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-(--success)">
                        Short link created
                      </p>
                      <p className="truncate text-sm font-semibold text-(--primary-text)">
                        {shortUrl}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={copyShortUrl}
                      className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-(--border) bg-(--surface) px-3 text-xs font-semibold text-(--primary-text) transition-colors hover:bg-(--surface-soft)"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => requestProtectedFeature("qr", result)}
                      className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-(--border) bg-(--surface) px-3 text-xs font-semibold text-(--primary-text) transition-colors hover:bg-(--surface-soft)"
                    >
                      <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                      QR code
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        requestProtectedFeature("analytics", result)
                      }
                      className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-(--accent) px-3 text-xs font-semibold text-(--surface) transition-colors hover:bg-(--accent-deep)"
                    >
                      <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                      Get analytics
                    </button>
                  </div>
                </div>
              )}
              {storageError && (
                <p role="alert" className="mt-2 text-xs text-(--danger)">
                  {storageError}
                </p>
              )}
            </form>
            <div className="mt-6 w-full max-w-[700px] text-left">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-(--primary-text)">
                    Recently shortened
                  </p>
                  <p className="mt-1 text-[11px] text-(--secondary-text)">
                    Guest links stay in this browser until you sign in.
                  </p>
                </div>
                {guestLinks.length > 0 && (
                  <span className="text-[11px] text-(--secondary-text)">
                    {guestLinks.length} saved
                  </span>
                )}
              </div>
              {guestLinks.length ? (
                <div className="mt-3 grid gap-2">
                  {guestLinks.slice(0, 3).map((link) => (
                    <div
                      key={link.localId || link.shortID}
                      className="flex flex-col gap-3 rounded-xl border border-(--border) bg-(--surface) p-3 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-(--primary-text)">
                          {link.shortUrl}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-(--secondary-text)">
                          {link.originalUrl}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(link.shortUrl)
                          }
                          className="focus-ring inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-(--surface-soft)"
                          aria-label={`Copy ${link.shortID}`}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestProtectedFeature("qr", link)}
                          className="focus-ring inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-(--surface-soft)"
                          aria-label={`Sign in to create a QR code for ${link.shortID}`}
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            requestProtectedFeature("analytics", link)
                          }
                          className="focus-ring inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold hover:bg-(--surface-soft)"
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                          Analytics
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-(--border) bg-(--surface)/60 px-4 py-5 text-center text-xs text-(--secondary-text)">
                  Your newly shortened links will appear here.
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() =>
                document
                  .querySelector("#analytics")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="focus-ring mt-4 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-xs font-semibold text-(--primary-text) transition-colors hover:bg-(--surface-soft)"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              View Live Demo
            </button>
            <div className="mt-5 flex max-w-full flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-(--secondary-text)">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Free to start
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                No credit card required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Enterprise-ready security
              </span>
            </div>
          </Reveal>
        </section>

        <section
          id="features"
          className="landing-section border-t border-(--border)/80 bg-(--surface)"
        >
          <div className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
            <Reveal className="mx-auto max-w-[660px] text-center">
              <p className="text-xs font-medium text-(--primary-deep)">
                Features
              </p>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.045em] sm:text-[2.65rem]">
                Everything you need to manage links
              </h2>
              <p className="mt-4 text-base leading-7 text-(--secondary-text)">
                A calm, precise toolkit for teams that share a lot of links.
              </p>
            </Reveal>
            <Stagger className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description }) => (
                <StaggerItem
                  key={title}
                  className="rounded-[16px] border border-(--border) bg-(--surface) p-5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-(--primary)/65 hover:shadow-[0_12px_30px_rgba(31,33,28,0.05)]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-(--border) bg-(--background) text-(--primary-text)">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-sm font-semibold text-(--primary-text)">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-(--secondary-text)">
                    {description}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal
              id="analytics"
              delay={0.08}
              className="landing-section mt-14 sm:mt-16"
            >
              <ProductPreview />
            </Reveal>
          </div>
        </section>

        <section className="border-y border-(--border)/80 bg-(--background)">
          <div className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
            <Reveal className="mx-auto max-w-[620px] text-center">
              <p className="text-xs font-medium text-(--primary-deep)">
                How it works
              </p>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.045em] sm:text-[2.65rem]">
                From long link to insight in seconds
              </h2>
            </Reveal>
            <Stagger className="mt-12 grid gap-4 md:grid-cols-3">
              {steps.map(({ number, icon: Icon, title, description }) => (
                <StaggerItem
                  key={number}
                  className="rounded-[16px] border border-(--border) bg-(--surface) p-5 sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--surface-soft) text-(--primary-deep)">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[11px] text-(--secondary-text)">
                      {number}
                    </span>
                  </div>
                  <h3 className="mt-8 text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-(--secondary-text)">
                    {description}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section className="landing-section bg-(--surface)">
          <div className="mx-auto grid max-w-[1120px] items-center gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:px-8 lg:py-28">
            <Reveal>
              <p className="text-xs font-medium text-(--primary-deep)">
                Custom domains
              </p>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.045em] sm:text-[2.65rem]">
                Your brand. Shorter links.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-(--secondary-text)">
                Replace generic short URLs with your own domain. Every click
                reinforces trust and lifts click-through rates.
              </p>
              <div className="mt-7 space-y-3 text-sm text-(--primary-text)">
                {[
                  "Free SSL and automatic setup",
                  "Unlimited branded slugs on paid plans",
                  "Team-wide link consistency",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-(--surface-soft) text-(--primary-deep)">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
              <button
                type="button"
                aria-disabled="true"
                className="focus-ring mt-8 inline-flex min-h-11 cursor-default items-center gap-2 rounded-[10px] bg-(--accent)/70 px-5 text-sm font-semibold text-(--surface)"
              >
                Coming soon{" "}
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              </button>
            </Reveal>
            <Reveal
              delay={0.08}
              className="rounded-[18px] border border-(--border) bg-(--background) p-3 sm:p-4"
            >
              <div className="rounded-[14px] border border-(--border) bg-(--surface) p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold">Branded preview</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-(--surface-soft) px-2 py-1 text-[9px] text-(--success)">
                    <i className="h-1.5 w-1.5 rounded-full bg-(--success)" />
                    Connected
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-(--border) p-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-(--accent) text-sm font-semibold text-(--surface)">
                    A
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      go.acme.com/launch
                    </p>
                    <p className="truncate text-[10px] text-(--secondary-text)">
                      acme.com/new-product-launch-page
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-(--border) p-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-(--secondary) text-(--primary-deep)">
                    <QrCode className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">QR for packaging</p>
                    <p className="text-[10px] text-(--secondary-text)">
                      2,140 scans this month
                    </p>
                  </div>
                  <ExternalLink
                    className="h-4 w-4 text-(--secondary-text)"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 inline-flex items-center gap-2 text-[10px] text-(--secondary-text)">
                  <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                  SSL secured · DNS verified in 42s
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="pricing"
          className="landing-section border-y border-(--border)/80 bg-(--background)"
        >
          <div className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
            <Reveal className="mx-auto max-w-[620px] text-center">
              <p className="text-xs font-medium text-(--primary-deep)">
                Pricing
              </p>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.045em] sm:text-[2.65rem]">
                Simple pricing that scales
              </h2>
              <p className="mt-4 text-sm leading-6 text-(--secondary-text)">
                Plan limits are illustrative until billing is connected.
              </p>
            </Reveal>
            <Stagger className="mx-auto mt-10 grid max-w-[940px] gap-4 lg:grid-cols-3">
              {plans.map((plan) => (
                <StaggerItem
                  key={plan.name}
                  className={`rounded-[16px] border p-5 sm:p-6 ${plan.featured ? "border-(--accent) bg-(--accent) text-(--surface) shadow-[0_18px_45px_rgba(31,33,28,0.14)]" : "border-(--border) bg-(--surface)"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">{plan.name}</h3>
                    {plan.featured && (
                      <span className="rounded-full bg-(--surface)/12 px-2 py-1 text-[9px] font-medium">
                        Most popular
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-5 text-4xl font-bold tracking-[-0.055em] ${plan.featured ? "text-(--surface)" : "text-(--primary-text)"}`}
                  >
                    {plan.price}
                    <span
                      className={`ml-1 text-xs font-normal tracking-normal ${plan.featured ? "text-(--surface)/60" : "text-(--secondary-text)"}`}
                    >
                      /month
                    </span>
                  </p>
                  <p
                    className={`mt-2 text-sm ${plan.featured ? "text-(--surface)/65" : "text-(--secondary-text)"}`}
                  >
                    {plan.description}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      openAuth(plan.featured ? "register" : "login")
                    }
                    className={`focus-ring mt-6 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-[10px] text-sm font-semibold transition-colors ${plan.featured ? "bg-(--surface) text-(--accent) hover:bg-(--secondary)" : "border border-(--border) bg-(--surface) text-(--primary-text) hover:bg-(--surface-soft)"}`}
                  >
                    {plan.action}
                  </button>
                  <div
                    className={`mt-6 space-y-3 border-t pt-5 text-xs ${plan.featured ? "border-(--surface)/15" : "border-(--border)"}`}
                  >
                    {plan.features.map((item) => (
                      <div key={item} className="flex items-center gap-2.5">
                        <Check
                          className={`h-3.5 w-3.5 ${plan.featured ? "text-(--primary)" : "text-(--primary-deep)"}`}
                          aria-hidden="true"
                        />
                        {item}
                      </div>
                    ))}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section id="faq" className="landing-section bg-(--surface)">
          <div className="mx-auto max-w-[760px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
            <Reveal className="text-center">
              <p className="text-xs font-medium text-(--primary-deep)">FAQ</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] sm:text-[2.65rem]">
                Questions, answered
              </h2>
            </Reveal>
            <Reveal delay={0.06} className="mt-10 border-y border-(--border)">
              {faqItems.map((item, index) => {
                const open = openFaq === index;
                return (
                  <div
                    key={item.question}
                    className="border-b border-(--border) last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? -1 : index)}
                      aria-expanded={open}
                      className="focus-ring flex min-h-14 w-full cursor-pointer items-center justify-between gap-5 rounded-lg py-4 text-left text-sm font-semibold text-(--primary-text)"
                    >
                      {item.question}
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-(--secondary-text) transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={
                            reduceMotion ? false : { opacity: 0, height: 0 }
                          }
                          animate={{ opacity: 1, height: "auto" }}
                          exit={
                            reduceMotion ? undefined : { opacity: 0, height: 0 }
                          }
                          transition={{ duration: reduceMotion ? 0 : 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-2xl pb-5 text-sm leading-6 text-(--secondary-text)">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </Reveal>
          </div>
        </section>

        <section className="border-t border-(--border)/80 bg-(--surface)">
          <div className="mx-auto max-w-[1120px] px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28">
            <Reveal className="rounded-[18px] bg-(--secondary)/55 px-6 py-14 text-center sm:px-12 sm:py-16">
              <h2 className="text-balance text-3xl font-bold tracking-[-0.045em] sm:text-[2.65rem]">
                Turn your links into opportunities.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-(--secondary-text)">
                Start free in seconds. Upgrade when your audience grows.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">
                <motion.button
                  type="button"
                  onClick={() => openAuth("register")}
                  whileHover={reduceMotion ? undefined : { y: -1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] bg-(--accent) px-5 text-sm font-semibold text-(--surface) transition-colors hover:bg-(--accent-deep)"
                >
                  Get Started{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </motion.button>
                <a
                  href="#pricing"
                  className="focus-ring inline-flex min-h-11 items-center rounded-[10px] px-4 text-sm font-semibold text-(--primary-text) transition-colors hover:bg-(--surface)/65"
                >
                  Compare plans
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-(--border) bg-(--surface)">
        <div className="mx-auto grid max-w-[1120px] gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.35fr] lg:px-8 lg:py-14">
          <div className="max-w-xs">
            <Brand />
            <p className="mt-4 text-sm leading-6 text-(--secondary-text)">
              Clean links, honest analytics, and domains you own.
            </p>
            <div className="mt-5 flex items-center gap-3 text-(--secondary-text)">
              <Link2 className="h-4 w-4" aria-hidden="true" />
              <MousePointerClick className="h-4 w-4" aria-hidden="true" />
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-9 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-(--primary-text)">Product</p>
              <div className="mt-3 space-y-2.5 text-(--secondary-text)">
                <a
                  className="block hover:text-(--primary-text)"
                  href="#features"
                >
                  Features
                </a>
                <a
                  className="block hover:text-(--primary-text)"
                  href="#analytics"
                >
                  Analytics
                </a>
                <a
                  className="block hover:text-(--primary-text)"
                  href="#features"
                >
                  Custom domains
                </a>
                <a
                  className="block hover:text-(--primary-text)"
                  href="#pricing"
                >
                  Pricing
                </a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-(--primary-text)">Resources</p>
              <div className="mt-3 space-y-2.5 text-(--secondary-text)">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="block cursor-pointer text-left hover:text-(--primary-text)"
                >
                  Documentation
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/tools")}
                  className="block cursor-pointer text-left hover:text-(--primary-text)"
                >
                  API reference
                </button>
                <a
                  className="block hover:text-(--primary-text)"
                  href="#features"
                >
                  Blog
                </a>
                <a className="block hover:text-(--primary-text)" href="#faq">
                  Status
                </a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-(--primary-text)">Legal</p>
              <div className="mt-3 space-y-2.5 text-(--secondary-text)">
                <a className="block hover:text-(--primary-text)" href="#faq">
                  Privacy
                </a>
                <a className="block hover:text-(--primary-text)" href="#faq">
                  Terms
                </a>
                <a className="block hover:text-(--primary-text)" href="#faq">
                  Security
                </a>
                <a className="block hover:text-(--primary-text)" href="#faq">
                  DPA
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-(--border)">
          <div className="mx-auto flex max-w-[1120px] flex-col gap-3 px-4 py-5 text-xs text-(--secondary-text) sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <span>© 2026 Ek URL. All rights reserved.</span>
            <Link target="_blank" to="https://www.alok.company/" className="inline-flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5" aria-hidden="true" />
              by ALOK LABS 
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
