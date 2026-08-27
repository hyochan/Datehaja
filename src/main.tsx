import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { getConvexUrl } from "@convex-dev/static-hosting";
import App from "./App";
import { ToastProvider } from "./components/ui/Toast";
import { I18nProvider } from "./i18n";
import "./styles/index.css";

/**
 * On a `*.convex.site` deployment the page is served by the same Convex
 * deployment it talks to, so the client URL is derived from the hostname.
 * The env var wins so a custom domain (or local dev) still works.
 */
function resolveConvexUrl(): string {
  const fromEnv = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (fromEnv) return fromEnv;
  try {
    return getConvexUrl();
  } catch {
    throw new Error(
      "No Convex URL. Set VITE_CONVEX_URL, or serve this app from *.convex.site.",
    );
  }
}

const convex = new ConvexReactClient(resolveConvexUrl(), {
  // Keep an unauthenticated view rendering instead of flashing a blank screen.
  expectAuth: false,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BrowserRouter>
      </ConvexAuthProvider>
    </I18nProvider>
  </StrictMode>,
);
