import React from 'react';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  trend,
  icon: Icon,
  color = 'blue',
  onClick
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-school-primary-light',
      border: 'border-blue-100',
    },
    green: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
    }
  };

  const scheme = colorMap[color];

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${onClick ? 'hover:ring-2 hover:ring-school-primary-light/20' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-school-text-main font-tajawal tracking-tight">
              {value}
            </span>
            {subValue && <span className="text-xs text-slate-400 font-medium">{subValue}</span>}
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <span className={`font-bold ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-slate-400 text-[11px]">مقارنة بالأمس</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${scheme.bg} ${scheme.border} border`}>
          <Icon className={`w-6 h-6 ${scheme.text}`} />
        </div>
      </div>
    </Card>
  );
};
