import { ArrowRight, CheckCircle2, Edit3, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/authStore";
import { getInitials, getStoredUser } from "../../lib/dashboardData";
import { Button, DashboardCard, PageIntro, StatusPill } from "../../components/dashboard/DashboardPrimitives";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const account = user || getStoredUser() || {};

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageIntro
        eyebrow="Settings / Profile"
        title="Your profile"
        description="View the personal details connected to your Ek URL account."
        actions={
          <>
            <Button variant="quiet" onClick={() => navigate("/dashboard/settings")}>Back to settings</Button>
            <Button onClick={() => navigate("/dashboard/settings/security")}>
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Edit profile
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
        <DashboardCard className="overflow-hidden p-0">
          <div className="bg-(--secondary)/45 px-5 py-8 text-center sm:px-6">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-(--primary) text-2xl font-bold text-white shadow-sm">
              {getInitials(account)}
            </span>
            <h2 className="mt-4 truncate text-base font-bold text-(--primary-text)">
              {account.fullName || account.name || "Your account"}
            </h2>
            <p className="mt-1 truncate text-xs text-(--secondary-text)">{account.email || "No email address"}</p>
            <StatusPill>Account active</StatusPill>
          </div>
          <div className="space-y-2 p-4 text-xs text-(--secondary-text)">
            <div className="flex items-center gap-2 rounded-xl bg-(--surface-soft)/65 px-3 py-2.5">
              <ShieldCheck className="h-4 w-4 text-(--success)" aria-hidden="true" />
              Your account is protected
            </div>
            <p className="px-1 leading-5">Need to change your name or password? Use the secure Security page.</p>
          </div>
        </DashboardCard>

        <div className="space-y-4">
          <DashboardCard className="p-5 sm:p-7">
            <div className="flex flex-col gap-4 border-b border-(--border) pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center text-(--primary-deep)"><UserRound className="h-4 w-4" aria-hidden="true" /></span>
                  <h2 className="text-base font-bold text-(--primary-text)">Profile information</h2>
                </div>
                <p className="mt-2 max-w-xl text-sm leading-6 text-(--secondary-text)">Your profile details are shown below. Email is fixed to protect account ownership.</p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-(--success-soft) px-2.5 py-1 text-[11px] font-semibold text-(--success)"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />Verified account</span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-(--border) bg-(--surface-soft)/40 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-(--secondary-text)"><UserRound className="h-4 w-4" aria-hidden="true" />Full name</div>
                <p className="mt-3 text-base font-semibold text-(--primary-text)">{account.fullName || account.name || "Not set"}</p>
              </div>
              <div className="rounded-2xl border border-(--border) bg-(--surface-soft)/40 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-(--secondary-text)"><Mail className="h-4 w-4" aria-hidden="true" />Email address</div>
                <p className="mt-3 truncate text-base font-semibold text-(--primary-text)">{account.email || "Not set"}</p>
                <p className="mt-1 text-xs text-(--secondary-text)">Email changes are not available.</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-base font-bold text-(--primary-text)">Account security</h2>
              <p className="mt-1 text-sm leading-6 text-(--secondary-text)">Update your name, change your password, link Google, or manage account deletion.</p>
            </div>
            <Button variant="secondary" onClick={() => navigate("/dashboard/settings/security")}>
              Open security <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
