import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  Copy,
  ExternalLink,
  Link2,
  QrCode,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import instance from "../axios";
import { BarChart, InsightList } from "../components/dashboard/AnalyticsWidgets";
import {
  Button,
  DashboardCard,
  EmptyState,
  LoadingBlock,
  PageIntro,
  SectionHeading,
} from "../components/dashboard/DashboardPrimitives";
import {
  fetchUrls,
  formatDate,
  formatRelativeTime,
  getShortUrl,
  aggregateVisitField,
} from "../lib/dashboardData";

const getRangeDays = (range) => {
  if (range === "Last 7 days") return 7;
  if (range === "Last 90 days") return 90;
  return 28;
};

const buildChartData = (visits, range) => {
  const rangeDays = getRangeDays(range);
  const bucketSize = rangeDays === 7 ? 1 : rangeDays === 28 ? 2 : 6;
  const bucketCount = Math.ceil(rangeDays / bucketSize);
  const firstDate = new Date();
  firstDate.setHours(0, 0, 0, 0);
  firstDate.setDate(firstDate.getDate() - rangeDays + 1);

  return Array.from({ length: bucketCount }, (_, index) => {
    const start = new Date(firstDate);
    start.setDate(firstDate.getDate() + index * bucketSize);
    const end = new Date(start);
    end.setDate(start.getDate() + bucketSize);
    const bucketVisits = visits.filter((visit) => {
      const timestamp = new Date(visit.timestamp).getTime();
      return timestamp >= start.getTime() && timestamp < end.getTime();
    });

    return {
      label: start.toLocaleDateString("en-IN", {
        month: "short",
        day: "2-digit",
      }),
      total: bucketVisits.filter((visit) => visit.source !== "qr").length,
      qrScans: bucketVisits.filter((visit) => visit.source === "qr").length,
    };
  });
};

const BreakdownCard = ({ icon, title, items, emptyText }) => (
  <DashboardCard className="p-4 sm:p-5">
    <SectionHeading icon={icon} title={title} />
    {items.length ? (
      <InsightList items={items} />
    ) : (
      <p className="mt-5 text-sm leading-6 text-(--secondary-text)">{emptyText}</p>
    )}
  </DashboardCard>
);

