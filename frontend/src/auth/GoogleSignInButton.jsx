import { useEffect, useRef, useState } from "react";

let googleScriptPromise;
const googleRuntime = {
  initializedClientId: null,
  callbacks: new Set(),
};

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-identity="true"]');
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = resolve;
    script.onerror = () => {
      googleScriptPromise = undefined;
      reject(new Error("Google sign-in could not load"));
    };
    document.head.appendChild(script);
  });
  return googleScriptPromise;
};

const initializeGoogleIdentity = async (clientId) => {
  await loadGoogleScript();

  if (!window.google?.accounts?.id) {
    throw new Error("Google sign-in could not initialize");
  }

  if (googleRuntime.initializedClientId && googleRuntime.initializedClientId !== clientId) {
    throw new Error("Google sign-in is configured with more than one client ID");
  }

  if (!googleRuntime.initializedClientId) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response?.credential) return;
        googleRuntime.callbacks.forEach((callback) => callback(response.credential));
      },
      cancel_on_tap_outside: true,
    });
    googleRuntime.initializedClientId = clientId;
  }
};

const GoogleSignInButton = ({ onCredential, disabled = false }) => {
  const buttonRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [status, setStatus] = useState(clientId ? "loading" : "missing");

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let active = true;
    let unregisterCallback;
    if (!clientId) return () => { active = false; };

    initializeGoogleIdentity(clientId)
      .then(() => {
        if (!active || !buttonRef.current || !window.google?.accounts?.id) return;

        const credentialCallback = (credential) => callbackRef.current?.(credential);
        googleRuntime.callbacks.add(credentialCallback);
        unregisterCallback = () => googleRuntime.callbacks.delete(credentialCallback);

        buttonRef.current.replaceChildren();
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 360,
        });
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));

    return () => {
      active = false;
      unregisterCallback?.();
    };
  }, [clientId]);

  if (status === "missing")
    return (
      <p className="rounded-xl border border-(--border) bg-(--surface-soft) px-4 py-3 text-center text-xs text-(--secondary-text)">
        Google sign-in is not configured for this environment.
      </p>
    );

  if (status === "error")
    return (
      <p role="status" className="rounded-xl border border-(--danger)/25 bg-(--danger-soft) px-4 py-3 text-center text-xs text-(--danger)">
        Google sign-in is unavailable right now. You can use email and password instead.
      </p>
    );

  return (
    <div
      ref={buttonRef}
      aria-busy={status !== "ready" || disabled}
      className={`flex min-h-11 justify-center overflow-hidden rounded-xl transition ${status !== "ready" || disabled ? "pointer-events-none opacity-60" : ""}`}
    />
  );
};

export default GoogleSignInButton;
