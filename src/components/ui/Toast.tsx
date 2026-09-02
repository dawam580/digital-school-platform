import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Sparkles, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'gold';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          bg: 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100',
          indicator: 'bg-emerald-500'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
          bg: 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100',
          indicator: 'bg-rose-500'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          bg: 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100',
          indicator: 'bg-amber-500'
        };
      case 'gold':
        return {
          icon: <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />,
          bg: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-950 dark:to-yellow-950 border-amber-400 text-amber-950 dark:text-amber-100',
          indicator: 'bg-amber-500'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-500" />,
          bg: 'bg-blue-50/95 dark:bg-blue-950/90 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100',
          indicator: 'bg-blue-500'
        };
    }
  };

  return (
    <div className="fixed top-20 left-4 sm:left-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none text-right">
      {toasts.map((toast) => {
        const style = getToastStyle(toast.type);

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all transform animate-in slide-in-from-top-4 fade-in duration-300 flex items-start gap-3 relative overflow-hidden ${style.bg}`}
          >
            <div className={`absolute top-0 right-0 bottom-0 w-1 ${style.indicator}`} />
            <div className="shrink-0 mt-0.5">{style.icon}</div>
            
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-black leading-tight tracking-tight">{toast.title}</h4>
              <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed line-clamp-2">{toast.message}</p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-xl opacity-60 hover:opacity-100 transition shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
