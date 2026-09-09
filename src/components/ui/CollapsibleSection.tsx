import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * CollapsibleSection — قسم قابل للطي بحركة ناعمة (grid-rows trick = 60fps بلا قياس JS)
 * يحفظ حالته في localStorage، مثالي لتخفيف ازدحام اللوحات (إفصاح تدريجي).
 */
interface CollapsibleSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  subtitle,
  icon,
  defaultOpen = true,
  children,
  className,
}) => {
  const [open, setOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`madrasa_ui_collapsed_${id}`);
      if (saved !== null) return saved !== '1';
    } catch {}
    return defaultOpen;
  });

  const toggle = () => {
    setOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem(`madrasa_ui_collapsed_${id}`, next ? '0' : '1');
      } catch {}
      return next;
    });
  };

  return (
    <section className={twMerge('space-y-3', className)}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 group"
      >
        <span className="flex items-center gap-2 min-w-0">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="text-right">
            <span className="block text-sm font-black text-slate-800 dark:text-slate-100">{title}</span>
            {subtitle && <span className="block text-[11px] text-slate-400 font-bold">{subtitle}</span>}
          </span>
        </span>
        <span
          className={clsx(
            'shrink-0 w-7 h-7 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
            'flex items-center justify-center text-slate-500 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
            'group-hover:border-slate-300 dark:group-hover:border-slate-600',
            !open && '-rotate-90'
          )}
        >
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>
      <div
        className={clsx(
          'grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden min-h-0">
          {children}
        </div>
      </div>
    </section>
  );
};
