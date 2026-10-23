import { useState } from "react";
import { BarChart3, ExternalLink, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QRCodeModal from "../../components/QRCodeModal";
import {
  Button,
  DashboardCard,
  ErrorState,
  EmptyState,
  LoadingBlock,
  PageIntro,
  StatusPill,
} from "../../components/dashboard/DashboardPrimitives";
import { useCreateLinkModal } from "../../components/dashboard/useCreateLinkModal";
import { formatCompact } from "../../lib/dashboardData";

import { useDashboardLinks } from "../../lib/dashboardQueries";
import { getQueryErrorMessage } from "../../lib/apiErrors";

const QRCodePage = () => {
  const navigate = useNavigate();
  const { openCreateLink } = useCreateLinkModal();
  const {
    data: links = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useDashboardLinks();
  const error = queryError ? getQueryErrorMessage(queryError, "We could not load your QR codes.") : "";
  const [selectedLink, setSelectedLink] = useState(null);

  const closeModal = () => setSelectedLink(null);

  if (error && !loading)
    return (
      <div className="mx-auto max-w-[1180px]">
        <PageIntro eyebrow="Growth tools" title="QR codes" description="Generate print-ready QR codes and compare their scans with ordinary short-link clicks." actions={<Button onClick={openCreateLink}>Create short URL</Button>} />
        <DashboardCard><ErrorState description={error} onRetry={refetch} /></DashboardCard>
      </div>
    );

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageIntro
        eyebrow="Growth tools"
        title="QR codes"
        description="Generate print-ready QR codes and compare their scans with ordinary short-link clicks."
        actions={<Button onClick={openCreateLink}>Create short URL</Button>}
      />
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-(--danger)/35 bg-(--danger-soft) px-4 py-3 text-sm text-(--danger)"
        >
          {error}
        </p>
      )}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <LoadingBlock key={index} className="h-56" />
          ))}
        </div>
      ) : links.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {links.map((link) => (
            <DashboardCard
              key={link._id}
              className="dash-card-hover flex min-h-56 flex-col p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--secondary)/65 text-(--primary-deep)">
                  <QrCode className="h-5 w-5" aria-hidden="true" />
                </span>
                <StatusPill tone="success">Ready</StatusPill>
              </div>
              <p className="mt-5 truncate text-sm font-bold text-(--primary-text)">
                ekurl.in/{link.shortID}
              </p>
              <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-(--secondary-text)">
                {link.title || link.redirectUrl}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-(--surface-soft)/70 p-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-(--secondary-text)">
                    QR scans
                  </p>
                  <p className="mt-1 text-lg font-bold text-(--primary-text)">
                    {formatCompact(link.qrScans || 0)}
                  </p>
                </div>
                <div className="border-l border-(--border) pl-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-(--secondary-text)">
                    Link clicks
                  </p>
                  <p className="mt-1 text-lg font-bold text-(--primary-text)">
                    {formatCompact(link.linkClicks || 0)}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLink(link)}
                  className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--accent) px-3 text-xs font-semibold text-(--surface) hover:bg-(--accent-deep)"
                >
                  <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                  Open QR
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/dashboard/links/${link.shortID}/analytics`)
                  }
                  className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-(--border) px-3 text-xs font-semibold text-(--primary-text) hover:bg-(--surface-soft)"
                >
                  <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                  Analytics
                </button>
              </div>
            </DashboardCard>
          ))}
        </div>
      ) : (
        <DashboardCard>
          <EmptyState
            icon={QrCode}
            title="No QR codes yet"
            description="Create your first short URL, then open its QR code here."
            action={<Button onClick={openCreateLink}>Create short URL</Button>}
          />
        </DashboardCard>
      )}
      <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-(--secondary-text)">
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        New QR exports include a tracking marker so QR scans are counted
        separately from direct link clicks.
      </p>
      <QRCodeModal
        key={selectedLink?._id || "closed-qr"}
        link={selectedLink}
        onClose={closeModal}
      />
    </div>
  );
};

export default QRCodePage;
