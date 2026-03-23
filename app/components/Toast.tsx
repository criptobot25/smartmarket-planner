"use client";

import React, { createContext, useContext, useCallback, useState, useRef } from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastOptions {
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (message: string, variant?: ToastVariant, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info", options?: ToastOptions) => {
      const id = `toast-${++counterRef.current}`;
      setToasts((prev) => [...prev, { id, message, variant, ...options }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

// ───── Toast Container & Item ─────

const variantStyles: Record<ToastVariant, string> = {
  success:
    "bg-green-50 border-green-400 text-green-800",
  error:
    "bg-red-50 border-red-400 text-red-800",
  info:
    "bg-blue-50 border-blue-400 text-blue-800",
  warning:
    "bg-yellow-50 border-yellow-400 text-yellow-800",
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`border-l-4 px-4 py-3 rounded shadow-lg text-sm animate-slide-in ${variantStyles[t.variant]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p>{t.message}</p>
              {t.actionLabel && t.onAction && (
                <button
                  onClick={() => {
                    t.onAction?.();
                    onDismiss(t.id);
                  }}
                  className="mt-2 inline-flex items-center rounded border border-current px-2 py-1 text-xs font-semibold opacity-90 transition-opacity hover:opacity-100"
                >
                  {t.actionLabel}
                </button>
              )}
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="ml-1 font-bold opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
