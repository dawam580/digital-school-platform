import React from 'react';

// ==========================================
// 1. Tailgrids Badge
// ==========================================
interface TailgridsBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'purple';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const TailgridsBadge: React.FC<TailgridsBadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = ''
}) => {
  const variantStyles = {
    primary: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    info: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3.5 py-1 text-xs sm:text-sm font-bold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

// ==========================================
// 2. Tailgrids Section Title
// ==========================================
interface TailgridsSectionTitleProps {
  badge?: string;
  badgeIcon?: React.ReactNode;
  title: string;
  subtitle?: string;
  align?: 'center' | 'right';
  className?: string;
}

export const TailgridsSectionTitle: React.FC<TailgridsSectionTitleProps> = ({
  badge,
  badgeIcon,
  title,
  subtitle,
  align = 'center',
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${align === 'center' ? 'text-center max-w-3xl mx-auto' : 'text-right'} ${className}`}>
      {badge && (
        <div className={align === 'center' ? 'flex justify-center' : 'flex justify-start'}>
          <TailgridsBadge variant="primary" icon={badgeIcon}>
            {badge}
          </TailgridsBadge>
        </div>
      )}
      <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
};

// ==========================================
// 3. Tailgrids Stat Card
// ==========================================
interface TailgridsStatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
}

export const TailgridsStatCard: React.FC<TailgridsStatCardProps> = ({
  icon,
  value,
  label,
  trend,
  trendUp = true,
  colorClass = 'from-blue-500 to-indigo-600'
}) => {
  return (
    <div className="relative group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="space-y-2 text-right">
          <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 block">
            {label}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {value}
          </div>
          {trend && (
            <div className={`inline-flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              <span>{trendUp ? '↑' : '↓'}</span>
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. Tailgrids Feature Card
// ==========================================
interface TailgridsFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  iconBgClass?: string;
  className?: string;
}

export const TailgridsFeatureCard: React.FC<TailgridsFeatureCardProps> = ({
  icon,
  title,
  description,
  badge,
  iconBgClass = 'bg-blue-600 text-white',
  className = ''
}) => {
  return (
    <div className={`group p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between text-right relative overflow-hidden ${className}`}>
      {/* Background Hover Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className={`w-13 h-13 p-3.5 rounded-2xl ${iconBgClass} shadow-md flex items-center justify-center group-hover:scale-105 transition-transform`}>
            {icon}
          </div>
          {badge && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {badge}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-normal">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. Tailgrids Accordion Item
// ==========================================
interface TailgridsAccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export const TailgridsAccordionItem: React.FC<TailgridsAccordionItemProps> = ({
  question,
  answer,
  isOpen,
  onToggle
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-200 shadow-sm text-right">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-right hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex-1">
          {question}
        </span>
        <div className={`p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-blue-50 text-blue-600' : ''}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 animate-fadeIn">
          {answer}
        </div>
      )}
    </div>
  );
};
