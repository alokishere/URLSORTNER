import { useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  QrCode,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createShortUrl, getRequestErrorMessage } from "../lib/urlApi";
import {
  Button,
  DashboardCard,
  PageIntro,
} from "../components/dashboard/DashboardPrimitives";

const CreateSortUrl = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestInFlight = useRef(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (requestInFlight.current) return;
    setError("");
    setResult(null);
    setLoading(true);
    requestInFlight.current = true;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const alias = form.get("alias")?.toString().trim();
    const title = form.get("title")?.toString().trim();
    let created;
    try {
      created = await createShortUrl({
        url: form.get("url"),
        ...(alias ? { alias } : {}),
        ...(title ? { title } : {}),
      });
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, "We could not create that link. Check the URL and try again."));
      return;
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }

    setError("");
    setResult(created);
    formElement.reset();
  };

  const shortUrl = result?.shortUrl || result?.url || "";

  return (
    <div className="mx-auto max-w-245">
      <PageIntro
        eyebrow="Link builder"
        title="Create a new link"
        description="Turn a long URL into a clean, shareable link with tracking built in."
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate("/dashboard/links")}
          >
            View my links
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,.65fr)]">
        <DashboardCard className="p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="url"
                className="mb-2 block text-sm font-semibold text-(--primary-text)"
              >
                Destination URL <span className="text-(--danger)">*</span>
              </label>
              <div className="relative">
                <Link2
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--secondary-text)"
                  aria-hidden="true"
                />
                <input
                  id="url"
                  name="url"
                  type="url"
                  required
                  placeholder="https://example.com/your-long-link"
                  className="focus-ring min-h-12 w-full rounded-xl border border-(--border) bg-(--surface) pl-12 pr-4 text-sm text-(--primary-text) placeholder:text-(--secondary-text)/75"
                />
                <p className="mt-2 text-xs text-(--secondary-text)">
                  We&apos;ll keep the original destination intact and give you a
                  trackable short URL.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="alias"
                  className="mb-2 block text-sm font-semibold text-(--primary-text)"
                >
                  Custom alias{" "}
                  <span className="font-normal text-(--secondary-text)">
                    (optional)
                  </span>
                </label>
                <input
                  id="alias"
                  name="alias"
                  minLength="3"
                  maxLength="32"
                  pattern="[A-Za-z0-9_-]{3,32}"
                  placeholder="e.g. alok-linkedin"
                  className="focus-ring min-h-12 w-full rounded-xl border border-(--border) bg-(--surface) px-4 text-sm text-(--primary-text) placeholder:text-(--secondary-text)"
                />
                <p className="mt-2 text-xs text-(--secondary-text)">
                  Letters, numbers, hyphens, and underscores.
                </p>
              </div>
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-(--primary-text)"
                >
                  Link title{" "}
                  <span className="font-normal text-(--secondary-text)">
                    (optional)
                  </span>
                </label>
                <input
                  id="title"
                  name="title"
                  maxLength="120"
                  placeholder="e.g. LinkedIn profile"
                  className="focus-ring min-h-12 w-full rounded-xl border border-(--border) bg-(--surface) px-4 text-sm text-(--primary-text) placeholder:text-(--secondary-text)"
                />
                <p className="mt-2 text-xs text-(--secondary-text)">
                  Optional label for your workspace.
                </p>
              </div>
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-(--danger)/35 bg-(--danger-soft) px-4 py-3 text-sm text-(--danger)"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {loading ? "Creating link..." : "Create short link"}
            </Button>
          </form>
          {result && (
            <div className="mt-7 rounded-2xl border border-(--primary)/35 bg-(--secondary)/35 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-(--primary-text)">
                <CheckCircle2
                  className="h-5 w-5 text-(--success)"
                  aria-hidden="true"
                />
                Short link created
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  value={shortUrl}
                  readOnly
                  aria-label="Created short URL"
                  className="min-h-11 min-w-0 flex-1 rounded-xl border border-(--border) bg-(--surface) px-3 text-sm text-(--primary-text)"
                />
                <Button
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(shortUrl)}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Copy
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-(--primary-deep) hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Open link
                </a>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/dashboard/links/${result.shortID}/analytics`)
                  }
                  className="focus-ring inline-flex cursor-pointer items-center gap-1.5 font-semibold text-(--primary-deep) hover:underline"
                >
                  <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                  View analytics
                </button>
              </div>
            </div>
          )}
        </DashboardCard>
        <DashboardCard className="h-fit bg-(--primary) p-5 text-(--primary-text) sm:p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-bold">A better link starts here</h2>
          <p className="mt-2 text-sm leading-6 text-(--primary-text/80)">
            Your links are ready to be shared, measured, and improved from one
            calm workspace.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-(--primary-text/85">
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-(--accent)" />
              Track visits automatically
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-(--accent)" />
              Keep destinations organized
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-(--accent)" />
              Open analytics for every link
            </li>
          </ul>
        </DashboardCard>
      </div>
    </div>
  );
};

export default CreateSortUrl;
