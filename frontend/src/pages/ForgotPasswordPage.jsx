import { useState } from "react";
import { ArrowLeft, ArrowRight, Link2, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import instance from "../axios";
import { getApiErrorMessage } from "../lib/apiErrors";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await instance.post("/user/forgot-password", { email: normalizedEmail });
      setSubmitted(true);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "We couldn't send the reset email right now. Please try again later."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] px-4 py-12 text-[#252823]">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-4xl border border-[#C7D3C0] bg-[#F7F4ED] p-6 shadow-xl shadow-[#8FA28A]/10 md:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8FA28A]">
              <Link2 className="h-7 w-7 text-[#F7F4ED]" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold">Forgot password?</h1>
            <p className="mt-2 text-sm text-[#5F655D]">
              Enter your email and we&apos;ll send you a secure reset link.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-5" aria-live="polite">
              <p className="rounded-xl border border-[#b8d2b6] bg-[#e8f1e6] px-4 py-3 text-sm text-[#3f7655]">
                If an account exists with this email, you will receive a password
                reset link shortly.
              </p>
              <p className="text-center text-sm text-[#5F655D]">
                Check your inbox and spam folder. The link expires in 15 minutes.
              </p>
              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8A96B] px-4 py-3 font-semibold text-[#252823] shadow-lg shadow-[#C8A96B]/20 transition hover:bg-[#b9984f]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
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
                <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-[#5F655D]" aria-hidden="true" />
                  <input
                    id="forgot-email"
                    autoComplete="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#C7D3C0] bg-[#F7F4ED] py-3 pl-11 pr-4 text-[#252823] outline-none transition focus:border-[#8FA28A]"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8A96B] px-4 py-3 font-semibold text-[#252823] shadow-lg shadow-[#C8A96B]/20 transition hover:bg-[#b9984f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Sending..." : "Send reset link"}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          {!submitted && (
            <p className="mt-6 text-center text-sm text-[#5F655D]">
              Remembered your password?{" "}
              <Link to="/login" className="font-semibold text-[#8FA28A] hover:text-[#74876f]">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
