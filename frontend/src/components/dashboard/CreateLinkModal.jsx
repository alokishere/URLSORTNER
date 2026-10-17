import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  Sparkles,
  X,
} from "lucide-react";
import instance from "../../axios";
import { Button } from "./DashboardPrimitives";

const CreateLinkModal = ({ open, onClose, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    setError("");
    setResult(null);
    setCopied(false);
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);
    setCopied(false);
    setLoading(true);
    try {
      const form = new FormData(event.currentTarget);
      const alias = form.get("alias")?.toString().trim();
      const title = form.get("title")?.toString().trim();
      const response = await instance.post("/urls/", {
        url: form.get("url"),
        ...(alias ? { alias } : {}),
        ...(title ? { title } : {}),
      });
      setError("");
      setResult(response.data);
      onCreated();
      event.currentTarget.reset();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "We could not create that link. Check the URL and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const shortUrl =
    result?.url ||
    (result?.shortID ? `${instance.defaults.baseURL}/${result.shortID}` : "");

  const copyShortUrl = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--primary-text)/35 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-link-title"
        className="dashboard-scrollbar max-h-[calc(100dvh-3rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--secondary)/65 text-(--primary-deep)">
              <Link2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="create-link-title" className="text-lg font-bold text-(--primary-text)">
                Create a short URL
              </h2>
              <p className="mt-1 text-sm leading-5 text-(--secondary-text)">
                Turn a long destination into a clean, trackable link.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close create short URL dialog"
            className="focus-ring inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-(--secondary-text) transition hover:bg-(--surface-soft) hover:text-(--primary-text)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="modal-url" className="mb-2 block text-sm font-semibold text-(--primary-text)">
              Destination URL <span className="text-(--danger)">*</span>
            </label>
            <input
              id="modal-url"
              name="url"
              type="url"
              required
              autoFocus
              placeholder="https://example.com/your-long-link"
              className="focus-ring min-h-12 w-full rounded-xl border border-(--border) bg-(--surface) px-4 text-sm text-(--primary-text) placeholder:text-(--secondary-text)/75"
            />
            <p className="mt-2 text-xs leading-5 text-(--secondary-text)">
              Add an optional title for your workspace and a custom alias for a memorable short URL.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="modal-title" className="mb-2 block text-sm font-semibold text-(--primary-text)">
                Link title <span className="font-normal text-(--secondary-text)">(optional)</span>
              </label>
              <input
                id="modal-title"
                name="title"
                type="text"
                maxLength="120"
                placeholder="e.g. LinkedIn profile"
                className="focus-ring min-h-11 w-full rounded-xl border border-(--border) bg-(--surface) px-3.5 text-sm text-(--primary-text) placeholder:text-(--secondary-text)/75"
              />
            </div>
            <div>
              <label htmlFor="modal-alias" className="mb-2 block text-sm font-semibold text-(--primary-text)">
                Custom alias <span className="font-normal text-(--secondary-text)">(optional)</span>
              </label>
              <input
                id="modal-alias"
                name="alias"
                type="text"
                minLength="3"
                maxLength="32"
                pattern="[A-Za-z0-9_-]{3,32}"
                placeholder="e.g. alok-linkedin"
                className="focus-ring min-h-11 w-full rounded-xl border border-(--border) bg-(--surface) px-3.5 text-sm text-(--primary-text) placeholder:text-(--secondary-text)/75"
              />
              <p className="mt-2 text-xs text-(--secondary-text)">Letters, numbers, hyphens, and underscores.</p>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-[#d9a79b] bg-[#f8e9e5] px-4 py-3 text-sm text-(--danger)">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-(--border) pt-4 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {loading ? "Creating link…" : "Create short URL"}
            </Button>
          </div>
        </form>

        {result && (
          <div className="mt-5 rounded-xl border border-(--success)/25 bg-[#e8f1e6] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-(--success)">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Short link created
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={shortUrl}
                readOnly
                aria-label="Created short URL"
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-(--border) bg-(--surface) px-3 text-sm text-(--primary-text)"
              />
              <Button variant="secondary" onClick={copyShortUrl}>
                <Copy className="h-4 w-4" aria-hidden="true" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
              <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-(--primary-deep) hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Open link
              </a>
              <button type="button" onClick={handleClose} className="focus-ring cursor-pointer font-semibold text-(--primary-deep) hover:underline">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateLinkModal;
