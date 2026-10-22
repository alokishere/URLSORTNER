import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import instance from "../../axios";
import { useAuth } from "../../auth/authStore";
import { getInitials, getStoredUser } from "../../lib/dashboardData";
import { Button, DashboardCard, PageIntro } from "../../components/dashboard/DashboardPrimitives";

const getApiMessage = (error, fallback) =>
  error?.response?.data?.error || error?.response?.data?.message || fallback;

const ProfileField = ({ id, label, value, onChange, type = "text", icon: Icon, error }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-(--primary-text)">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--secondary-text)"
          aria-hidden="true"
        />
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`focus-ring min-h-11 w-full rounded-xl border bg-(--surface) py-2.5 ${Icon ? "pl-10" : "px-3.5"} pr-3.5 text-sm text-(--primary-text) outline-none transition placeholder:text-(--secondary-text)/70 ${error ? "border-(--danger)" : "border-(--border)"}`}
      />
    </div>
    {error && <p className="mt-1.5 text-xs font-medium text-(--danger)">{error}</p>}
  </div>
);

const PasswordField = ({ id, label, value, onChange, visible, onToggle, error, autoComplete }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-(--primary-text)">
      {label}
    </label>
    <div className="relative">
      <LockKeyhole
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--secondary-text)"
        aria-hidden="true"
      />
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`focus-ring min-h-11 w-full rounded-xl border bg-(--surface) py-2.5 pl-10 pr-12 text-sm text-(--primary-text) outline-none transition placeholder:text-(--secondary-text)/70 ${error ? "border-(--danger)" : "border-(--border)"}`}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        className="focus-ring absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-(--secondary-text) transition hover:bg-(--surface-soft) hover:text-(--primary-text)"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
    {error && <p className="mt-1.5 text-xs font-medium text-(--danger)">{error}</p>}
  </div>
);

