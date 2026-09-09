import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * StatCard — بطاقة مؤشرات بأسلوب 21st.dev (مكيّفة RTL + Cairo + Dark Mode)
 * - توهج لوني علوي (gradient mesh glow) + أيقونة بتدرج وظل ملون
 * - حركة فيزيائية Snappy: cubic-bezier(0.16,1,0.3,1) على transform/opacity فقط
 * - وصولية: role=button + تفعيل بلوحة المفاتيح عند وجود onClick
 */
type Tone = 'blue' | 'purple' | 'amber' | 'emerald' | 'indigo' | 'rose';

interface StatCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  hint?: string;
  trend?: { value: string; positive: boolean };
  icon: LucideIcon;
  tone?: Tone;
  active?: boolean;
  onClick?: () => void;
}

const toneMap: Record<Tone, { glow: string; tile: string; value: string; hint: string; ring: string; bar: string }> = {
  blue: {
    glow: 'from-blue-500/25 via-blue-400/10 to-transparent',
    tile: 'from-blue-500 to-blue-700 text-white shadow-blue-600/40',
    value: 'text-slate-900 dark:text-white',
    hint: 'text-blue-600 dark:text-blue-400',
    ring: 'border-blue-500 shadow-blue-500/20',
    bar: 'from-blue-500 to-cyan-400',
  },
  purple: {
    glow: 'from-purple-500/25 via-purple-400/10 to-transparent',
    tile: 'from-purple-500 to-purple-700 text-white shadow-purple-600/40',
    value: 'text-purple-700 dark:text-purple-300',
    hint: 'text-purple-600 dark:text-purple-400',
    ring: 'border-purple-500 shadow-purple-500/20',
    bar: 'from-purple-500 to-fuchsia-400',
  },
  amber: {
    glow: 'from-amber-500/25 via-amber-400/10 to-transparent',
    tile: 'from-amber-400 to-amber-600 text-slate-950 shadow-amber-500/40',
    value: 'text-slate-900 dark:text-white',
    hint: 'text-amber-600 dark:text-amber-400',
    ring: 'border-amber-500 shadow-amber-500/20',
    bar: 'from-amber-400 to-orange-500',
  },
  emerald: {
    glow: 'from-emerald-500/25 via-emerald-400/10 to-transparent',
    tile: 'from-emerald-500 to-teal-700 text-white shadow-emerald-600/40',
    value: 'text-emerald-600 dark:text-emerald-400',
    hint: 'text-emerald-700 dark:text-emerald-300',
    ring: 'border-emerald-500 shadow-emerald-500/20',
    bar: 'from-emerald-500 to-teal-400',
  },
  indigo: {
    glow: 'from-indigo-500/25 via-indigo-400/10 to-transparent',
    tile: 'from-indigo-500 to-indigo-700 text-white shadow-indigo-600/40',
    value: 'text-indigo-700 dark:text-indigo-300',
    hint: 'text-indigo-600 dark:text-indigo-400',
    ring: 'border-indigo-500 shadow-indigo-500/20',
    bar: 'from-indigo-500 to-blue-400',
  },
  rose: {
    glow: 'from-rose-500/25 via-rose-400/10 to-transparent',
    tile: 'from-rose-500 to-rose-700 text-white shadow-rose-600/40',
    value: 'text-rose-600 dark:text-rose-400',
    hint: 'text-rose-600 dark:text-rose-400',
    ring: 'border-rose-500 shadow-rose-500/20',
    bar: 'from-rose-500 to-pink-400',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  suffix,
  hint,
  trend,
  icon: Icon,
  tone = 'blue',
  active = false,
  onClick,
}) => {
  const t = toneMap[tone];
  const clickable = typeof onClick === 'function';

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } } : undefined}
      className={twMerge(
        clsx(
          'group relative overflow-hidden p-5 rounded-3xl border-2 bg-white dark:bg-slate-900 shadow-sm',
          'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'hover:-translate-y-1 hover:shadow-xl',
          clickable && 'cursor-pointer active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          active ? `${t.ring} shadow-lg` : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        )
      )}
    >
      {/* توهج علوي ناعم */}
      <div aria-hidden className={twMerge('pointer-events-none absolute -top-16 -left-16 h-44 w-44 rounded-full bg-gradient-to-br blur-3xl opacity-70 transition-opacity duration-300 group-hover:opacity-100', t.glow)} />
      {/* شريط التمييز السفلي عند التفعيل */}
      {active && <div aria-hidden className={twMerge('absolute bottom-0 right-5 left-5 h-1 rounded-full bg-gradient-to-l', t.bar)} />}

      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block truncate">{title}</span>
          <span className="mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className={twMerge('text-3xl font-black tabular-nums tracking-tight font-cairo', t.value)}>{value}</span>
            {suffix && <span className="text-sm font-extrabold text-slate-500 dark:text-slate-400">{suffix}</span>}
          </span>
          {trend ? (
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold">
              <span className={clsx('inline-flex items-center gap-0.5 rounded-full px-2 py-0.5', trend.positive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300')}>
                {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend.value}
              </span>
              <span className="text-slate-400 text-[11px]">مقارنة بالأمس</span>
            </span>
          ) : hint ? (
            <span className={twMerge('mt-1 block text-xs font-bold transition-transform duration-300 group-hover:-translate-x-0.5', t.hint)}>{hint}</span>
          ) : null}
        </div>
        <div className={twMerge('shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3', t.tile)}>
          <Icon className="w-7 h-7" strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
};
