import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Check, CheckCircle2, Copy, Link2, Play, QrCode } from "lucide-react";
import { Reveal } from "../../components/MotionPrimitives";

const HeroSection = ({
  reduceMotion,
  url,
  setUrl,
  loading,
  error,
  result,
  copied,
  guestLinks,
  storageError,
  shortenUrl,
  copyShortUrl,
  requestProtectedFeature,
}) => {
  const shortUrl = result?.shortUrl || result?.url || "";

  return (
    <section className="mx-auto max-w-[1120px] px-4 pb-24 pt-16 text-center sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-24">
      <Reveal className="mx-auto flex max-w-[760px] flex-col items-center">
        <h1 className="mt-5 text-balance text-[2.9rem] font-bold leading-[0.98] tracking-[-0.055em] text-(--primary-text) sm:text-[4.1rem] lg:text-[4.5rem]">
          <span className="block">Short links.</span>
          <span className="block">Real possibilities.</span>
        </h1>
        <p className="mt-5 max-w-[520px] text-pretty text-base leading-7 text-(--secondary-text) sm:text-lg">
          Ek URL is a URL shortener for creating shareable links and reviewing recorded clicks.
        </p>
        <form onSubmit={shortenUrl} className="mt-8 w-full max-w-[580px] text-left">
          <label htmlFor="landing-url" className="sr-only">Paste your long URL</label>
          <div className="flex flex-col gap-2 rounded-[16px] border border-(--border) bg-(--surface) p-1.5 shadow-[0_8px_26px_rgba(31,33,28,0.04)] transition-[border-color,box-shadow] duration-200 focus-within:border-(--primary) focus-within:ring-4 focus-within:ring-(--secondary)/55 sm:flex-row">
            <span className="pointer-events-none hidden items-center pl-3 text-(--secondary-text) sm:flex"><Link2 className="h-4 w-4" aria-hidden="true" /></span>
            <input id="landing-url" type="url" inputMode="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Paste your long URL here..." aria-describedby={error ? "landing-url-error" : undefined} className="min-h-12 min-w-0 flex-1 rounded-xl bg-transparent px-3 text-base text-(--primary-text) outline-none placeholder:text-(--secondary-text)/80 sm:text-sm" />
            <motion.button type="submit" disabled={loading} whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }} className="focus-ring inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--accent) px-6 text-sm font-semibold text-(--surface) transition-colors hover:bg-(--accent-deep) disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Creating..." : "Shorten URL"}<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </motion.button>
          </div>
          {error && <p id="landing-url-error" role="alert" className="mt-2 rounded-xl border border-(--danger)/35 bg-(--danger-soft) px-3 py-2 text-sm text-(--danger)">{error}</p>}
          {result && (
            <div className="mt-3 rounded-xl border border-(--primary)/35 bg-(--secondary)/45 p-3">
              <div className="flex items-center gap-3"><CheckCircle2 className="hidden h-5 w-5 shrink-0 text-(--success) sm:block" aria-hidden="true" /><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-(--success)">Short link created</p><p className="truncate text-sm font-semibold text-(--primary-text)">{shortUrl}</p></div></div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button type="button" onClick={copyShortUrl} className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-(--border) bg-(--surface) px-3 text-xs font-semibold text-(--primary-text) hover:bg-(--surface-soft)"><Copy className="h-3.5 w-3.5" aria-hidden="true" />{copied ? "Copied" : "Copy"}</button>
                <button type="button" onClick={() => requestProtectedFeature("qr", result)} className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-(--border) bg-(--surface) px-3 text-xs font-semibold text-(--primary-text) hover:bg-(--surface-soft)"><QrCode className="h-3.5 w-3.5" aria-hidden="true" />QR code</button>
                <button type="button" onClick={() => requestProtectedFeature("analytics", result)} className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-(--accent) px-3 text-xs font-semibold text-(--surface) hover:bg-(--accent-deep)"><BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />Get analytics</button>
              </div>
            </div>
          )}
          {storageError && <p role="alert" className="mt-2 text-xs text-(--danger)">{storageError}</p>}
        </form>
        <div className="mt-6 w-full max-w-[700px] text-left">
          <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold text-(--primary-text)">Recently shortened</p><p className="mt-1 text-[11px] text-(--secondary-text)">Guest links stay in this browser until you sign in.</p></div>{guestLinks.length > 0 && <span className="text-[11px] text-(--secondary-text)">{guestLinks.length} saved</span>}</div>
          {guestLinks.length ? <div className="mt-3 grid gap-2">{guestLinks.slice(0, 3).map((link) => <div key={link.localId || link.shortID} className="flex flex-col gap-3 rounded-xl border border-(--border) bg-(--surface) p-3 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-(--primary-text)">{link.shortUrl}</p><p className="mt-0.5 truncate text-[11px] text-(--secondary-text)">{link.originalUrl}</p></div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => navigator.clipboard.writeText(link.shortUrl)} className="focus-ring inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-(--surface-soft)" aria-label={`Copy ${link.shortID}`}><Copy className="h-3.5 w-3.5" /></button><button type="button" onClick={() => requestProtectedFeature("qr", link)} className="focus-ring inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-(--surface-soft)" aria-label={`Sign in to create a QR code for ${link.shortID}`}><QrCode className="h-3.5 w-3.5" /></button><button type="button" onClick={() => requestProtectedFeature("analytics", link)} className="focus-ring inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold hover:bg-(--surface-soft)"><BarChart3 className="h-3.5 w-3.5" />Analytics</button></div></div>)}</div> : <div className="mt-3 rounded-xl border border-dashed border-(--border) bg-(--surface)/60 px-4 py-5 text-center text-xs text-(--secondary-text)">Your newly shortened links will appear here.</div>}
        </div>
        <button type="button" onClick={() => document.querySelector("#analytics")?.scrollIntoView({ behavior: "smooth" })} className="focus-ring mt-4 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-xs font-semibold text-(--primary-text) hover:bg-(--surface-soft)"><Play className="h-3.5 w-3.5" aria-hidden="true" />View Live Demo</button>
        <div className="mt-5 flex max-w-full flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-(--secondary-text)"><span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" aria-hidden="true" />Free to start</span><span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" aria-hidden="true" />No credit card required</span><span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" aria-hidden="true" />Account-based link management</span></div>
      </Reveal>
    </section>
  );
};

export default HeroSection;
