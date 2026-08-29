/* oxlint-disable react/only-export-components -- provider and its tiny hooks belong together */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cx } from "./primitives";

type Toast = {
  id: number;
  message: string;
  tone: "info" | "error" | "success";
};

const ToastContext = createContext<{
  show: (message: string, tone?: Toast["tone"]) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const show = useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 5200);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cx(
              "pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 text-[14px] shadow-[var(--shadow-lift)] animate-fade-up",
              toast.tone === "error"
                ? "border-[var(--tint-ember-border)] bg-[var(--tint-ember-bg)] text-[var(--tint-ember-fg)]"
                : toast.tone === "success"
                  ? "border-[var(--tint-sage-border)] bg-[var(--tint-sage-bg)] text-[var(--tint-sage-fg)]"
                  : "border-[var(--border-strong)] bg-[var(--bg-raised)] text-[var(--text)]",
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx.show;
}

/** Turn a thrown Convex error into something a person can read. */
export function readableError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  // Convex wraps handler errors; the useful part is after the last "Uncaught Error:".
  const match = raw.match(/Uncaught Error:\s*([^\n]+)/);
  const message = (match ? match[1] : raw).split("\n")[0].trim();
  const cleaned = message.replace(/\s*at handler.*$/, "").trim();
  if (!cleaned || cleaned.length > 200) {
    return "Something went wrong. Please try again.";
  }
  return cleaned;
}
