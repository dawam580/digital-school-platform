import React from 'react';
import { AttendanceStatus } from '../../types';
import { CheckCircle2, Clock, AlertCircle, AlertTriangle } from 'lucide-react';

interface BadgeProps {
  status?: AttendanceStatus;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant,
  children,
  size = 'md'
}) => {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  if (status) {
    switch (status) {
      case 'present':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeStyles}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>حاضر</span>
          </span>
        );
      case 'late':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeStyles}`}>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>متأخر</span>
          </span>
        );
      case 'excused':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 ${sizeStyles}`}>
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>غائب بعذر</span>
          </span>
        );
      case 'unexcused':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 ${sizeStyles}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>غائب بدون عذر</span>
          </span>
        );
    }
  }

  const customVariantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${customVariantStyles[variant || 'neutral']} ${sizeStyles}`}>
      {children}
    </span>
  );
};