const Notice = ({ tone = "success", children, onDismiss }) => {
  const isError = tone === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm ${isError ? "border-(--danger)/25 bg-[#f8e8e4] text-(--danger)" : "border-(--success)/25 bg-[#e8f1e6] text-(--success)"}`}
    >
      {isError ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
      <span className="flex-1 leading-5">{children}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss message" className="focus-ring inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { clearSession } = useAuth();
  const storedUser = getStoredUser();
  const userId = storedUser?.id || storedUser?._id;
  const initialProfile = useMemo(
    () => ({
      fullName: storedUser?.fullName || storedUser?.name || "",
      email: storedUser?.email || "",
    }),
    [storedUser?.email, storedUser?.fullName, storedUser?.name],
  );
  const [profile, setProfile] = useState(initialProfile);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileState, setProfileState] = useState({ loading: false, message: "", error: "" });
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordVisible, setPasswordVisible] = useState({ current: false, next: false, confirm: false });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordState, setPasswordState] = useState({ loading: false, message: "", error: "" });
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState(initialProfile.email);
  const [forgotState, setForgotState] = useState({ loading: false, message: "", error: "" });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteState, setDeleteState] = useState({ loading: false, error: "" });

  const updateProfile = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (profile.fullName.trim().length < 2) nextErrors.fullName = "Enter your full name.";
    if (!/\S+@\S+\.\S+/.test(profile.email)) nextErrors.email = "Enter a valid email address.";
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length || !userId) {
      if (!userId) setProfileState({ loading: false, message: "", error: "Your session is missing a user ID. Please sign in again." });
      return;
    }

    setProfileState({ loading: true, message: "", error: "" });
    try {
      const response = await instance.put(`/user/update/${userId}`, {
        fullName: profile.fullName.trim(),
        email: profile.email.trim().toLowerCase(),
      });
      const nextUser = { ...storedUser, ...(response.data?.user || {}), id: response.data?.user?.id || userId };
      localStorage.setItem("user", JSON.stringify(nextUser));
      setProfile(nextUser);
      setForgotEmail(nextUser.email || "");
      setProfileState({ loading: false, message: "Profile details saved.", error: "" });
    } catch (error) {
      setProfileState({ loading: false, message: "", error: getApiMessage(error, "We could not save your profile right now.") });
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (passwords.current.length < 6) nextErrors.current = "Enter your current password.";
    if (passwords.next.length < 6) nextErrors.next = "Use at least 6 characters.";
    if (passwords.next !== passwords.confirm) nextErrors.confirm = "Passwords do not match.";
    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length || !userId) return;

    setPasswordState({ loading: true, message: "", error: "" });
    try {
      const response = await instance.put(`/user/update/${userId}`, {
        fullName: profile.fullName.trim(),
        email: profile.email.trim().toLowerCase(),
        password: passwords.next,
        currentPassword: passwords.current,
      });
      const nextUser = { ...storedUser, ...(response.data?.user || {}), id: response.data?.user?.id || userId };
      localStorage.setItem("user", JSON.stringify(nextUser));
      setPasswords({ current: "", next: "", confirm: "" });
      setPasswordState({ loading: false, message: "Password updated successfully.", error: "" });
    } catch (error) {
      setPasswordState({ loading: false, message: "", error: getApiMessage(error, "We could not update your password. Check your current password and try again.") });
    }
  };

  const requestPasswordReset = async (event) => {
    event.preventDefault();
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotState({ loading: false, message: "", error: "Enter a valid email address." });
      return;
    }
    setForgotState({ loading: true, message: "", error: "" });
    try {
      await instance.post("/user/forgot-password", { email: forgotEmail.trim().toLowerCase() });
      setForgotState({ loading: false, message: "If an account exists for that email, a reset link is on its way.", error: "" });
    } catch (error) {
      setForgotState({ loading: false, message: "", error: getApiMessage(error, "The password reset service is not available yet. Add POST /user/forgot-password to enable it.") });
    }
  };

  const deleteAccount = async () => {
    if (!userId) return;
    setDeleteState({ loading: true, error: "" });
    try {
      await instance.delete(`/user/delete/${userId}`);
      clearSession();
      navigate("/", { replace: true });
    } catch (error) {
      setDeleteState({ loading: false, error: getApiMessage(error, "We could not delete your account right now.") });
    }
  };

  const setPasswordValue = (key) => (event) => setPasswords((current) => ({ ...current, [key]: event.target.value }));
  const togglePassword = (key) => setPasswordVisible((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageIntro
        eyebrow="Settings / Profile"
        title="Your profile"
        description="Keep your account details current and manage the credentials that protect your links."
        actions={
          <Button variant="quiet" onClick={() => navigate("/dashboard/settings")}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to settings
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        <aside className="dash-card p-2 lg:sticky lg:top-25">
          <div className="flex items-center gap-3 border-b border-(--border) px-3 py-3 lg:block lg:border-b-0 lg:px-2 lg:pb-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--primary) text-sm font-bold text-white">
              {getInitials(storedUser)}
            </span>
            <div className="min-w-0 lg:mt-3">
              <p className="truncate text-sm font-bold text-(--primary-text)">{profile.fullName || "Your account"}</p>
              <p className="truncate text-xs text-(--secondary-text)">{profile.email || "Add an email address"}</p>
            </div>
          </div>
          <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto p-1 lg:block lg:space-y-1 lg:p-0">
            <a href="#profile-details" className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-(--surface-soft) px-3 text-sm font-semibold text-(--primary-text)">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              Profile
            </a>
            <a href="#password" className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm text-(--secondary-text) transition hover:bg-(--surface-soft) hover:text-(--primary-text)">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Security
            </a>
          </nav>
        </aside>

        <div className="space-y-4">
          <DashboardCard id="profile-details" className="scroll-mt-24 p-5 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-(--border) pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--secondary)/65 text-(--primary-deep)">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h2 className="text-base font-bold text-(--primary-text)">Profile details</h2>
                </div>
                <p className="mt-2 max-w-xl text-sm leading-6 text-(--secondary-text)">This information appears on your account and is used for sign-in.</p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#e8f1e6] px-2.5 py-1 text-[11px] font-semibold text-(--success)">
                <Check className="h-3.5 w-3.5" aria-hidden="true" /> Active account
              </span>
            </div>
            <form onSubmit={updateProfile} className="mt-5 space-y-4">
              {profileState.message && <Notice onDismiss={() => setProfileState((current) => ({ ...current, message: "" }))}>{profileState.message}</Notice>}
              {profileState.error && <Notice tone="error" onDismiss={() => setProfileState((current) => ({ ...current, error: "" }))}>{profileState.error}</Notice>}
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileField id="full-name" label="Full name" value={profile.fullName} onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))} icon={UserRound} error={profileErrors.fullName} />
                <ProfileField id="email" label="Email address" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} type="email" icon={Mail} error={profileErrors.email} />
              </div>
              <div className="flex flex-col gap-3 border-t border-(--border) pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-(--secondary-text)">Changes are saved to your account immediately.</p>
                <Button type="submit" disabled={profileState.loading}>
                  {profileState.loading ? "Saving changes…" : "Save changes"}
                </Button>
              </div>
            </form>
          </DashboardCard>

          <DashboardCard id="password" className="scroll-mt-24 p-5 sm:p-6">
            <div className="border-b border-(--border) pb-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--secondary)/65 text-(--primary-deep)">
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="text-base font-bold text-(--primary-text)">Password & security</h2>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-6 text-(--secondary-text)">Use a unique password to keep your short links and account data secure.</p>
            </div>
            <form onSubmit={updatePassword} className="mt-5 space-y-4">
              {passwordState.message && <Notice onDismiss={() => setPasswordState((current) => ({ ...current, message: "" }))}>{passwordState.message}</Notice>}
              {passwordState.error && <Notice tone="error" onDismiss={() => setPasswordState((current) => ({ ...current, error: "" }))}>{passwordState.error}</Notice>}
              <PasswordField id="current-password" label="Current password" value={passwords.current} onChange={setPasswordValue("current")} visible={passwordVisible.current} onToggle={() => togglePassword("current")} error={passwordErrors.current} autoComplete="current-password" />
              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordField id="new-password" label="New password" value={passwords.next} onChange={setPasswordValue("next")} visible={passwordVisible.next} onToggle={() => togglePassword("next")} error={passwordErrors.next} autoComplete="new-password" />
                <PasswordField id="confirm-password" label="Confirm new password" value={passwords.confirm} onChange={setPasswordValue("confirm")} visible={passwordVisible.confirm} onToggle={() => togglePassword("confirm")} error={passwordErrors.confirm} autoComplete="new-password" />
              </div>
              <div className="flex flex-col gap-3 border-t border-(--border) pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={() => setForgotOpen((open) => !open)} className="focus-ring inline-flex min-h-10 w-fit cursor-pointer items-center gap-1 text-sm font-semibold text-(--primary-deep) hover:underline">
                  Forgot password?
                  <ChevronRight className={`h-4 w-4 transition-transform ${forgotOpen ? "rotate-90" : ""}`} aria-hidden="true" />
                </button>
                <Button type="submit" disabled={passwordState.loading}>
                  {passwordState.loading ? "Updating password…" : "Update password"}
                </Button>
              </div>
            </form>
            {forgotOpen && (
              <div className="mt-4 rounded-xl border border-(--border) bg-(--surface-soft)/55 p-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-(--primary-deep)" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-bold text-(--primary-text)">Send a reset link</h3>
                    <p className="mt-1 text-xs leading-5 text-(--secondary-text)">We’ll email instructions to the address on your account.</p>
                  </div>
                </div>
                <form onSubmit={requestPasswordReset} className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <label htmlFor="forgot-email" className="sr-only">Email address for password reset</label>
                  <input id="forgot-email" type="email" value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} className="focus-ring min-h-11 min-w-0 flex-1 rounded-xl border border-(--border) bg-(--surface) px-3.5 text-sm text-(--primary-text)" />
                  <Button type="submit" variant="secondary" disabled={forgotState.loading}>{forgotState.loading ? "Sending…" : "Email reset link"}</Button>
                </form>
                {forgotState.message && <p className="mt-3 text-xs font-medium text-(--success)">{forgotState.message}</p>}
                {forgotState.error && <p className="mt-3 text-xs font-medium text-(--danger)">{forgotState.error}</p>}
              </div>
            )}
          </DashboardCard>

          <DashboardCard className="border-(--danger)/25 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8e8e4] text-(--danger)">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h2 className="text-base font-bold text-(--primary-text)">Delete account</h2>
                </div>
                <p className="mt-2 max-w-xl text-sm leading-6 text-(--secondary-text)">Permanently remove your profile and account access. This action cannot be undone.</p>
                {deleteState.error && <p className="mt-3 text-sm font-medium text-(--danger)">{deleteState.error}</p>}
              </div>
              <Button variant="secondary" className="border-(--danger)/35 text-(--danger) hover:border-(--danger) hover:bg-[#f8e8e4]" onClick={() => setDeleteOpen(true)}>
                Delete account
              </Button>
            </div>
          </DashboardCard>
        </div>
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--primary-text)/35 px-4 backdrop-blur-sm" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" className="w-full max-w-md rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f8e8e4] text-(--danger)">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="delete-account-title" className="text-base font-bold text-(--primary-text)">Delete your account?</h2>
                  <p className="mt-1 text-sm leading-6 text-(--secondary-text)">Your account and access to all of your links will be removed permanently.</p>
                </div>
              </div>
              <button type="button" onClick={() => setDeleteOpen(false)} aria-label="Close delete account dialog" className="focus-ring inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-(--secondary-text) hover:bg-(--surface-soft)">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleteState.loading}>Keep account</Button>
              <Button className="bg-(--danger) text-white hover:bg-[#8f3f31]" onClick={deleteAccount} disabled={deleteState.loading}>
                {deleteState.loading ? "Deleting…" : "Yes, delete account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
