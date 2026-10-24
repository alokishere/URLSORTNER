import {
  ArrowUpRight,
  BarChart3,
  Globe2,
  Link2,
  MousePointerClick,
  Plug,
  QrCode,
  Rocket,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  DashboardCard,
  ErrorState,
  EmptyState,
  LoadingBlock,
  PageIntro,
  SectionHeading,
  StatCard,
  StatusPill,
} from "../../components/dashboard/DashboardPrimitives";
import { formatCompact, getClicks, getShortUrl } from "../../lib/dashboardData";
import { useCreateLinkModal } from "../../components/dashboard/useCreateLinkModal";

import { useDashboardLinks } from "../../lib/dashboardQueries";
import { getQueryErrorMessage } from "../../lib/apiErrors";

export const PlaceholderPage = ({
  icon: Icon = Sparkles,
  eyebrow = "Workspace",
  title,
  description,
  featureList,
  actionLabel,
  actionRoute,
}) => {
  const navigate = useNavigate();
  const { openCreateLink } = useCreateLinkModal();
  const isCreateAction = actionLabel?.toLowerCase().includes("create");
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageIntro
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          actionLabel && (
            <Button
              onClick={() => (isCreateAction ? openCreateLink() : navigate(actionRoute || "/dashboard/create"))}
            >
              <Rocket className="h-4 w-4" aria-hidden="true" />
              {actionLabel}
            </Button>
          )
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {featureList.map((item) => (
          <DashboardCard key={item.title} className="p-5">
            <span className="flex h-10 w-10 items-center text-(--primary-deep)">
              <Icon className="semantic-icon h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-sm font-bold text-(--primary-text)">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-(--secondary-text)">
              {item.description}
            </p>
            <StatusPill tone="neutral">Coming next</StatusPill>
          </DashboardCard>
        ))}
      </div>
      <DashboardCard className="mt-4">
        <EmptyState
          icon={Icon}
          title="This workspace area is ready for your next step"
          description="The current backend does not expose this feature yet. The page is intentionally kept transparent until its data and actions are supported."
          action={
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              <Link2 className="h-4 w-4" aria-hidden="true" />
              Back to dashboard
            </Button>
          }
        />
      </DashboardCard>
    </div>
  );
};

export const AnalyticsOverview = () => {
  const navigate = useNavigate();
  const { openCreateLink } = useCreateLinkModal();
  const { data: urls = [], isLoading: loading, isFetching, error, refetch } = useDashboardLinks();
  const loadError = error ? getQueryErrorMessage(error, "We could not load analytics right now.") : "";
  const totals = urls.reduce(
    (result, url) => {
      const clicks = Number(url.linkClicks ?? getClicks(url) ?? 0);
      const scans = Number(url.qrScans || 0);
      result.clicks += clicks;
      result.scans += scans;
      result.visits += Number(url.totalVisits || clicks + scans);
      return result;
    },
    { clicks: 0, scans: 0, visits: 0 },
  );

  if (loadError && !loading)
    return (
      <div className="mx-auto max-w-[1100px]">
        <PageIntro
          eyebrow="Analytics"
          title="Link analytics"
          description="Choose a link to inspect its recorded visit history and performance."
          actions={<Button onClick={openCreateLink}>Create short URL</Button>}
        />
        <DashboardCard><ErrorState description={loadError} onRetry={refetch} /></DashboardCard>
      </div>
    );
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageIntro
        eyebrow="Analytics"
        title="Link analytics"
        description="Choose a link to inspect its recorded visit history and performance."
        actions={<Button onClick={openCreateLink}>Create short URL</Button>}
      />
      <p className="mb-4 text-xs text-(--secondary-text)" role="status">
        {isFetching && !loading ? "Updating analytics…" : "Analytics refresh approximately every minute."}
      </p>
      {loadError && (
        <p role="alert" className="mb-4 rounded-xl border border-(--danger)/35 bg-(--danger-soft) px-4 py-3 text-sm text-(--danger)">
          {loadError}
        </p>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={MousePointerClick}
          label="Link clicks"
          value={formatCompact(totals.clicks)}
          helper="Direct short-link visits"
        />
        <StatCard
          icon={QrCode}
          label="QR scans"
          value={formatCompact(totals.scans)}
          helper="Visits from QR codes"
        />
        <StatCard
          icon={Link2}
          label="Tracked links"
          value={formatCompact(urls.length)}
          helper="Links with analytics"
        />
        <StatCard
          icon={BarChart3}
          label="Total visits"
          value={formatCompact(totals.visits)}
          helper="Clicks and scans combined"
        />
      </div>

      <DashboardCard className="p-4 sm:p-5">
        <SectionHeading
          icon={BarChart3}
          title="Your tracked links"
          description="Compare clicks and QR scans, then open a link for its full visit history."
        />
        <div className="mt-5 space-y-2">
          {loading ? (
            <div className="space-y-4 py-3">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex items-center gap-4 rounded-2xl border border-(--border) p-4">
                  <LoadingBlock className="h-11 w-11 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <LoadingBlock className="h-4 w-2/5" />
                    <LoadingBlock className="h-3 w-3/5" />
                  </div>
                  <LoadingBlock className="hidden h-10 w-28 sm:block" />
                  <LoadingBlock className="h-10 w-10 rounded-xl" />
                </div>
              ))}
            </div>
          ) : urls.length ? urls.map((url) => (
            <button
              type="button"
              key={url._id || url.shortID}
              onClick={() =>
                navigate(`/dashboard/links/${url.shortID}/analytics`)
              }
              className="focus-ring group flex w-full cursor-pointer flex-col gap-4 rounded-2xl border border-transparent p-3 text-left transition hover:border-(--border) hover:bg-(--surface-soft)/65 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5 sm:p-4"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--secondary)/65 text-(--primary-deep)">
                  <Link2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-sm font-bold text-(--primary-text)" title={url.title || getShortUrl(url)}>
                    {url.title?.trim() || getShortUrl(url)}
                  </strong>
                  <span className="mt-1 block truncate text-xs text-(--primary-deep)">
                    {getShortUrl(url)}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-(--secondary-text)">
                    {url.redirectUrl}
                  </span>
                </span>
              </span>
              <span className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-(--surface-soft) px-3">
                  <MousePointerClick className="h-4 w-4 text-(--primary-deep)" aria-hidden="true" />
                  <span>
                    <strong className="block text-sm text-(--primary-text)">
                      {formatCompact(Number(url.linkClicks ?? getClicks(url) ?? 0))}
                    </strong>
                    <span className="block text-[11px] text-(--secondary-text)">clicks</span>
                  </span>
                </span>
                <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-(--surface-soft) px-3">
                  <QrCode className="h-4 w-4 text-(--primary-deep)" aria-hidden="true" />
                  <span>
                    <strong className="block text-sm text-(--primary-text)">
                      {formatCompact(Number(url.qrScans || 0))}
                    </strong>
                    <span className="block text-[11px] text-(--secondary-text)">scans</span>
                  </span>
                </span>
              </span>
              <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-(--border) px-3 text-xs font-semibold text-(--primary-text) transition group-hover:border-(--primary-deep) group-hover:text-(--primary-deep)">
                View analytics
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>
          )) : (
            <EmptyState
              icon={BarChart3}
              title="No analytics yet"
              description="Create a link and share it to start collecting visit history."
              action={
                <Button onClick={openCreateLink}>
                  Create short URL
                </Button>
              }
            />
          )}
        </div>
      </DashboardCard>
    </div>
  );
};

