import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Copy, Download, QrCode, RefreshCw, X } from "lucide-react";
import { fetchShortUrlQrCode } from "../lib/urlApi";

const QRCodeModal = ({ link, onClose }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const closeRef = useRef(null);
  const requestInFlight = useRef(false);
  const reduceMotion = useReducedMotion();
  const linkId = link?._id;
  const open = Boolean(linkId);

  const requestQrCode = useCallback(async () => {
    const result = await fetchShortUrlQrCode(linkId);
    if (!result?.qrCodeDataUrl || !result?.shortUrl) {
      throw new Error("QR code response was incomplete");
    }
    return result;
  }, [linkId]);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    const previouslyFocused = document.activeElement;
    requestQrCode()
      .then((result) => {
        if (active) setQrData(result);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.response?.data?.error || "We could not generate this QR code. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => {
      active = false;
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose, open, requestQrCode]);

  const retryQrCode = async () => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setLoading(true);
    setError("");
    setCopied(false);
    try {
      setQrData(await requestQrCode());
    } catch (requestError) {
      setQrData(null);
      setError(requestError.response?.data?.error || "We could not generate this QR code. Please try again.");
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!qrData?.shortUrl) return;
    try {
      await navigator.clipboard.writeText(qrData.shortUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Your browser could not copy the link. Select the URL and copy it manually.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center bg-(--primary-text)/40 px-4 py-6 backdrop-blur-sm"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.16 }}
          onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-dialog-title"
            aria-busy={loading}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="w-full max-w-md rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--secondary)/65 text-(--primary-deep)"><QrCode className="h-5 w-5" aria-hidden="true" /></span>
                <div><h2 id="qr-dialog-title" className="font-bold text-(--primary-text)">QR code</h2><p className="mt-1 text-sm text-(--secondary-text)">Scan or download the working short link.</p></div>
              </div>
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Close QR code" className="focus-ring inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-(--secondary-text) hover:bg-(--surface-soft)"><X className="h-5 w-5" /></button>
            </div>

            <div className="mx-auto mt-5 aspect-square max-w-64 rounded-2xl border border-(--border) bg-white p-4">
              {loading && <div className="flex h-full w-full items-center justify-center rounded-xl bg-(--surface-soft)"><RefreshCw className="h-6 w-6 animate-spin text-(--primary-deep) motion-reduce:animate-none" aria-hidden="true" /><span className="sr-only">Generating QR code</span></div>}
              {!loading && qrData?.qrCodeDataUrl && <img src={qrData.qrCodeDataUrl} alt={`QR code for ${qrData.shortUrl}`} width="256" height="256" className="h-full w-full" />}
              {!loading && error && <div className="flex h-full flex-col items-center justify-center px-3 text-center"><QrCode className="h-7 w-7 text-(--secondary-text)" aria-hidden="true" /><p className="mt-3 text-xs leading-5 text-(--secondary-text)">{error}</p><button type="button" onClick={retryQrCode} className="focus-ring mt-3 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-(--border) px-3 text-xs font-semibold hover:bg-(--surface-soft)"><RefreshCw className="h-3.5 w-3.5" />Retry</button></div>}
            </div>

            <p className="mt-4 [overflow-wrap:anywhere] rounded-xl bg-(--surface-soft) px-3 py-2 text-center text-xs font-semibold text-(--primary-text)">{qrData?.shortUrl || link?.shortUrl || link?.url || `Short link ${link?.shortID || ""}`}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={copy} disabled={!qrData || loading} className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-(--border) text-sm font-semibold hover:bg-(--surface-soft) disabled:cursor-not-allowed disabled:opacity-50">{copied ? <Check className="h-4 w-4 text-(--success)" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy link"}</button>
              <a href={qrData?.qrCodeDataUrl || undefined} download={`urlsortner-${qrData?.shortID || link?.shortID || "link"}.png`} aria-disabled={!qrData || loading} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-(--accent) text-sm font-semibold text-(--surface) transition hover:bg-(--accent-deep) aria-disabled:pointer-events-none aria-disabled:opacity-50"><Download className="h-4 w-4" />Download QR code</a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QRCodeModal;
