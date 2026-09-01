import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-input transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none gap-2 select-none';

  const variantStyles = {
    primary: 'bg-school-primary hover:bg-school-primary-hover text-white shadow-soft hover:shadow-soft-lg',
    secondary: 'bg-school-primary-container text-school-primary hover:bg-opacity-80 font-semibold',
    outline: 'border-2 border-school-border-light hover:border-school-primary text-school-text-main hover:text-school-primary bg-white',
    danger: 'bg-school-error-light hover:bg-school-error text-white shadow-soft',
    success: 'bg-school-secondary-light hover:bg-school-secondary text-white shadow-soft',
    ghost: 'text-school-text-muted hover:text-school-primary hover:bg-school-bg-soft',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base font-semibold',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
