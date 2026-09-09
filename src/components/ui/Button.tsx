import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

/**
 * Button — زر موحد بأسلوب 21st.dev (مكيّف RTL + Cairo + Dark Mode)
 * - تدرج لوني + ظل متوهج بلون الزر (glow shadow)
 * - حركة Snappy + ضغط لمسي active:scale + حلقة تركيز للوصولية
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  loading = false,
  className,
  disabled,
  type = 'button',
  ...props
}) => {
  const baseStyles = twMerge(
    'relative inline-flex items-center justify-center gap-2 select-none whitespace-nowrap',
    'font-cairo font-extrabold rounded-2xl min-h-[44px]',
    'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
    'hover:-translate-y-px active:translate-y-0 active:scale-[0.97]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0'
  );

  const variantStyles = {
    primary: 'bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 focus-visible:ring-blue-500',
    secondary: 'bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 focus-visible:ring-blue-500',
    outline: 'border-2 border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-700 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:text-blue-400 shadow-sm hover:shadow-md focus-visible:ring-blue-500',
    danger: 'bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-700 text-white shadow-lg shadow-rose-600/30 hover:shadow-xl hover:shadow-rose-600/40 focus-visible:ring-rose-500',
    success: 'bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-700 text-white shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 focus-visible:ring-emerald-500',
    ghost: 'text-slate-500 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/40 min-h-0 focus-visible:ring-blue-500',
  };

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-xs min-h-[36px] rounded-xl',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={twMerge(baseStyles, variantStyles[variant], sizeStyles[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon && <span className="flex-shrink-0 inline-flex">{icon}</span>}
      {children}
    </button>
  );
};
