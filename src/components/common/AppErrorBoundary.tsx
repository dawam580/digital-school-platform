import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

/**
 * AppErrorBoundary — درع الصفحة البيضاء.
 * أي عطل render (فشل chunk كسول، مكتبة، بيانات تالفة) يتحول لشاشة عربية
 * قابلة للاسترداد بدل موت التطبيق الأبيض. يُغلَّف به الجذر وكل منطقة كسولة.
 */
interface State {
  hasError: boolean;
  message: string;
}

export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode; title?: string },
  State
> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: unknown): State {
    return {
      hasError: true,
      message: err instanceof Error ? err.message : String(err),
    };
  }

  componentDidCatch(err: unknown) {
    try {
      // eslint-disable-next-line no-console
      console.error('[AppErrorBoundary]', err);
    } catch {}
  }

  private hardReload = () => {
    const w = window as unknown as { location: Location; caches?: CacheStorage };
    const reload = () => w.location.reload();
    try {
      if (w.caches && typeof w.caches.keys === 'function') {
        w.caches.keys().then(keys => Promise.all(keys.map(k => w.caches!.delete(k)))).then(reload, reload);
      } else {
        reload();
      }
    } catch {
      reload();
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-cairo bg-slate-50" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          {this.props.title || 'تعثر تحميل هذه الشاشة مؤقتاً'}
        </h2>
        <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
          لا تقلق — بياناتك محفوظة ولم يُفقد شيء. غالباً نسخة قديمة مخزنة في المتصفح.
          اضغط الزر أدناه لمسح الكاش وإعادة التحميل.
        </p>
        <button
          onClick={this.hardReload}
          className="mt-5 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black shadow-md transition active:scale-95 flex items-center gap-2"
        >
          <RotateCw className="w-4 h-4" />
          <span>مسح الكاش وإعادة التحميل</span>
        </button>
        {this.state.message && (
          <p className="mt-4 text-[10px] font-mono text-slate-400 max-w-md break-words" dir="ltr">
            {this.state.message.slice(0, 220)}
          </p>
        )}
      </div>
    );
  }
}
