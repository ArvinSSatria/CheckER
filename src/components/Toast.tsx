"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  type?: "success" | "error";
  duration?: number;
}

export function Toast({ message, visible, onHide, type = "success", duration = 2500 }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      // Small delay to trigger enter animation
      requestAnimationFrame(() => setShow(true));
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onHide, 300);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible, duration, onHide]);

  if (!visible) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <div
        className={`
          pointer-events-auto flex items-center gap-2.5 px-5 py-3 rounded-xl
          border shadow-lg backdrop-blur-xl
          transition-all duration-300 ease-out
          ${show ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"}
          ${isSuccess
            ? "bg-card border-border text-foreground"
            : "bg-destructive/10 border-destructive/30 text-destructive"
          }
        `}
      >
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isSuccess ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-destructive/15 text-destructive"}`}>
          {isSuccess ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <X className="w-3.5 h-3.5" strokeWidth={3} />}
        </div>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
