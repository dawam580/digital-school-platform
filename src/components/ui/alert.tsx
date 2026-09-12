import * as React from 'react';
import { cn } from '../../lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800',
      destructive: 'border-rose-500/30 text-rose-800 dark:text-rose-200 bg-rose-50/70 dark:bg-rose-950/40 [&>svg]:text-rose-600',
      success: 'border-emerald-500/30 text-emerald-800 dark:text-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/40 [&>svg]:text-emerald-600',
      warning: 'border-amber-500/30 text-amber-800 dark:text-amber-200 bg-amber-50/70 dark:bg-amber-950/40 [&>svg]:text-amber-600',
      info: 'border-blue-500/30 text-blue-800 dark:text-blue-200 bg-blue-50/70 dark:bg-blue-950/40 [&>svg]:text-blue-600',
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative w-full rounded-2xl border p-4 sm:p-5 text-right font-cairo shadow-sm [&>svg~*]:pr-8 [&>svg]:absolute [&>svg]:right-4 [&>svg]:top-4.5',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 text-sm sm:text-base font-black leading-tight tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-normal', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
