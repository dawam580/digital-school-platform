import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = true,
  padded = true,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-2xl border border-slate-100/80 shadow-card transition-all duration-200',
          hover && 'hover:shadow-soft hover:border-blue-100',
          padded && 'p-5 sm:p-6',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
