import * as React from 'react';
import { cn } from '../../lib/utils';
import { AttendanceStatus } from '../../types';
import { CheckCircle2, Clock, AlertCircle, AlertTriangle } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: AttendanceStatus;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'purple' | 'neutral' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', status, icon, children, ...props }, ref) => {
    const sizeStyles = {
      sm: 'px-2.5 py-0.5 text-[10px]',
      md: 'px-3 py-1 text-xs',
      lg: 'px-3.5 py-1.5 text-sm font-bold'
    };

    if (status) {
      switch (status) {
        case 'present':
          return (
            <div
              ref={ref}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold select-none',
                sizeStyles[size],
                className
              )}
              {...props}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>حاضر</span>
            </div>
          );
        case 'late':
          return (
            <div
              ref={ref}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold select-none',
                sizeStyles[size],
                className
              )}
              {...props}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>متأخر</span>
            </div>
          );
        case 'excused':
          return (
            <div
              ref={ref}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold select-none',
                sizeStyles[size],
                className
              )}
              {...props}
            >
              <AlertCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>غائب بعذر</span>
            </div>
          );
        case 'unexcused':
          return (
            <div
              ref={ref}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold select-none',
                sizeStyles[size],
                className
              )}
              {...props}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>غائب بدون عذر</span>
            </div>
          );
      }
    }

    const variantStyles = {
      default: 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 shadow hover:bg-slate-800',
      secondary: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
      destructive: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800',
      danger: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800',
      outline: 'text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 bg-transparent',
      success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
      warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
      info: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
      purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
      neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-bold transition-colors select-none font-cairo',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </div>
    );
  }
);
Badge.displayName = 'Badge';
