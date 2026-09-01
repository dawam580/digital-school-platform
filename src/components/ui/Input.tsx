import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

  return (
    <div className="w-full space-y-1.5 text-right">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-school-text-main">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={twMerge(
            clsx(
              'w-full px-4 py-2.5 text-sm rounded-input border transition-all duration-150',
              'bg-white text-school-text-main placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-school-primary-light/20 focus:border-school-primary',
              icon ? 'pr-10' : 'pr-4',
              error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-school-border-light',
              className
            )
          )}
          {...props}
        />
        {icon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
