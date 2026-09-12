import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'right' | 'left';
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  children,
  side = 'right',
  className
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sideAnimation = side === 'right' ? 'animate-in slide-in-from-right' : 'animate-in slide-in-from-left';

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex font-cairo">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Sheet Content Drawer */}
      <div
        className={cn(
          'relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto text-right duration-300',
          side === 'right' ? 'mr-auto' : 'ml-auto',
          sideAnimation,
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
          <span className="sr-only">إغلاق</span>
        </button>

        {children}
      </div>
    </div>,
    document.body
  );
};

export const SheetHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex flex-col space-y-2 text-right border-b border-slate-100 dark:border-slate-800 pb-4 mb-4', className)}
    {...props}
  />
);

export const SheetTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3
    className={cn('text-lg font-black text-slate-900 dark:text-white tracking-tight', className)}
    {...props}
  />
);

export const SheetDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p
    className={cn('text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed', className)}
    {...props}
  />
);

export const SheetContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn('flex-1 overflow-y-auto py-2', className)} {...props} />
);

export const SheetFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-4', className)}
    {...props}
  />
);
