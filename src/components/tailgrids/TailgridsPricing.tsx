import React from 'react';
import { Check, Sparkles, Phone, MessageCircle, ArrowLeft } from 'lucide-react';
import { TailgridsBadge } from './TailgridsKit';

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaAction: () => void;
  ctaVariant?: 'primary' | 'outline' | 'gradient';
}

interface TailgridsPricingSectionProps {
  plans: PricingPlan[];
  title?: string;
  subtitle?: string;
}

export const TailgridsPricingSection: React.FC<TailgridsPricingSectionProps> = ({
  plans,
  title = 'باقات اشتراك تناسب كل مدرسة',
  subtitle = 'اختر الباقة المناسبة لمدرستك وابدأ فوراً. جميع الباقات تضمن بقاء بياناتك محلياً 100% دون أي خطر لفقدانها.'
}) => {
  return (
    <section id="pricing" className="py-12 sm:py-16 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex justify-center">
            <TailgridsBadge variant="purple" icon={<Sparkles className="w-3.5 h-3.5" />}>
              أسعار واضحة وباقات مرنة
            </TailgridsBadge>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.isPopular
                  ? 'bg-gradient-to-b from-blue-900 to-indigo-950 text-white shadow-2xl ring-2 ring-blue-500 hover:-translate-y-2'
                  : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 right-1/2 translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>الباقة الأكثر طلباً والأنسب للمدارس</span>
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider block ${
                      plan.isPopular ? 'text-blue-300' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {plan.tagline}
                  </span>
                  <h3 className="text-2xl font-black mt-1">{plan.name}</h3>
                  <p
                    className={`text-xs sm:text-sm mt-2 leading-relaxed ${
                      plan.isPopular ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight">
                      {plan.price}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        plan.isPopular ? 'text-blue-200' : 'text-slate-500'
                      }`}
                    >
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2">
                  <span
                    className={`text-xs font-black block ${
                      plan.isPopular ? 'text-blue-200' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    المميزات المضمنة:
                  </span>
                  <ul className="space-y-2.5 text-xs sm:text-sm">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 p-1 rounded-full shrink-0 ${
                            plan.isPopular
                              ? 'bg-blue-500/30 text-emerald-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span
                          className={
                            plan.isPopular ? 'text-blue-50' : 'text-slate-600 dark:text-slate-300'
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  type="button"
                  onClick={plan.ctaAction}
                  className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 active:scale-98 ${
                    plan.isPopular
                      ? 'bg-white hover:bg-blue-50 text-blue-950 shadow-white/10 hover:shadow-lg'
                      : plan.ctaVariant === 'outline'
                      ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div className="space-y-1">
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              🛡️ ضمان استمرار وأمان البيانات 100%
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              مهما كانت حالة الاشتراك، تظل قاعدة بيانات مدرستك وكشوفات الطلاب محفوظة بشكل دائم على حاسوبك ولا يمكن حذفها أبداً.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/218922465676?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A8%D8%A7%D9%82%D8%A7%D8%AA%20%D8%A7%D9%84%D9%85%D9%86%D8%B8%D9%88%D9%85%D8%A9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>استفسار واتساب</span>
            </a>
            <a
              href="tel:0922465676"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-700 hover:bg-slate-50 text-slate-800 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-600 shadow-sm transition active:scale-95"
            >
              <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>0922465676</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
