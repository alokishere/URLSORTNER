import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Link2, Lock } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import instance from "../axios";
import { getApiErrorMessage } from "../lib/apiErrors";

const validatePassword = (value) =>
  typeof value === "string" &&
  value.length >= 6 &&
  new TextEncoder().encode(value).length <= 1024;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token")?.trim() || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const previousPolicy = document.querySelector('meta[name="referrer"]');
    const meta = previousPolicy || document.createElement("meta");
    if (!previousPolicy) {
      meta.name = "referrer";
      document.head.appendChild(meta);
    }
    const previousContent = meta.getAttribute("content");
    meta.setAttribute("content", "no-referrer");
    return () => {
      if (previousPolicy && previousContent !== null)
        meta.setAttribute("content", previousContent);
      else if (!previousPolicy) meta.remove();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      setError("This reset link is missing or invalid. Request a new one.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await instance.post("/user/reset-password", { token, password });
      navigate("/login", {
        replace: true,
        state: { resetSuccess: "Password reset successfully. You can now sign in." },
      });
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "We could not reset your password. Request a new link and try again."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const invalidLink = !token;
  return (
    <div className="min-h-screen bg-[#F7F4ED] px-4 py-12 text-[#252823]">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-4xl border border-[#C7D3C0] bg-[#F7F4ED] p-6 shadow-xl shadow-[#8FA28A]/10 md:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8FA28A]">
              <Link2 className="h-7 w-7 text-[#F7F4ED]" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold">Create a new password</h1>
            <p className="mt-2 text-sm text-[#5F655D]">
              Choose a password you&apos;ll use the next time you sign in.
            </p>
          </div>

          {invalidLink ? (
            <div className="space-y-5" aria-live="polite">
              <p className="rounded-xl border border-[#d9a79b] bg-[#f8e9e5] px-4 py-3 text-sm text-[#8b3a2b]">
                This reset link is missing or invalid. Request a new link to continue.
              </p>
              <Link
                to="/forgot-password"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8A96B] px-4 py-3 font-semibold text-[#252823] shadow-lg shadow-[#C8A96B]/20 transition hover:bg-[#b9984f]"
              >
                Request a new link
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {error && (
                <p role="alert" className="rounded-xl border border-[#d9a79b] bg-[#f8e9e5] px-4 py-3 text-sm text-[#8b3a2b]">
                  {error}
                </p>
              )}
              <div>
                <label htmlFor="reset-password" className="mb-2 block text-sm font-medium">
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-[#5F655D]" aria-hidden="true" />
                  <input
                    id="reset-password"
                    autoComplete="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-[#C7D3C0] bg-[#F7F4ED] py-3 pl-11 pr-12 text-[#252823] outline-none transition focus:border-[#8FA28A]"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide new password" : "Show new password"}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-3.5 text-[#5F655D] transition hover:text-[#252823]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="reset-confirmation" className="mb-2 block text-sm font-medium">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-[#5F655D]" aria-hidden="true" />
                  <input
                    id="reset-confirmation"
                    autoComplete="new-password"
                    type={showConfirmation ? "text" : "password"}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full rounded-xl border border-[#C7D3C0] bg-[#F7F4ED] py-3 pl-11 pr-12 text-[#252823] outline-none transition focus:border-[#8FA28A]"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showConfirmation ? "Hide password confirmation" : "Show password confirmation"}
                    onClick={() => setShowConfirmation((visible) => !visible)}
                    className="absolute right-3 top-3.5 text-[#5F655D] transition hover:text-[#252823]"
                  >
                    {showConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8A96B] px-4 py-3 font-semibold text-[#252823] shadow-lg shadow-[#C8A96B]/20 transition hover:bg-[#b9984f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Updating password..." : "Reset password"}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-[#5F655D]">
            <Link to="/login" className="inline-flex items-center gap-2 font-semibold text-[#8FA28A] hover:text-[#74876f]">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
