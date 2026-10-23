import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, X } from "lucide-react";
import instance from "../axios";
import { consumePostAuthIntent, migrateGuestLinks } from "../lib/guestLinks";
import { useAuth } from "./authStore";
import { AuthModalContext } from "./authModalStore";

const AuthModal = ({ initialMode, next, onClose }) => {
  const [mode, setMode] = useState(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const dialog = useRef(null);
  const { setAuthenticatedUser } = useAuth();
  const navigate = useNavigate();
  const isSignup = mode === "register";

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => { if (element.open) element.close(); };
  }, []);

  const switchMode = () => { setMode(isSignup ? "login" : "register"); setErrors({}); setShowPassword(false); };
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    const validation = {};
    if (isSignup && fullName.trim().length < 2) validation.fullName = "Enter your full name.";
    if (!/\S+@\S+\.\S+/.test(email)) validation.email = "Enter a valid email address.";
    if (password.length < 6) validation.password = "Use at least 6 characters.";
    if (Object.keys(validation).length) { setErrors(validation); return; }
    setBusy(true); setErrors({});
    try {
      const response = await instance.post(isSignup ? "/user/register" : "/user/login", isSignup ? { fullName, email, password } : { email, password });
      if (!response.data?.user) {
        if (isSignup) { setMode("login"); setErrors({ form: "Account created. Please sign in." }); return; }
        throw new Error("The server did not return a user.");
      }
      try {
        const migration = await migrateGuestLinks();
        if (migration.claimed?.length) sessionStorage.setItem("urlsortner_auth_notice", `${migration.claimed.length} guest link${migration.claimed.length === 1 ? "" : "s"} added to your dashboard.`);
        if (migration.failed?.length) sessionStorage.setItem("urlsortner_auth_notice", `${migration.failed.length} guest link${migration.failed.length === 1 ? "" : "s"} could not be migrated and remain saved in this browser.`);
      } catch {
        sessionStorage.setItem("urlsortner_auth_notice", "Your guest links could not be migrated yet. They remain saved in this browser so you can retry later.");
      }
      const intent = consumePostAuthIntent();
      const intentPath = intent?.type === "analytics" && intent.shortID ? `/dashboard/links/${encodeURIComponent(intent.shortID)}/analytics` : intent?.type === "qr" && intent.shortID ? `/dashboard/links?qr=${encodeURIComponent(intent.shortID)}` : null;
      const safeNext = typeof next === "string" && /^\/dashboard(?:[/?#]|$)/.test(next) ? next : null;
      flushSync(() => setAuthenticatedUser(response.data.user));
      onClose(true);
      navigate(safeNext || intentPath || "/dashboard", { replace: true });
    } catch (error) {
      setErrors({ form: error.response?.data?.error || (isSignup ? "Account creation failed. Please try again." : "Sign in failed. Check your email and password.") });
    } finally { setBusy(false); }
  };

  const field = "focus-ring min-h-12 w-full rounded-xl border border-(--border) bg-(--background) px-4 text-base text-(--primary-text) transition focus:border-(--primary)";
  return (
    <dialog ref={dialog} onCancel={(event) => { if (busy) event.preventDefault(); else onClose(); }} onClick={(event) => { if (event.target === dialog.current && !busy) onClose(); }} aria-labelledby="auth-title" className="m-auto max-h-[calc(100dvh-2rem)] w-[min(100%-2rem,460px)] overflow-y-auto rounded-[24px] border border-(--border) bg-(--surface) p-0 text-(--primary-text) shadow-[0_24px_80px_rgba(17,24,18,0.25)] backdrop:bg-[#17251b]/55 backdrop:backdrop-blur-sm">
      <div className="relative p-6 sm:p-9">
        <button type="button" onClick={() => onClose()} disabled={busy} aria-label="Close" className="focus-ring absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-(--secondary-text) hover:bg-(--surface-soft) disabled:opacity-50"><X className="h-5 w-5" aria-hidden="true" /></button>
        <img src="/primarylogo.avif" alt="Ek URL" className="h-11 w-auto max-w-36 object-contain object-left" />
        <div className="mt-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--primary-deep)">{isSignup ? "Start sharing smarter" : "Your links are waiting"}</p><h2 id="auth-title" className="mt-2 text-3xl font-bold tracking-[-0.045em]">{isSignup ? "Create your account" : "Welcome back"}</h2><p className="mt-2 text-sm leading-6 text-(--secondary-text)">{isSignup ? "Save your links and see where they take you." : "Sign in to manage your links and see how they perform."}</p></div>
        <form onSubmit={submit} noValidate className="mt-7 space-y-4">
          {errors.form && <p role="alert" className="rounded-xl border border-(--danger)/35 bg-(--danger-soft) px-4 py-3 text-sm text-(--danger)">{errors.form}</p>}
          {isSignup && <div><label htmlFor="auth-name" className="mb-1.5 block text-sm font-semibold">Full name</label><input id="auth-name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className={field} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "auth-name-error" : undefined} />{errors.fullName && <p id="auth-name-error" className="mt-1 text-sm text-(--danger)">{errors.fullName}</p>}</div>}
          <div><label htmlFor="auth-email" className="mb-1.5 block text-sm font-semibold">Email address</label><input id="auth-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={field} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "auth-email-error" : undefined} />{errors.email && <p id="auth-email-error" className="mt-1 text-sm text-(--danger)">{errors.email}</p>}</div>
          <div><label htmlFor="auth-password" className="mb-1.5 block text-sm font-semibold">Password</label><div className="relative"><input id="auth-password" type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isSignup ? "At least 6 characters" : "Enter your password"} className={`${field} pr-14`} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "auth-password-error" : undefined} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="focus-ring absolute right-1 top-0.5 flex h-11 w-11 items-center justify-center rounded-lg text-(--secondary-text)">{showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}</button></div>{errors.password && <p id="auth-password-error" className="mt-1 text-sm text-(--danger)">{errors.password}</p>}</div>
          <button type="submit" disabled={busy} className="focus-ring mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--surface) transition hover:bg-(--accent-deep) disabled:cursor-wait disabled:opacity-60">{busy ? (isSignup ? "Creating account…" : "Signing in…") : (isSignup ? "Create account" : "Sign in")}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
        </form>
        <p className="mt-6 text-center text-sm text-(--secondary-text)">{isSignup ? "Already have an account?" : "New to Ek URL?"} <button type="button" disabled={busy} onClick={switchMode} className="focus-ring rounded-md font-semibold text-(--primary-deep) hover:underline">{isSignup ? "Sign in" : "Create an account"}</button></p>
      </div>
    </dialog>
  );
};

export const AuthModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const openAuth = useCallback((mode = "login", next = null) => setModal({ mode, next }), []);
  const closeAuth = useCallback((navigating = false) => {
    setModal(null);
    if (!navigating && location.state?.authMode) navigate(location.pathname + location.search + location.hash, { replace: true, state: null });
  }, [location, navigate]);
  const activeModal = modal || (location.state?.authMode ? { mode: location.state.authMode, next: location.state.next } : null);
  return <AuthModalContext.Provider value={openAuth}>{children}{activeModal && <AuthModal key={activeModal.mode} initialMode={activeModal.mode} next={activeModal.next} onClose={closeAuth} />}</AuthModalContext.Provider>;
};
