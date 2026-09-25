'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 end-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
          info: <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />,
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto p-3 rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl flex items-start gap-2.5 transition-all text-zinc-100"
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold leading-tight text-zinc-100">{toast.title}</h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-zinc-400 hover:text-zinc-200 rounded shrink-0 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
