"use client"

import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-bottom-5 bg-background",
            toast.variant === "destructive"
              ? "border-destructive/50 bg-destructive/10 text-destructive"
              : "border-border"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-1">
              {toast.title && (
                <p className="text-sm font-semibold">{toast.title}</p>
              )}
              {toast.description && (
                <p className="text-sm text-muted-foreground">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
