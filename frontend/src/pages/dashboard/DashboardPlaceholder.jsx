import {
  BarChart3,
  Globe2,
  Link2,
  Plug,
  Rocket,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  WalletCards,
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
  StatusPill,
} from "../../components/dashboard/DashboardPrimitives";
import { formatCompact, getClicks } from "../../lib/dashboardData";
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
  if (loadError && !loading)
    return (
      <div className="mx-auto max-w-[1100px]">
        <PageIntro eyebrow="Analytics" title="Link analytics" description="Choose a link to inspect its recorded visit history and performance." />
        <DashboardCard><ErrorState description={loadError} onRetry={refetch} /></DashboardCard>
      </div>
    );
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageIntro
        eyebrow="Analytics"
        title="Link analytics"
        description="Choose a link to inspect its recorded visit history and performance."
      />
      <p className="mb-4 text-xs text-(--secondary-text)" role="status">{isFetching && !loading ? "Updating analytics…" : "Analytics refresh approximately every minute."}</p>
      {loadError && (
        <p role="alert" className="mb-4 rounded-xl border border-(--danger)/35 bg-(--danger-soft) px-4 py-3 text-sm text-(--danger)">
          {loadError}
        </p>
      )}
      <DashboardCard className="p-4 sm:p-5">
        <SectionHeading
          icon={BarChart3}
          title="Your tracked links"
          description="Only click events returned by the current API are shown."
        />
        <div className="mt-5 divide-y divide-[var(--border)]">
          {loading ? (
            <div className="space-y-4 py-3">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex items-center gap-4 py-2">
                  <LoadingBlock className="h-9 w-9" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <LoadingBlock className="h-4 w-2/5" />
                    <LoadingBlock className="h-3 w-3/5" />
                  </div>
                  <LoadingBlock className="h-4 w-12" />
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
              className="focus-ring flex w-full cursor-pointer items-center gap-4 py-4 text-left hover:bg-(--surface-soft)/45"
            >
              <span className="flex h-9 w-9 items-center text-(--primary-deep)">
                <Link2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm text-(--primary-text)">
                  ekurl.in/{url.shortID}
                </strong>
                <span className="block truncate text-xs text-(--secondary-text)">
                  {url.redirectUrl}
                </span>
              </span>
              <span className="text-right">
                <strong className="block text-sm text-(--primary-text)">
                  {formatCompact(getClicks(url))}
                </strong>
                <span className="text-xs text-(--secondary-text)">clicks</span>
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
export const BillingPage = () => (
  <PlaceholderPage
    icon={WalletCards}
    eyebrow="Plan & usage"
    title="Billing"
    description="Review your current plan and usage before you decide to upgrade."
    actionLabel="Create a short link"
    featureList={[
      {
        title: "Free plan",
        description: "The current workspace supports up to 1,000 links.",
      },
      {
        title: "Usage tracking",
        description: "Your usage summary lives in the dashboard sidebar.",
      },
      {
        title: "Upgrade path",
        description:
          "Payment and billing history will appear after a billing provider is connected.",
      },
    ]}
  />
);
