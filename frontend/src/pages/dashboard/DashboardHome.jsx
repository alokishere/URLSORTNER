import { useMemo, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ClipboardList,
  Eye,
  Globe2,
  Link2,
  Plus,
  QrCode,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  CountryCard,
  DeviceBrowserCard,
  InsightList,
} from "../../components/dashboard/AnalyticsWidgets";
import {
  Button,
  DashboardCard,
  EmptyState,
  LinkTableSkeleton,
  LoadingBlock,
  LinkRow,
  SectionHeading,
  StatCard,
} from "../../components/dashboard/DashboardPrimitives";
import {
  flattenVisits,
  formatCompact,
  formatRelativeTime,
  getClicks,
  getDisplayName,
  getStoredUser,
  aggregateVisitField,
} from "../../lib/dashboardData";
import { useCreateLinkModal } from "../../components/dashboard/useCreateLinkModal";
import { useDashboardLinks } from "../../lib/dashboardQueries";
import {
  Reveal,
  Stagger,
  StaggerItem,
} from "../../components/MotionPrimitives";

const buildChartData = (urls, days) => {
  const now = new Date();
  const visits = flattenVisits(urls);
  const points = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (13 - index));
    const key = date.toISOString().slice(0, 10);
    const matching = visits.filter(
      (visit) => new Date(visit.timestamp).toISOString().slice(0, 10) === key,
    );
    const total = matching.length;
    return {
      label: date.toLocaleDateString("en-IN", {
        month: "short",
        day: "2-digit",
      }),
      total,
      unique: Math.round(total * 0.65),
    };
  });
  return days === "Last 7 days" ? points.slice(-7) : points;
};

