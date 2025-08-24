"use client";

import React from "react";
import { useUIStore } from "@/lib/store";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastAnnouncer() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const icon = {
          default: <Info className="h-4 w-4" />,
          success: <CheckCircle className="h-4 w-4" />,
          error: <AlertCircle className="h-4 w-4" />,
          warning: <AlertTriangle className="h-4 w-4" />,
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start space-x-3 p-4 rounded-lg border bg-white dark:bg-gray-950 shadow-lg max-w-sm",
              "animate-in slide-in-from-right-full duration-300",
              toast.type === "error" && "border-destructive/20 bg-destructive/5",
              toast.type === "success" && "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
              toast.type === "warning" && "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
            )}
            role="alert"
            aria-live="polite"
          >
            <div className="flex-shrink-0 mt-0.5">
              {icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {toast.title}
              </p>
              {toast.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {toast.description}
                </p>
              )}
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
