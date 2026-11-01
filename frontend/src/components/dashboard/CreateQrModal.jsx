import { useEffect, useRef, useState } from "react";
import { QrCode, Sparkles, X } from "lucide-react";
import { Button } from "./DashboardPrimitives";
import { createQrCode, getRequestErrorMessage } from "../../lib/urlApi";

const CreateQrModal = ({ open, onClose, onCreated }) => {
  const firstInput = useRef(null);
  const requestInFlight = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const focusTimer = window.setTimeout(() => firstInput.current?.focus(), 0);
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", closeOnEscape);
      previous?.focus?.();
    };
  }, [loading, onClose, open]);

  if (!open) return null;

  const close = () => {
    if (loading) return;
    setError("");
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const destination = form.get("destination")?.toString().trim();
    const title = form.get("title")?.toString().trim();

    try {
      const created = await createQrCode({
        url: destination,
        ...(title ? { title } : {}),
      });
      onCreated?.(created);
      onClose();
    } catch (requestError) {
      setError(
        getRequestErrorMessage(
          requestError,
          "We could not create that QR code. Check the URL and try again.",
        ),
      );
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-(--primary-text)/40 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-qr-title"
        className="dashboard-scrollbar max-h-[calc(100dvh-3rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center text-(--primary-deep)">
              <QrCode className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="create-qr-title" className="text-lg font-bold text-(--primary-text)">
                Create a QR code
              </h2>
              <p className="mt-1 text-sm leading-5 text-(--secondary-text)">
                Create a trackable short link and generate its QR code instantly.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={loading}
            aria-label="Close create QR code dialog"
            className="focus-ring inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-(--secondary-text) transition hover:bg-(--surface-soft) hover:text-(--primary-text) disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="create-qr-destination" className="mb-2 block text-sm font-semibold text-(--primary-text)">
              Destination URL <span className="text-(--danger)">*</span>
            </label>
            <input
              ref={firstInput}
              id="create-qr-destination"
              name="destination"
              type="url"
              required
              placeholder="https://example.com/your-page"
              className="focus-ring min-h-12 w-full rounded-xl border border-(--border) bg-(--surface) px-4 text-sm text-(--primary-text) placeholder:text-(--secondary-text)/75"
            />
          </div>
          <div>
            <label htmlFor="create-qr-title" className="mb-2 block text-sm font-semibold text-(--primary-text)">
              Title <span className="font-normal text-(--secondary-text)">(optional)</span>
            </label>
            <input
              id="create-qr-title"
              name="title"
              type="text"
              maxLength="120"
              placeholder="e.g. Product launch"
              className="focus-ring min-h-11 w-full rounded-xl border border-(--border) bg-(--surface) px-3.5 text-sm text-(--primary-text) placeholder:text-(--secondary-text)/75"
            />
            <p className="mt-2 text-xs leading-5 text-(--secondary-text)">
              The title helps you identify this QR code in your dashboard.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-(--danger)/35 bg-(--danger-soft) px-4 py-3 text-sm text-(--danger)">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-(--border) pt-4 sm:flex-row sm:justify-end">
            <Button variant="secondary" type="button" onClick={close} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {loading ? "Creating QR code…" : "Generate QR code"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQrModal;
