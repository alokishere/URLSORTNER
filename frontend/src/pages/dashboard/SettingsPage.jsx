import {
  Bell,
  ChevronRight,
  Globe2,
  Plug,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardCard, PageIntro, StatusPill } from "../../components/dashboard/DashboardPrimitives";
import { getInitials, getStoredUser } from "../../lib/dashboardData";

const settingsCards = [
  {
    title: "Profile",
    description: "View your profile details and account identity.",
    icon: UserRound,
    route: "/dashboard/settings/profile",
    label: "Account",
    tone: "primary",
  },
  {
    title: "Notifications",
    description: "Choose which activity and workspace updates you receive.",
    icon: Bell,
    route: "/dashboard/notifications",
    label: "Preferences",
    tone: "primary",
  },
  {
    title: "Security",
    description: "Change your name or password and manage account protection.",
    icon: ShieldCheck,
    route: "/dashboard/settings/security",
    label: "Protected",
    tone: "primary",
  },
  {
    title: "Custom domains",
    description: "Connect a branded domain for the links you share.",
    icon: Globe2,
    route: "/dashboard/domains",
    label: "Workspace",
    tone: "accent",
  },
  {
    title: "Integrations",
    description: "Connect the tools you use to distribute and understand links.",
    icon: Plug,
    route: "/dashboard/integrations",
    label: "Workspace",
    tone: "primary",
  },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const user = getStoredUser();

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageIntro
        eyebrow="Workspace settings"
        title="Settings"
        description="Manage your account, workspace preferences, and the tools connected to your short links."
      />

      <DashboardCard className="mb-4 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--primary) text-sm font-bold text-white">
            {getInitials(user)}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-(--primary-text)">{user?.fullName || user?.name || "Your account"}</p>
            <p className="mt-0.5 truncate text-sm text-(--secondary-text)">{user?.email || "Manage your account details and preferences"}</p>
          </div>
        </div>
        <StatusPill>Account active</StatusPill>
      </DashboardCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {settingsCards.map(({ title, description, icon: Icon, route, label }) => (
          <button
            type="button"
            key={title}
            onClick={() => navigate(route)}
            className="focus-ring dash-card dash-card-hover group min-h-48 cursor-pointer p-5 text-left transition sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center text-(--primary-deep)">
                <Icon className="semantic-icon h-5 w-5" aria-hidden="true" />
              </span>
              <ChevronRight className="mt-1 h-4 w-4 text-(--secondary-text) transition-transform group-hover:translate-x-1 group-hover:text-(--primary-text)" aria-hidden="true" />
            </div>
            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--secondary-text)">{label}</p>
            <h2 className="mt-1 text-base font-bold text-(--primary-text)">{title}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-(--secondary-text)">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
