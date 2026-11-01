import { useCallback, useState } from "react";
import { BarChart3, Edit3, ExternalLink, Plus, QrCode, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QRCodeModal from "../../components/QRCodeModal";
import CreateQrModal from "../../components/dashboard/CreateQrModal";
import { DeleteLinkDialog, EditLinkDialog } from "../../components/dashboard/LinkManagementDialogs";
import {
  Button,
  DashboardCard,
  ErrorState,
  EmptyState,
  LoadingBlock,
  PageIntro,
  StatusPill,
} from "../../components/dashboard/DashboardPrimitives";
import { formatCompact } from "../../lib/dashboardData";
import { deleteQrCode, getRequestErrorMessage, updateShortUrl } from "../../lib/urlApi";

import { useDashboardLinks } from "../../lib/dashboardQueries";
import { getQueryErrorMessage } from "../../lib/apiErrors";

const QRCodePage = () => {
  const navigate = useNavigate();
  const {
    data: links = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useDashboardLinks();
  const error = queryError ? getQueryErrorMessage(queryError, "We could not load your QR codes.") : "";
  const qrLinks = links.filter((link) => link.qrEnabled !== false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [mutationId, setMutationId] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [toast, setToast] = useState("");

  const announce = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const closeModal = useCallback(() => setSelectedLink(null), []);

  const handleCreated = (created) => {
    setCreateOpen(false);
    setSelectedLink(created);
    void refetch();
    announce("QR code created successfully.");
  };

  const saveEdit = async (payload) => {
    if (!editing) return;
    setMutationId(editing._id);
    setMutationError("");
    try {
      const updated = await updateShortUrl(editing._id, payload);
      if (selectedLink?._id === editing._id) {
        setSelectedLink((current) => ({ ...current, ...updated }));
      }
      setEditing(null);
      await refetch();
      announce("QR code updated successfully.");
    } catch (requestError) {
      setMutationError(getRequestErrorMessage(requestError, "The QR code could not be updated."));
    } finally {
      setMutationId("");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setMutationId(deleting._id);
    setMutationError("");
    try {
      await deleteQrCode(deleting._id);
      if (selectedLink?._id === deleting._id) setSelectedLink(null);
      setDeleting(null);
      await refetch();
      announce("QR code removed. The short link was kept.");
    } catch (requestError) {
      setMutationError(getRequestErrorMessage(requestError, "The QR code could not be deleted."));
    } finally {
      setMutationId("");
    }
  };

  if (error && !loading)
    return (
      <div className="mx-auto max-w-[1180px]">
        <PageIntro
          eyebrow="Growth tools"
          title="QR codes"
          description="Generate print-ready QR codes and compare their scans with ordinary short-link clicks."
          actions={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" aria-hidden="true" />Create QR code</Button>}
        />
        <DashboardCard><ErrorState description={error} onRetry={refetch} /></DashboardCard>
        <CreateQrModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
        />
        <QRCodeModal
          key={selectedLink?._id || "closed-qr-error"}
          link={selectedLink}
          onClose={closeModal}
        />
      </div>
    );

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageIntro
        eyebrow="Growth tools"
        title="QR codes"
        description="Generate print-ready QR codes and compare their scans with ordinary short-link clicks."
        actions={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" aria-hidden="true" />Create QR code</Button>}
      />
      {toast && <div role="status" className="fixed bottom-5 right-5 z-70 max-w-sm rounded-xl border border-(--border) bg-(--primary-text) px-4 py-3 text-sm font-medium text-(--surface) shadow-xl">{toast}</div>}
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
      ) : qrLinks.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {qrLinks.map((link) => (
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
                {link.title?.trim() || link.shortUrl || link.shortID}
              </p>
              <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-(--secondary-text)">
                {link.redirectUrl}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-(--surface-soft)/70 p-3">
                <div className="flex items-start gap-2">
                  <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-(--primary-deep)" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-(--secondary-text)">
                      QR scans
                    </p>
                    <p className="mt-1 text-lg font-bold text-(--primary-text)">
                      {formatCompact(link.qrScans || 0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 border-l border-(--border) pl-3">
                  <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-(--primary-deep)" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-(--secondary-text)">
                      Link clicks
                    </p>
                    <p className="mt-1 text-lg font-bold text-(--primary-text)">
                      {formatCompact(link.linkClicks || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLink(link)}
                  className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--accent) px-3 text-xs font-semibold text-(--surface) hover:bg-(--accent-deep)"
                >
                  <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                  Open QR
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/dashboard/links/${link.shortID}/analytics`)
                  }
                  className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-(--border) px-3 text-xs font-semibold text-(--primary-text) hover:bg-(--surface-soft)"
                >
                  <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                  Analytics
                </button>
                <button
                  type="button"
                  onClick={() => { setMutationError(""); setEditing(link); }}
                  disabled={mutationId === link._id}
                  className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-(--border) px-3 text-xs font-semibold text-(--primary-text) hover:bg-(--surface-soft) disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => { setMutationError(""); setDeleting(link); }}
                  disabled={mutationId === link._id}
                  className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-(--danger)/35 px-3 text-xs font-semibold text-(--danger) hover:bg-(--danger-soft) disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
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
            action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" aria-hidden="true" />Create QR code</Button>}
          />
        </DashboardCard>
      )}
      <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-(--secondary-text)">
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        New QR exports include a tracking marker so QR scans are counted
        separately from direct link clicks.
      </p>
      <CreateQrModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
      <EditLinkDialog
        link={editing}
        onClose={() => !mutationId && setEditing(null)}
        onSave={saveEdit}
        saving={Boolean(editing && mutationId === editing._id)}
        error={editing ? mutationError : ""}
      />
      <DeleteLinkDialog
        link={deleting}
        onClose={() => !mutationId && setDeleting(null)}
        onConfirm={confirmDelete}
        deleting={Boolean(deleting && mutationId === deleting._id)}
        error={deleting ? mutationError : ""}
        preserveLink
      />
      <QRCodeModal
        key={selectedLink?._id || "closed-qr"}
        link={selectedLink}
        onClose={closeModal}
      />
    </div>
  );
};

export default QRCodePage;
