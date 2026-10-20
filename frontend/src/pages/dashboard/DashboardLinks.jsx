import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownUp,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  DashboardCard,
  EmptyState,
  LinkTableSkeleton,
  LinkRow,
  PageIntro,
} from "../../components/dashboard/DashboardPrimitives";
import { DeleteLinkDialog, EditLinkDialog } from "../../components/dashboard/LinkManagementDialogs";
import { fetchUrlsWithAnalytics, getClicks } from "../../lib/dashboardData";
import { useCreateLinkModal } from "../../components/dashboard/useCreateLinkModal";
import { deleteShortUrl, updateShortUrl, updateShortUrlStatus } from "../../lib/urlApi";
import QRCodeModal from "../../components/QRCodeModal";

const DashboardLinks = () => {
  const { openCreateLink, createdVersion } = useCreateLinkModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const [urls, setUrls] = useState([]);
  const [loadedVersion, setLoadedVersion] = useState(-1);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState([]);
  const [sort, setSort] = useState("created");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [mutationId, setMutationId] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [toast, setToast] = useState("");
  const [qrLink, setQrLink] = useState(null);
  const initialRequestedQr = useRef(searchParams.get("qr") || "");
  const query = searchParams.get("search") || "";

  useEffect(() => {
    let active = true;
    fetchUrlsWithAnalytics()
      .then((data) => {
        if (active) {
          setUrls(data);
          setLoadError("");
          setLoadedVersion(createdVersion);
          if (initialRequestedQr.current) {
            const requestedLink = data.find((item) => item.shortID === initialRequestedQr.current);
            if (requestedLink) {
              setQrLink(requestedLink);
            } else {
              setToast("That link is not available in your workspace.");
            }
            initialRequestedQr.current = "";
          }
        }
      })
      .catch((error) => {
        if (active) {
          setUrls([]);
          setLoadError(error.response?.data?.message || "We could not load your links right now.");
          setLoadedVersion(createdVersion);
        }
      })
    return () => {
      active = false;
    };
  }, [createdVersion]);

  const loading = loadedVersion !== createdVersion;

  const filtered = useMemo(() => {
    const next = urls.filter((url) => {
      const matchesQuery = `${url.shortID} ${url.alias || ""} ${url.title || ""} ${url.redirectUrl}`.toLowerCase().includes(query.toLowerCase());
      const normalizedStatus = url.status === "active" ? "active" : "blocked";
      return matchesQuery && (status === "all" || normalizedStatus === status);
    });
    return [...next].sort((a, b) =>
      sort === "clicks"
        ? getClicks(b) - getClicks(a)
        : new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [urls, query, sort, status]);

  const announce = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const saveEdit = async (payload) => {
    if (!editing) return;
    setMutationId(editing._id);
    setMutationError("");
    try {
      const updated = await updateShortUrl(editing._id, payload);
      setUrls((current) => current.map((item) => item._id === editing._id ? { ...item, ...updated } : item));
      setEditing(null);
      announce("Link updated successfully.");
    } catch (error) {
      setMutationError(error.response?.data?.error || "The link could not be updated.");
    } finally {
      setMutationId("");
    }
  };

  const toggleStatus = async (link) => {
    setMutationId(link._id);
    setMutationError("");
    const nextStatus = link.status === "active" ? "blocked" : "active";
    try {
      const updated = await updateShortUrlStatus(link._id, nextStatus);
      setUrls((current) => current.map((item) => item._id === link._id ? { ...item, ...updated } : item));
      announce(nextStatus === "active" ? "Link unblocked." : "Link blocked. Redirects are now disabled.");
    } catch (error) {
      announce(error.response?.data?.error || "The link status could not be changed.");
    } finally {
      setMutationId("");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setMutationId(deleting._id);
    setMutationError("");
    try {
      await deleteShortUrl(deleting._id);
      setUrls((current) => current.filter((item) => item._id !== deleting._id));
      setSelected((current) => current.filter((id) => id !== deleting._id));
      setDeleting(null);
      announce("Link deleted successfully.");
    } catch (error) {
      setMutationError(error.response?.data?.error || "The link could not be deleted.");
    } finally {
      setMutationId("");
    }
  };

  const allSelected =
    filtered.length > 0 && filtered.every((url) => selected.includes(url._id));
  const toggleAll = () =>
    setSelected(allSelected ? [] : filtered.map((url) => url._id));

  const closeQrModal = useCallback(() => {
    setQrLink(null);
    if (searchParams.has("qr")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("qr");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageIntro
        eyebrow="Link management"
        title="My links"
        description="Search, organize, and measure every short link in your workspace."
        actions={
          <Button onClick={openCreateLink}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create short URL
          </Button>
        }
      />
      {loadError && (
        <p role="alert" className="mb-4 rounded-xl border border-[#d9a79b] bg-[#f8e9e5] px-4 py-3 text-sm text-(--danger)">
          {loadError}
        </p>
      )}
      {toast && <div role="status" className="fixed bottom-5 right-5 z-70 max-w-sm rounded-xl border border-(--border) bg-(--primary-text) px-4 py-3 text-sm font-medium text-(--surface) shadow-xl">{toast}</div>}
      <DashboardCard className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-(--border) p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">Search links</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--secondary-text)"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(event) =>
                  setSearchParams(
                    event.target.value ? { search: event.target.value } : {},
                  )
                }
                placeholder="Search links..."
                className="focus-ring min-h-11 w-64 rounded-xl border border-(--border) bg-(--surface) pl-9 pr-3 text-sm text-(--primary-text) placeholder:text-(--secondary-text)"
              />
            </label>
            <label className="relative"><span className="sr-only">Filter by status</span><Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--secondary-text)" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="focus-ring min-h-11 cursor-pointer appearance-none rounded-xl border border-(--border) bg-(--surface) py-2 pl-9 pr-8 text-sm"><option value="all">All statuses</option><option value="active">Active</option><option value="blocked">Blocked</option></select></label>
          </div>
          <div className="flex items-center gap-2">
            <label className="relative">
              <span className="sr-only">Sort links</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="focus-ring min-h-11 cursor-pointer appearance-none rounded-xl border border-(--border) bg-(--surface) py-2 pl-9 pr-8 text-sm text-(--primary-text)"
              >
                <option value="created">Newest first</option>
                <option value="clicks">Most clicks</option>
              </select>
              <ArrowDownUp
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--secondary-text)"
                aria-hidden="true"
              />
            </label>
            <Button variant="secondary" className="hidden sm:inline-flex">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Columns
            </Button>
          </div>
        </div>
        {selected.length > 0 && (
          <div className="flex items-center justify-between bg-(--secondary)/35 px-4 py-2.5 text-xs text-(--primary-text)">
            <span>
              {selected.length} link{selected.length === 1 ? "" : "s"} selected
            </span>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="focus-ring cursor-pointer font-semibold text-(--primary-deep)"
            >
              Clear selection
            </button>
          </div>
        )}
        {loading ? (
          <LinkTableSkeleton rows={6} />
        ) : filtered.length ? (
          <div className="dashboard-scrollbar overflow-x-auto">
            <table className="min-w-[1020px] w-full text-left">
              <thead className="bg-(--surface-soft)/60">
                <tr>
                  <th className="w-10 px-3 py-3.5 sm:px-4">
                    <input
                      aria-label="Select all links"
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 cursor-pointer rounded border-(--border) accent-[var(--primary-deep)]"
                    />
                  </th>
                  <th className="px-3 py-3.5 text-[11px] font-semibold text-(--secondary-text) sm:px-4">
                    Short URL
                  </th>
                  <th className="px-3 py-3.5 text-[11px] font-semibold text-(--secondary-text) sm:px-4">
                    Destination
                  </th>
                  <th className="px-3 py-3.5 text-[11px] font-semibold text-(--secondary-text) sm:px-4">
                    Clicks
                  </th>
                  <th className="px-3 py-3.5 text-[11px] font-semibold text-(--secondary-text) sm:px-4">
                    Created
                  </th>
                  <th className="px-3 py-3.5 text-[11px] font-semibold text-(--secondary-text) sm:px-4">
                    Status
                  </th>
                  <th className="px-3 py-3.5 text-right text-[11px] font-semibold text-(--secondary-text) sm:px-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((url) => (
                  <LinkRow
                    key={url._id || url.shortID}
                    url={url}
                    selectable
                    checked={selected.includes(url._id)}
                    onCheck={() =>
                      setSelected((current) =>
                        current.includes(url._id)
                          ? current.filter((item) => item !== url._id)
                          : [...current, url._id],
                      )
                    }
                    onEdit={(link) => { setMutationError(""); setEditing(link); }}
                    onQr={setQrLink}
                    onToggleStatus={toggleStatus}
                    onDelete={(link) => { setMutationError(""); setDeleting(link); }}
                    actionLoading={mutationId === url._id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No links match your search"
            description="Try another keyword or create a new short link."
            action={
              <Button onClick={openCreateLink}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create short URL
              </Button>
            }
          />
        )}
      </DashboardCard>
      <EditLinkDialog link={editing} onClose={() => !mutationId && setEditing(null)} onSave={saveEdit} saving={Boolean(editing && mutationId === editing._id)} error={editing ? mutationError : ""} />
      <DeleteLinkDialog link={deleting} onClose={() => !mutationId && setDeleting(null)} onConfirm={confirmDelete} deleting={Boolean(deleting && mutationId === deleting._id)} error={deleting ? mutationError : ""} />
      <QRCodeModal key={qrLink?._id || "closed-qr"} link={qrLink} onClose={closeQrModal} />
    </div>
  );
};

export default DashboardLinks;
