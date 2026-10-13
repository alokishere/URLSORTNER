import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Button,
  DashboardCard,
  EmptyState,
  LinkRow,
  PageIntro,
} from "../../components/dashboard/DashboardPrimitives";
import { DEMO_URLS, fetchUrls } from "../../lib/dashboardData";

const DashboardLinks = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [urls, setUrls] = useState([]);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [sort, setSort] = useState("created");
  const query = searchParams.get("search") || "";

  useEffect(() => {
    let active = true;
    fetchUrls()
      .then((data) => {
        if (active) setUrls([...data].reverse());
      })
      .catch(() => {
        if (active) {
          setUrls(DEMO_URLS);
          setPreview(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const next = urls.filter((url) =>
      `${url.shortID} ${url.redirectUrl}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
    return [...next].sort((a, b) =>
      sort === "clicks"
        ? (b.visitHistory?.length || 0) - (a.visitHistory?.length || 0)
        : new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [urls, query, sort]);

  const allSelected =
    filtered.length > 0 && filtered.every((url) => selected.includes(url._id));
  const toggleAll = () =>
    setSelected(allSelected ? [] : filtered.map((url) => url._id));

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageIntro
        eyebrow="Link management"
        title="My links"
        description="Search, organize, and measure every short link in your workspace."
        actions={
          <Button onClick={() => navigate("/dashboard/create")}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create new link
          </Button>
        }
      />
      {preview && (
        <p className="mb-4 text-xs text-(--secondary-text)">
          Preview data is shown because the current API could not be reached.
        </p>
      )}
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
            <Button variant="secondary">
              <Filter className="h-4 w-4" aria-hidden="true" />
              Filters
            </Button>
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
          <div className="h-72 animate-pulse bg-(--surface-soft)/45" />
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
                    onAction={() =>
                      navigate(`/dashboard/links/${url.shortID}/analytics`)
                    }
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
              <Button onClick={() => navigate("/dashboard/create")}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create new link
              </Button>
            }
          />
        )}
      </DashboardCard>
    </div>
  );
};

export default DashboardLinks;
