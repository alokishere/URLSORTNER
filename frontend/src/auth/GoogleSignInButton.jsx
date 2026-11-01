import { useEffect, useRef, useState } from "react";

let googleScriptPromise;
const googleRuntime = {
  clientId: null,
  callbacks: new Set(),
};

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-identity="true"]');
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => {
      googleScriptPromise = undefined;
      script.remove();
      reject(new Error("Google sign-in could not load"));
    }, { once: true });
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

const initializeGoogleIdentity = async (clientId) => {
  await loadGoogleScript();
  if (!window.google?.accounts?.id)
    throw new Error("Google sign-in could not initialize");
  if (googleRuntime.clientId && googleRuntime.clientId !== clientId)
    throw new Error("Google sign-in is configured with more than one client ID");

  if (!googleRuntime.clientId) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response?.credential) return;
        googleRuntime.callbacks.forEach((callback) => callback(response.credential));
      },
      cancel_on_tap_outside: true,
    });
    googleRuntime.clientId = clientId;
  }
};

const GoogleSignInButton = ({ onCredential, disabled = false }) => {
  const buttonRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState(clientId ? "loading" : "missing");

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) return undefined;
    let active = true;
    let unregister;

    initializeGoogleIdentity(clientId)
      .then(() => {
        if (!active || !buttonRef.current) return;
        const credentialCallback = (credential) => callbackRef.current?.(credential);
        googleRuntime.callbacks.add(credentialCallback);
        unregister = () => googleRuntime.callbacks.delete(credentialCallback);
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
      unregister?.();
    };
  }, [clientId]);

  if (status === "missing" || status === "error")
    return (
      <div className="text-center">
        <button type="button" disabled={disabled} onClick={() => setAttempted(true)}
          className="rounded-xl border border-(--border) px-4 py-3 text-sm">
          Google sign-in unavailable
        </button>
        {attempted && <p role="status" className="mt-2 text-xs text-(--secondary-text)">
          Google sign-in is temporarily unavailable. Please use email and password.
        </p>}
      </div>
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