export const BioPagesPage = () => (
  <PlaceholderPage
    icon={Sparkles}
    eyebrow="New"
    title="Bio pages"
    description="Bring your links together in one simple, shareable profile page."
    actionLabel="Create a short link"
    featureList={[
      {
        title: "Flexible blocks",
        description:
          "Add links, social profiles, and calls to action in one place.",
      },
      {
        title: "Brand controls",
        description: "Customize the look and feel of your public page.",
      },
      {
        title: "Audience insights",
        description: "Measure which links your audience uses most.",
      },
    ]}
  />
);
export const DomainsPage = () => (
  <PlaceholderPage
    icon={Globe2}
    eyebrow="Workspace settings"
    title="Custom domains"
    description="Connect a branded domain to make every short link feel like yours."
    actionLabel="Review settings"
    actionRoute="/dashboard/settings"
    featureList={[
      {
        title: "Domain setup",
        description:
          "Add a domain and follow the DNS records required for verification.",
      },
      {
        title: "Verification status",
        description:
          "Verification must come from the backend; this screen never simulates success.",
      },
      {
        title: "Branded links",
        description:
          "Use a verified domain when the link service exposes that capability.",
      },
    ]}
  />
);
export const CampaignsPage = () => (
  <PlaceholderPage
    icon={SlidersHorizontal}
    eyebrow="Campaigns (UTM)"
    title="Campaigns"
    description="Plan consistent UTM parameters for your marketing links."
    actionLabel="Create a short link"
    featureList={[
      {
        title: "UTM builder",
        description:
          "Campaign, source, medium, term, and content fields are ready for backend support.",
      },
      {
        title: "Performance",
        description:
          "Campaign reporting will use associated link events when supported.",
      },
      {
        title: "Reusable templates",
        description: "Save naming conventions for your next launch.",
      },
    ]}
  />
);
export const ToolsPage = () => (
  <PlaceholderPage
    icon={Wrench}
    eyebrow="Tools"
    title="Link tools"
    description="A directory for the utilities that make short-link work faster."
    featureList={[
      {
        title: "URL shortener",
        description: "Create and manage links from the main dashboard.",
      },
      {
        title: "QR generator",
        description:
          "QR code generation will be added when a safe encoder flow is connected.",
      },
      {
        title: "UTM builder",
        description:
          "Campaign tagging is planned for the next backend milestone.",
      },
    ]}
  />
);
export const IntegrationsPage = () => (
  <PlaceholderPage
    icon={Plug}
    eyebrow="Workspace"
    title="Integrations"
    description="Connect the tools you use to distribute and understand your links."
    featureList={[
      {
        title: "Connection status",
        description:
          "Only integrations with a real connection state will appear here.",
      },
      {
        title: "Event delivery",
        description:
          "Send supported link events to your connected destinations.",
      },
      {
        title: "Access controls",
        description: "Keep permissions visible before enabling a connection.",
      },
    ]}
  />
);
export const SettingsPage = () => (
  <PlaceholderPage
    icon={Settings2}
    eyebrow="Workspace settings"
    title="Settings"
    description="Manage your workspace profile, security, and notification preferences."
    featureList={[
      {
        title: "Profile",
        description:
          "Your account name and email are managed by the current authentication service.",
      },
      {
        title: "Security",
        description:
          "Password and session controls will appear when supported by the backend.",
      },
      {
        title: "Notifications",
        description:
          "Notification preferences are reserved for a connected event service.",
      },
    ]}
  />
);