const Analytics = () => {
  const { sortid } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [destination, setDestination] = useState("");
  const [range, setRange] = useState("Last 28 days");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    let active = true;
    Promise.all([
      instance.get(`/urls/${sortid}/analytics`),
      fetchUrls().catch(() => []),
    ])
      .then(([response, urls]) => {
        if (active) {
          setResult(response.data);
          setDestination(
            response.data.redirectUrl ||
              urls.find((url) => url.shortID === sortid)?.redirectUrl ||
              "",
          );
        }
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError.response?.data?.message ||
              requestError.response?.data?.error ||
              "We could not load this link analytics.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sortid]);

  const visits = useMemo(
    () => (Array.isArray(result?.visitHistory) ? result.visitHistory : []),
    [result],
  );
  const linkVisits = useMemo(() => visits.filter((visit) => visit.source !== "qr"), [visits]);
  const qrVisits = useMemo(() => visits.filter((visit) => visit.source === "qr"), [visits]);
  const orderedVisits = useMemo(
    () => [...visits].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [visits],
  );
  const latest = orderedVisits[0] || null;
  const shortUrl = getShortUrl({ ...result, shortID: sortid });
  const chartData = useMemo(() => buildChartData(visits, range), [range, visits]);
  const countryItems = useMemo(() => aggregateVisitField(visits, "country"), [visits]);
  const deviceItems = useMemo(() => aggregateVisitField(visits, "deviceType"), [visits]);
  const browserItems = useMemo(() => aggregateVisitField(visits, "browser"), [visits]);
  const osItems = useMemo(() => aggregateVisitField(visits, "os"), [visits]);
  const referrerItems = useMemo(() => aggregateVisitField(visits, "referrer"), [visits]);
  const pagedVisits = orderedVisits.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const totalPages = Math.max(1, Math.ceil(orderedVisits.length / pageSize));

  if (loading)
    return (
      <div className="mx-auto max-w-275">
        <LoadingBlock className="h-4 w-28" />
        <LoadingBlock className="mt-3 h-10 w-72" />
        <LoadingBlock className="mt-3 h-5 w-full max-w-xl" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <LoadingBlock className="h-28" />
          <LoadingBlock className="h-28" />
          <LoadingBlock className="h-28" />
        </div>
        <LoadingBlock className="mt-4 h-20" />
        <LoadingBlock className="mt-4 h-72" />
        <LoadingBlock className="mt-4 h-80" />
      </div>
    );

  return (
    <div className="mx-auto max-w-275">
      <PageIntro
        eyebrow="Link analytics"
        title={`ekurl.in/${sortid}`}
        description="Recorded visits for this short link. A visit ID identifies an event, not a verified unique person."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
            <Button onClick={() => navigator.clipboard.writeText(shortUrl)}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copy link
            </Button>
          </>
        }
      />
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-[#d9a79b] bg-[#f8e9e5] px-4 py-3 text-sm text-(--danger)"
        >
          {error}
        </div>
      )}
      <DashboardCard className="mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-(--secondary-text)">Destination</p>
          <a
            href={destination || result?.redirectUrl || result?.url || shortUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block truncate text-sm font-semibold text-(--primary-deep) hover:underline"
          >
            {destination || "Destination not returned by API"}
          </a>
        </div>
        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-(--border) px-3 text-xs font-semibold text-(--primary-text) hover:bg-(--surface-soft)"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Open link
        </a>
      </DashboardCard>
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <DashboardCard className="p-5">
          <p className="text-sm text-(--secondary-text)">Link clicks</p>
          <p className="mt-2 text-3xl font-bold text-(--primary-text)">
            {Number(result?.linkClicks ?? linkVisits.length)}
          </p>
        </DashboardCard>
        <DashboardCard className="p-5">
          <p className="text-sm text-(--secondary-text)">QR scans</p>
          <p className="mt-2 text-lg font-bold text-(--primary-text)">
            {Number(result?.qrScans ?? qrVisits.length)}
          </p>
          <p className="mt-1 text-xs text-(--secondary-text)">
            Scans are recorded only from current tracked QR codes.
          </p>
        </DashboardCard>
        <DashboardCard className="p-5">
          <p className="text-sm text-(--secondary-text)">Latest activity</p>
          <p className="mt-2 text-lg font-bold text-(--primary-text)">
            {latest ? formatDate(latest.timestamp) : "No visits yet"}
          </p>
          <p className="mt-1 text-xs text-(--secondary-text)">
            {latest
              ? formatRelativeTime(latest.timestamp)
              : "No event recorded"}
          </p>
        </DashboardCard>
      </div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <BreakdownCard
          icon={Link2}
          title="Top countries"
          items={countryItems}
          emptyText="No country data in these events."
        />
        <BreakdownCard
          icon={Link2}
          title="Devices"
          items={deviceItems}
          emptyText="No device data in these events."
        />
        <BreakdownCard
          icon={Link2}
          title="Browsers"
          items={browserItems}
          emptyText="No browser data in these events."
        />
        <BreakdownCard
          icon={Link2}
          title="Operating systems"
          items={osItems}
          emptyText="No OS data in these events."
        />
        <BreakdownCard
          icon={Link2}
          title="Referrers"
          items={referrerItems}
          emptyText="No referrer data in these events."
        />
      </div>
      <DashboardCard className="mb-4 p-4 sm:p-5">
        <SectionHeading
          icon={BarChart3}
          title="Link clicks and QR scans"
          action={
            <label className="relative">
              <span className="sr-only">Analytics date range</span>
              <select
                value={range}
                onChange={(event) => {
                  setRange(event.target.value);
                  setPage(1);
                }}
                className="focus-ring min-h-9 cursor-pointer appearance-none rounded-lg border border-(--border) bg-(--surface) py-1 pl-3 pr-8 text-xs text-(--primary-text)"
              >
                <option>Last 7 days</option>
                <option>Last 28 days</option>
                <option>Last 90 days</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--secondary-text)"
                aria-hidden="true"
              />
            </label>
          }
        />
        {visits.length ? (
          <BarChart
            data={chartData}
            showUnique
            primaryLabel="Link clicks"
            secondaryKey="qrScans"
            secondaryLabel="QR scans"
          />
        ) : (
          <EmptyState
            icon={BarChart3}
            title="No engagement activity yet"
            description="Link clicks and tracked QR scans will appear here."
          />
        )}
      </DashboardCard>
      <DashboardCard className="overflow-hidden">
        <div className="border-b border-(--border) p-4 sm:p-5">
          <SectionHeading
            icon={Link2}
            title="Visit history"
            description="Recorded event timestamps from the current API."
          />
        </div>
        {pagedVisits.length ? (
          <div className="dashboard-scrollbar overflow-x-auto">
            <table className="min-w-162.5 w-full text-left">
              <thead className="bg-(--surface-soft)/60">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    #
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    Time
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    Location
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    Device
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    Browser
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    OS
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    Referrer
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    Visit ID
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-(--secondary-text)">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedVisits.map((visit, index) => (
                  <tr
                    key={visit._id || `${visit.timestamp}-${index}`}
                    className="border-t border-(--border) hover:bg-(--surface-soft)/45"
                  >
                    <td className="px-4 py-3.5 text-sm text-(--secondary-text)">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-(--primary-text)">
                      {formatDate(visit.timestamp)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-(--secondary-text)">
                      {new Date(visit.timestamp).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-(--secondary-text)">
                      {[visit.country, visit.region, visit.city]
                        .filter((value) => value && value !== "unknown")
                        .join(", ") || "Unknown"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-(--secondary-text)">
                      {visit.deviceType || "Unknown"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-(--secondary-text)">
                      {visit.browser || "Unknown"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-(--secondary-text)">
                      {visit.os || "Unknown"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-(--secondary-text)">
                      {visit.referrer || "Unknown"}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-(--secondary-text)">
                      {visit._id || "Event ID unavailable"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-(--secondary-text)">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-(--surface-soft) px-2 py-1 text-xs font-medium text-(--primary-text)">
                        {visit.source === "qr" ? <QrCode className="h-3.5 w-3.5" aria-hidden="true" /> : <Link2 className="h-3.5 w-3.5" aria-hidden="true" />}
                        {visit.source === "qr" ? "QR scan" : "Link click"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Link2}
            title="No visits recorded"
            description="There is no event history for this link yet."
          />
        )}
        <div className="flex items-center justify-between border-t border-(--border) px-4 py-3 text-xs text-(--secondary-text)">
          <span>
            {orderedVisits.length
              ? `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, orderedVisits.length)} of ${orderedVisits.length}`
              : "0 visits"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="focus-ring min-h-9 cursor-pointer rounded-lg border border-(--border) px-3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="focus-ring min-h-9 cursor-pointer rounded-lg border border-(--border) px-3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default Analytics;
