import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
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
import GoogleSignInButton from "../../auth/GoogleSignInButton";
import { useAuth } from "../../auth/authStore";
import { getApiErrorMessage } from "../../lib/apiErrors";
import { getStoredUser } from "../../lib/dashboardData";
import { Button, DashboardCard, PageIntro } from "../../components/dashboard/DashboardPrimitives";

const Notice = ({ tone = "success", children }) => {
  const error = tone === "error";
  return (
    <div role={error ? "alert" : "status"} className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm ${error ? "border-(--danger)/25 bg-(--danger-soft) text-(--danger)" : "border-(--success)/25 bg-(--success-soft) text-(--success)"}`}>
      {error ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
      <span className="leading-5">{children}</span>
    </div>
  );
};

const PasswordField = ({ id, label, value, onChange, visible, onToggle, error, autoComplete }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-(--primary-text)">{label}</label>
    <div className="relative">
      <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--secondary-text)" aria-hidden="true" />
      <input id={id} type={visible ? "text" : "password"} value={value} onChange={onChange} autoComplete={autoComplete} className={`focus-ring min-h-11 w-full rounded-xl border bg-(--surface) py-2.5 pl-10 pr-12 text-sm text-(--primary-text) outline-none transition ${error ? "border-(--danger)" : "border-(--border)"}`} />
      <button type="button" onClick={onToggle} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} className="focus-ring absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-(--secondary-text) hover:bg-(--surface-soft)">
        {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
    {error && <p className="mt-1.5 text-xs font-medium text-(--danger)">{error}</p>}
  </div>
);

const SecurityPage = () => {
  const navigate = useNavigate();
  const { user, setAuthenticatedUser, clearSession } = useAuth();
  const account = user || getStoredUser() || {};
  const userId = account.id || account._id;
  const [fullName, setFullName] = useState(account.fullName || account.name || "");
  const [email, setEmail] = useState(account.email || "");
  const [emailVerification, setEmailVerification] = useState({ loading: false, email: "", credential: "", error: "" });
  const [nameError, setNameError] = useState("");
  const [profileState, setProfileState] = useState({ loading: false, message: "", error: "" });
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordVisible, setPasswordVisible] = useState({ current: false, next: false, confirm: false });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordState, setPasswordState] = useState({ loading: false, error: "" });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteState, setDeleteState] = useState({ loading: false, error: "" });

  const closePasswordModal = useCallback(() => {
    if (passwordState.loading) return;
    setPasswordOpen(false);
    setPasswords({ current: "", next: "", confirm: "" });
    setPasswordErrors({});
    setPasswordState({ loading: false, error: "" });
  }, [passwordState.loading]);

  useEffect(() => {
    if (!passwordOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closePasswordModal();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [closePasswordModal, passwordOpen]);

  const updateProfile = async (event) => {
    event.preventDefault();
    const normalizedName = fullName.trim();
    if (normalizedName.length < 2) {
      setNameError("Enter your full name.");
      return;
    }
    if (!userId) {
      setProfileState({ loading: false, message: "", error: "Your session is missing a user ID. Please sign in again." });
      return;
    }
    setNameError("");
    setProfileState({ loading: true, message: "", error: "" });
    try {
      const body = { fullName: normalizedName };
      if (emailVerification.credential) {
        body.email = emailVerification.email;
        body.googleCredential = emailVerification.credential;
      }
      const response = await instance.put(`/user/update/${userId}`, body);
      const nextUser = { ...account, ...(response.data?.user || {}), id: response.data?.user?.id || userId };
      setAuthenticatedUser(nextUser);
      setFullName(nextUser.fullName || normalizedName);
      setEmail(nextUser.email || email);
      setEmailVerification({ loading: false, email: "", credential: "", error: "" });
      setProfileState({ loading: false, message: emailVerification.credential ? "Your profile and verified email were updated." : "Your name was updated.", error: "" });
    } catch (error) {
      setProfileState({ loading: false, message: "", error: getApiErrorMessage(error, "We could not update your name right now.") });
    }
  };

  const verifyEmailWithGoogle = async (credential) => {
    if (emailVerification.loading) return;
    setEmailVerification({ loading: true, email: "", credential: "", error: "" });
    try {
      const response = await instance.post("/user/google/verify-email", { credential });
      const verifiedEmail = response.data?.email;
      if (!verifiedEmail) throw new Error("Google verification response was incomplete");
      setEmail(verifiedEmail);
      setEmailVerification({ loading: false, email: verifiedEmail, credential, error: "" });
    } catch (error) {
      setEmailVerification({ loading: false, email: "", credential: "", error: getApiErrorMessage(error, "We could not verify your email with Google. Please try again.") });
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    const errors = {};
    if (passwords.current.length < 6) errors.current = "Enter your current password.";
    if (passwords.next.length < 6) errors.next = "Use at least 6 characters.";
    if (passwords.next !== passwords.confirm) errors.confirm = "Passwords do not match.";
    setPasswordErrors(errors);
    if (Object.keys(errors).length || !userId) return;

    setPasswordState({ loading: true, error: "" });
    try {
      const response = await instance.put(`/user/update/${userId}`, { password: passwords.next, currentPassword: passwords.current });
      const nextUser = { ...account, ...(response.data?.user || {}), id: response.data?.user?.id || userId };
      setAuthenticatedUser(nextUser);
      setPasswords({ current: "", next: "", confirm: "" });
      setPasswordErrors({});
      setPasswordOpen(false);
      setPasswordState({ loading: false, error: "" });
      setProfileState({ loading: false, message: "Password updated successfully.", error: "" });
    } catch (error) {
      setPasswordState({ loading: false, error: getApiErrorMessage(error, "We could not update your password. Check your current password and try again.") });
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
      setDeleteState({ loading: false, error: getApiErrorMessage(error, "We could not delete your account right now.") });
    }
  };

  const setPasswordValue = (key) => (event) => setPasswords((current) => ({ ...current, [key]: event.target.value }));
  const togglePassword = (key) => setPasswordVisible((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageIntro
        eyebrow="Settings / Security"
        title="Security"
        description="Update your name, protect your account, and manage account access. Your email address cannot be changed."
        actions={<Button variant="quiet" onClick={() => navigate("/dashboard/settings/profile")}><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to profile</Button>}
      />

      <div className="space-y-4">
        <DashboardCard className="p-5 sm:p-7">
          <div className="flex items-start gap-3 border-b border-(--border) pb-5"><span className="flex h-10 w-10 items-center text-(--primary-deep)"><UserRound className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-base font-bold text-(--primary-text)">Personal details</h2><p className="mt-1 text-sm leading-6 text-(--secondary-text)">Update your name when you need to. Email stays locked to prevent account ownership issues.</p></div></div>
          <form onSubmit={updateProfile} className="mt-5 max-w-xl space-y-4">
            {profileState.message && <Notice>{profileState.message}</Notice>}
            {profileState.error && <Notice tone="error">{profileState.error}</Notice>}
            <div><label htmlFor="security-full-name" className="mb-2 block text-sm font-semibold text-(--primary-text)">Full name</label><input id="security-full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} className={`focus-ring min-h-11 w-full rounded-xl border bg-(--surface) px-3.5 text-sm text-(--primary-text) outline-none ${nameError ? "border-(--danger)" : "border-(--border)"}`} aria-invalid={Boolean(nameError)} />{nameError && <p className="mt-1.5 text-xs font-medium text-(--danger)">{nameError}</p>}</div>
            <div><label htmlFor="security-email" className="mb-2 block text-sm font-semibold text-(--primary-text)">Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--secondary-text)" aria-hidden="true" /><input id="security-email" value={email} readOnly disabled={!emailVerification.credential} className={`min-h-11 w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm outline-none ${emailVerification.credential ? "border-(--success)/60 bg-(--surface) text-(--primary-text)" : "cursor-not-allowed border-(--border) bg-(--surface-soft) text-(--secondary-text) opacity-80"}`} /></div><p className="mt-1.5 text-xs text-(--secondary-text)">{emailVerification.credential ? "Verified with Google. Save your profile to apply this email." : "Verify with Google below to change this email address."}</p></div>
            {emailVerification.error && <Notice tone="error">{emailVerification.error}</Notice>}
            <Button type="submit" disabled={profileState.loading || emailVerification.loading}>{profileState.loading ? "Saving…" : "Save profile"}</Button>
          </form>
        </DashboardCard>

        <DashboardCard className="p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-start gap-3"><span className="flex h-10 w-10 items-center text-(--primary-deep)"><KeyRound className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-base font-bold text-(--primary-text)">Password</h2><p className="mt-1 max-w-xl text-sm leading-6 text-(--secondary-text)">Change your password by confirming your current password and choosing a new one.</p></div></div><Button variant="secondary" onClick={() => { setPasswordErrors({}); setPasswordState({ loading: false, error: "" }); setPasswordOpen(true); }}>Change password</Button></div>
          {passwordState.error && !passwordOpen && <p className="mt-4 text-sm font-medium text-(--danger)">{passwordState.error}</p>}
        </DashboardCard>

        <DashboardCard className="p-5 sm:p-7">
          <div className="flex items-start gap-3 border-b border-(--border) pb-5"><span className="flex h-10 w-10 items-center text-(--primary-deep)"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-base font-bold text-(--primary-text)">Verify with Google</h2><p className="mt-1 max-w-xl text-sm leading-6 text-(--secondary-text)">Verify ownership of a Google email before applying it to this account. The Google identity is linked after the verified email is saved.</p></div></div><div className="mt-5 space-y-3">{emailVerification.email && <Notice>Google verified: {emailVerification.email}</Notice>}<GoogleSignInButton onCredential={verifyEmailWithGoogle} disabled={emailVerification.loading} /></div>
        </DashboardCard>

        <DashboardCard className="border-(--danger)/25 p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-(--danger)" aria-hidden="true" /><h2 className="text-base font-bold text-(--primary-text)">Delete account</h2></div><p className="mt-2 max-w-xl text-sm leading-6 text-(--secondary-text)">Permanently remove your account and access to all of your links. This action cannot be undone.</p>{deleteState.error && <p className="mt-3 text-sm font-medium text-(--danger)">{deleteState.error}</p>}</div><Button variant="secondary" className="border-(--danger)/35 text-(--danger) hover:border-(--danger) hover:bg-(--danger-soft)" onClick={() => setDeleteOpen(true)}>Delete account</Button></div>
        </DashboardCard>
      </div>

      {passwordOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--primary-text)/35 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closePasswordModal(); }}><div role="dialog" aria-modal="true" aria-labelledby="change-password-title" className="max-h-[calc(100dvh-3rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><h2 id="change-password-title" className="text-lg font-bold text-(--primary-text)">Change password</h2><p className="mt-1 text-sm leading-6 text-(--secondary-text)">Enter your current password, then choose a new password for your account.</p></div><button type="button" onClick={closePasswordModal} disabled={passwordState.loading} aria-label="Close change password dialog" className="focus-ring inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-(--secondary-text) hover:bg-(--surface-soft)"><X className="h-4 w-4" aria-hidden="true" /></button></div>{passwordState.error && <div className="mt-4"><Notice tone="error">{passwordState.error}</Notice></div>}<form onSubmit={updatePassword} className="mt-5 space-y-4"><PasswordField id="current-password" label="Current password" value={passwords.current} onChange={setPasswordValue("current")} visible={passwordVisible.current} onToggle={() => togglePassword("current")} error={passwordErrors.current} autoComplete="current-password" /><PasswordField id="new-password" label="New password" value={passwords.next} onChange={setPasswordValue("next")} visible={passwordVisible.next} onToggle={() => togglePassword("next")} error={passwordErrors.next} autoComplete="new-password" /><PasswordField id="confirm-password" label="Confirm new password" value={passwords.confirm} onChange={setPasswordValue("confirm")} visible={passwordVisible.confirm} onToggle={() => togglePassword("confirm")} error={passwordErrors.confirm} autoComplete="new-password" /><button type="button" onClick={() => { closePasswordModal(); navigate("/forgot-password", { state: { email: account.email || "" } }); }} className="focus-ring w-fit text-sm font-semibold text-(--primary-deep) hover:underline">Forgot your password? Reset it by email</button><div className="flex flex-col-reverse gap-2 border-t border-(--border) pt-4 sm:flex-row sm:justify-end"><Button variant="secondary" type="button" onClick={closePasswordModal} disabled={passwordState.loading}>Cancel</Button><Button type="submit" disabled={passwordState.loading}>{passwordState.loading ? "Updating…" : "Update password"}</Button></div></form></div></div>}

      {deleteOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--primary-text)/35 px-4 backdrop-blur-sm" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" className="w-full max-w-md rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center text-(--danger)"><AlertTriangle className="h-5 w-5" aria-hidden="true" /></span><div><h2 id="delete-account-title" className="text-base font-bold text-(--primary-text)">Delete your account?</h2><p className="mt-1 text-sm leading-6 text-(--secondary-text)">This permanently removes your profile, session, and access to your links. There is no undo.</p></div></div><button type="button" onClick={() => setDeleteOpen(false)} aria-label="Close delete account dialog" className="focus-ring inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-(--secondary-text) hover:bg-(--surface-soft)"><X className="h-4 w-4" aria-hidden="true" /></button></div><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleteState.loading}>Keep account</Button><Button className="bg-(--danger) text-white hover:bg-[#8f3f31]" onClick={deleteAccount} disabled={deleteState.loading}>{deleteState.loading ? "Deleting…" : "Yes, delete account"}</Button></div></div></div>}
    </div>
  );
};

export default SecurityPage;
