import { useCallback, useEffect, useMemo, useState } from "react";
import instance from "../axios";
import { queryClient } from "../lib/queryClient";
import { AuthContext } from "./authStore";

export const AuthProvider = ({ children }) => {
  const [status, setStatus] = useState("checking");
  const [user, setUser] = useState(null);

  const verifySession = useCallback(async () => {
    setStatus("checking");
    try {
      const response = await instance.get("/user/session");
      const verifiedUser = response.data?.user || null;
      if (!verifiedUser)
        throw new Error("Session response did not include a user");
      queryClient.clear();
      localStorage.setItem("user", JSON.stringify(verifiedUser));
      setUser(verifiedUser);
      setStatus("authenticated");
      return verifiedUser;
    } catch {
      queryClient.clear();
      localStorage.removeItem("user");
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  const setAuthenticatedUser = useCallback((nextUser) => {
    queryClient.clear();
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
    setStatus("authenticated");
  }, []);

  const clearSession = useCallback(() => {
    queryClient.clear();
    localStorage.removeItem("user");
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    const interceptor = instance.interceptors.response.use(
      undefined,
      (error) => {
        const requestUrl = error.config?.url || "";
        const protectedRequest = ["/urls", "/user/session", "/user/update", "/user/delete"]
          .some((prefix) => requestUrl.startsWith(prefix));
        if (status === "authenticated" && error.response?.status === 401 && protectedRequest) {
          sessionStorage.setItem("urlsortner_auth_error", "Your session has expired. Please sign in again.");
          clearSession();
        }
        return Promise.reject(error);
      },
    );
    return () => instance.interceptors.response.eject(interceptor);
  }, [status, clearSession]);

  useEffect(() => {
    let active = true;
    instance
      .get("/user/session")
      .then((response) => {
        if (!active) return;
        const verifiedUser = response.data?.user;
        if (!verifiedUser)
          throw new Error("Session response did not include a user");
        localStorage.setItem("user", JSON.stringify(verifiedUser));
        setUser(verifiedUser);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem("user");
        setUser(null);
        setStatus("unauthenticated");
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      verifySession,
      setAuthenticatedUser,
      clearSession,
    }),
    [clearSession, setAuthenticatedUser, status, user, verifySession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthLoadingScreen = () => (
  <div
    className="flex min-h-dvh items-center justify-center bg-(--background) px-4"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) px-5 py-4 text-sm text-(--secondary-text) shadow-sm">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-(--border) border-t-(--primary) motion-reduce:animate-none"
        aria-hidden="true"
      />
      Checking your session…
    </div>
  </div>
);
