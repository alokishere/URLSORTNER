import { useEffect, useRef, useState } from "react";
import { BarChart3, Building, Link2, MousePointerClick } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useAuthModal } from "../auth/authModalStore";
import { getRequestErrorMessage, createShortUrl } from "../lib/urlApi";
import { getGuestLinks, saveGuestLink, savePostAuthIntent } from "../lib/guestLinks";
import {
  BenefitsSection,
  CTASection,
  FAQSection,
  FeaturesSection,
  HeroSection,
  HowItWorksSection,
  PricingSection,
} from "../sections/landing";

const Brand = () => <img src="/primarylogo.avif" alt="Ek URL" className="h-10 w-auto max-w-32 object-contain object-left" />;

const LandingPage = () => {
  const openAuth = useAuthModal();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [guestLinks, setGuestLinks] = useState([]);
  const [storageError, setStorageError] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const requestInFlight = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setGuestLinks(getGuestLinks()), 0);
    return () => window.clearTimeout(timer);
  }, []);

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

    requestInFlight.current = true;
    setLoading(true);
    try {
      const created = await createShortUrl({ url: url.trim() });
      setResult(created);
      setUrl("");
      if (created.claimToken) {
        const saved = saveGuestLink(created);
        setGuestLinks(saved.links);
        setStorageError(saved.ok ? "" : saved.error);
      }
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, "We could not create that link. Check the URL and try again."));
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  };

  const copyShortUrl = async () => {
    const shortUrl = result?.shortUrl || result?.url;
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
    const destination = type === "qr"
      ? `/dashboard/links?qr=${encodeURIComponent(link.shortID)}`
      : `/dashboard/links/${encodeURIComponent(link.shortID)}/analytics`;
    savePostAuthIntent({ type, shortID: link.shortID, linkId: link.linkId || link._id || null });
    openAuth("login", destination);
  };

  return (
    <div className="landing-shell min-h-dvh overflow-x-clip text-(--primary-text)">
      <a href="#main-content" className="focus-ring sr-only z-50 rounded-lg bg-(--surface) px-4 py-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to main content</a>
      <header className="sticky top-0 z-30 border-b border-(--border)/75 bg-(--background)/92 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="focus-ring cursor-pointer rounded-lg text-left" aria-label="Back to top"><Brand /></button>
          <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-[13px] text-(--secondary-text) md:flex"><a href="#features">Features</a><a href="#analytics">Analytics</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></nav>
          <div className="flex items-center gap-1"><button type="button" onClick={() => openAuth("login")} className="focus-ring inline-flex min-h-10 cursor-pointer items-center rounded-lg px-2 text-xs font-medium sm:px-3 sm:text-[13px]">Log in</button><motion.button type="button" onClick={() => openAuth("register")} whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }} className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] bg-(--accent) px-3 text-xs font-semibold text-(--surface) sm:px-4 sm:text-[13px]">Get Started</motion.button></div>
        </div>
      </header>

      <main id="main-content">
        <HeroSection reduceMotion={reduceMotion} url={url} setUrl={setUrl} loading={loading} error={error} result={result} copied={copied} guestLinks={guestLinks} storageError={storageError} shortenUrl={shortenUrl} copyShortUrl={copyShortUrl} requestProtectedFeature={requestProtectedFeature} />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <PricingSection openAuth={openAuth} />
        <FAQSection openFaq={openFaq} setOpenFaq={setOpenFaq} reduceMotion={reduceMotion} />
        <CTASection openAuth={openAuth} reduceMotion={reduceMotion} />
      </main>

      <footer className="border-t border-(--border) bg-(--surface)">
        <div className="mx-auto grid max-w-[1120px] gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.35fr] lg:px-8 lg:py-14"><div className="max-w-xs"><Brand /><p className="mt-4 text-sm leading-6 text-(--secondary-text)">Clean links and useful analytics for the links you share.</p><div className="mt-5 flex items-center gap-3 text-(--secondary-text)"><Link2 className="h-4 w-4" aria-hidden="true" /><MousePointerClick className="h-4 w-4" aria-hidden="true" /><BarChart3 className="h-4 w-4" aria-hidden="true" /></div></div><div className="grid grid-cols-2 gap-x-8 gap-y-9 text-sm sm:grid-cols-3"><div><p className="font-semibold">Product</p><div className="mt-3 space-y-2.5 text-(--secondary-text)"><a className="block" href="#features">Features</a><a className="block" href="#analytics">Analytics</a><a className="block" href="#features">Custom domains</a><a className="block" href="#pricing">Pricing</a></div></div><div><p className="font-semibold">Resources</p><div className="mt-3 space-y-2.5 text-(--secondary-text)"><button type="button" onClick={() => navigate("/dashboard")} className="block cursor-pointer text-left">Documentation</button><button type="button" onClick={() => navigate("/dashboard/tools")} className="block cursor-pointer text-left">API reference</button><a className="block" href="#features">Blog</a><a className="block" href="#faq">Status</a></div></div><div><p className="font-semibold">Legal</p><div className="mt-3 space-y-2.5 text-(--secondary-text)"><a className="block" href="#faq">Privacy</a><a className="block" href="#faq">Terms</a><a className="block" href="#faq">Security</a><a className="block" href="#faq">DPA</a></div></div></div></div>
        <div className="border-t border-(--border)"><div className="mx-auto flex max-w-[1120px] flex-col gap-3 px-4 py-5 text-xs text-(--secondary-text) sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span>© 2026 Ek URL. All rights reserved.</span><Link target="_blank" to="https://www.alok.company/" className="inline-flex items-center gap-1.5"><Building className="h-3.5 w-3.5" aria-hidden="true" />by ALOK LABS</Link></div></div>
      </footer>
    </div>
  );
};

export default LandingPage;