const DashboardHome = () => {
  const navigate = useNavigate();
  const { openCreateLink } = useCreateLinkModal();
  const {
    data: urls = [],
    isLoading: loading,
    isFetching,
    error,
  } = useDashboardLinks();
  const loadError = error
    ? error.response?.data?.message || "We could not load your links right now."
    : "";
  const [range, setRange] = useState("Last 28 days");
  const [linkSearch, setLinkSearch] = useState("");
  const user = getStoredUser();

  const visits = useMemo(() => flattenVisits(urls), [urls]);
  const totalClicks = urls.reduce((sum, url) => sum + getClicks(url), 0);
  const activeUrls = urls.filter((url) => url.status === "active").length;
  const chartData = useMemo(() => buildChartData(urls, range), [urls, range]);
  const filteredLinks = urls
    .filter((url) =>
      `${url.shortID} ${url.redirectUrl}`
        .toLowerCase()
        .includes(linkSearch.toLowerCase()),
    )
    .slice(0, 5);
  const latestVisits = [...visits]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);
  const recentClicks = `${formatCompact(totalClicks)} tracked visits`;
  const avgClicks = activeUrls ? Math.round(totalClicks / activeUrls) : 0;
  const countryItems = useMemo(
    () => aggregateVisitField(visits, "country"),
    [visits],
  );
  const deviceItems = useMemo(
    () => aggregateVisitField(visits, "deviceType"),
    [visits],
  );
  const browserItems = useMemo(
    () => aggregateVisitField(visits, "browser"),
    [visits],
  );
  const referrerItems = useMemo(
    () => aggregateVisitField(visits, "referrer"),
    [visits],
  );

  return (
    <div className="mx-auto max-w-360">
      <p className="mb-2 text-xs text-(--secondary-text)" role="status">
        {isFetching && !loading
          ? "Updating analytics…"
          : "Analytics refresh approximately every minute."}
      </p>
      <Reveal className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[2rem] font-bold tracking-[-0.045em] text-(--primary-text) sm:text-[2.45rem]">
              Welcome back, {getDisplayName(user)}
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-(--secondary-text) sm:text-base">
            Here&apos;s what&apos;s happening with your short links today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Date range</span>
            <select
              value={range}
              onChange={(event) => setRange(event.target.value)}
              className="focus-ring min-h-11 cursor-pointer appearance-none rounded-xl border border-(--border) bg-(--surface) py-2 pl-10 pr-9 text-sm font-medium text-(--primary-text)"
            >
              <option value="Last 7 days">Last 7 days</option>
              <option value="Last 28 days">Last 28 days</option>
              <option value="Last 90 days">Last 90 days</option>
              <option value="Custom range">Custom range</option>
            </select>
            <ClipboardList
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--secondary-text)"
              aria-hidden="true"
            />
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--secondary-text)"
              aria-hidden="true"
            />
          </label>
          <Button onClick={openCreateLink}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create short URL
          </Button>
        </div>
      </Reveal>

      {loadError && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-(--danger)/35 bg-(--danger-soft) px-4 py-3 text-sm text-(--danger)"
        >
          {loadError}
        </p>
      )}

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatCard
            icon={Link2}
            label="Total links"
            value={
              loading ? <LoadingBlock className="mt-2 h-8 w-14" /> : urls.length
            }
            helper={
              loading ? (
                <LoadingBlock className="mt-2 h-3 w-28" />
              ) : (
                `${activeUrls} currently active`
              )
            }
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={Zap}
            label="Total clicks"
            value={
              loading ? (
                <LoadingBlock className="mt-2 h-8 w-14" />
              ) : (
                formatCompact(totalClicks)
              )
            }
            helper={recentClicks}
            tone="gold"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={Users}
            label="Unique visitors"
            value={
              loading ? (
                <LoadingBlock className="mt-2 h-8 w-14" />
              ) : (
                "Not available"
              )
            }
            helper="Not collected by current API"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={BarChart3}
            label="Avg. clicks / active link"
            value={
              loading ? (
                <LoadingBlock className="mt-2 h-8 w-14" />
              ) : activeUrls ? (
                formatCompact(avgClicks)
              ) : (
                "Not available"
              )
            }
            helper="Derived from recorded visits"
          />
        </StaggerItem>
      </Stagger>

      <Reveal
        delay={0.05}
        className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.95fr)]"
      >
        <DashboardCard className="p-4 sm:p-5">
          <SectionHeading
            icon={BarChart3}
            title="Clicks overview"
            action={
              <label className="relative">
                <span className="sr-only">Chart grouping</span>
                <select className="focus-ring min-h-9 cursor-pointer appearance-none rounded-lg border border-(--border) bg-(--surface) py-1 pl-3 pr-8 text-xs font-medium text-(--primary-text)">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--secondary-text)"
                  aria-hidden="true"
                />
              </label>
            }
          />
          {loading ? (
            <div className="mt-6 h-56 animate-pulse rounded-xl bg-(--surface-soft)" />
          ) : (
            <BarChart data={chartData} empty={!totalClicks} />
          )}
        </DashboardCard>
        <CountryCard items={countryItems} loading={loading} />
      </Reveal>

      <Reveal
        delay={0.08}
        className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)_minmax(300px,.95fr)]"
      >
        <DashboardCard className="p-4 sm:p-5">
          <SectionHeading
            icon={Zap}
            title="Top referrers"
            action={
              <button
                type="button"
                className="focus-ring min-h-9 cursor-pointer rounded-lg border border-(--border) px-3 text-xs text-(--secondary-text) hover:bg-(--surface-soft)"
              >
                By clicks
              </button>
            }
          />
          {loading ? (
            <div className="mt-5 space-y-4">
              <LoadingBlock className="h-4 w-4/5" />
              <LoadingBlock className="h-4 w-3/5" />
              <LoadingBlock className="h-4 w-2/5" />
            </div>
          ) : referrerItems.length ? (
            <InsightList items={referrerItems} />
          ) : (
            <EmptyState
              icon={Zap}
              title="Referrer data unavailable"
              description="The current click event does not include a referrer field yet."
            />
          )}
        </DashboardCard>
        <DeviceBrowserCard
          devices={deviceItems}
          browsers={browserItems}
          loading={loading}
        />
        <DashboardCard className="p-4 sm:p-5">
          <SectionHeading
            icon={Eye}
            title="Recent activity"
            action={
              <button
                type="button"
                onClick={() => navigate("/dashboard/analytics")}
                className="focus-ring cursor-pointer text-xs font-semibold text-(--primary-deep) hover:underline"
              >
                View all
              </button>
            }
          />
          {loading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex items-center gap-3 py-2">
                  <LoadingBlock className="h-7 w-7 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <LoadingBlock className="h-3 w-3/4" />
                    <LoadingBlock className="h-3 w-1/2" />
                  </div>
                  <LoadingBlock className="h-3 w-14" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 divide-y divide-(--border)">
              {latestVisits.map((visit) => (
                <div key={visit._id} className="flex items-center gap-3 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--secondary)/65 text-(--primary-deep)">
                    <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-(--primary-text)">
                      New click on {visit.url?.shortID || "your link"}
                    </p>
                    <p className="truncate text-[11px] text-(--secondary-text)">
                      {visit.url?.redirectUrl || "Visitor details unavailable"}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-[10px] text-(--secondary-text)">
                    {formatRelativeTime(visit.timestamp)}
                  </span>
                </div>
              ))}
              {!latestVisits.length && (
                <p className="py-8 text-center text-sm text-(--secondary-text)">
                  No click activity yet.
                </p>
              )}
            </div>
          )}
        </DashboardCard>
      </Reveal>

      <DashboardCard className="mt-4 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-(--border) p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <SectionHeading icon={Link2} title="Recent links" />
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">Search recent links</span>
              <input
                value={linkSearch}
                onChange={(event) => setLinkSearch(event.target.value)}
                placeholder="Search links..."
                className="focus-ring min-h-10 w-44 rounded-lg border border-(--border) bg-(--surface) px-3 text-xs text-(--primary-text) placeholder:text-(--secondary-text) sm:w-52"
              />
            </label>
            <Button
              variant="secondary"
              onClick={() => navigate("/dashboard/links")}
            >
              <QrCode className="h-4 w-4" aria-hidden="true" />
              Manage links
            </Button>
          </div>
        </div>
        {loading ? (
          <LinkTableSkeleton rows={4} />
        ) : filteredLinks.length ? (
          <div className="dashboard-scrollbar overflow-x-auto">
            <table className="min-w-212.5 w-full text-left">
              <thead className="bg-(--surface-soft)/60">
                <tr>
                  <th className="w-10 px-4 py-3" />
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    Short URL
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    Destination
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    Clicks
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    Created
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-(--secondary-text)">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((url) => (
                  <LinkRow
                    key={url._id || url.shortID}
                    url={url}
                    onAction={() => navigate("/dashboard/links")}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No short links found"
            description={
              linkSearch
                ? "Try a different search term."
                : "Create your first short link to start tracking clicks."
            }
            action={
              <Button onClick={openCreateLink}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create short URL
              </Button>
            }
          />
        )}
      </DashboardCard>
    </div>
  );
};

export default DashboardHome;
