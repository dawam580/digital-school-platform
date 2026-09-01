import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { NotificationItem } from '../../types';
import {
  AlertTriangle,
  Clock,
  LogOut,
  FileText,
  CheckCheck,
  Bell,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Shield,
  Filter,
  Check
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab
  } = useSchool();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'attendance' | 'academic'>('all');

  const handleItemClick = (item: NotificationItem) => {
    sound.playTap();
    markNotificationAsRead(item.id);

    if (item.category === 'academic' || item.title.includes('تقرير') || item.title.includes('واجب')) {
      setActiveTab('daily-report');
    } else if (item.title.includes('تقييم') || item.title.includes('عذر') || item.studentName) {
      setActiveTab('student-profile');
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
  };

  const filteredNotifications = notifications.filter(item => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'attendance') return item.category === 'attendance' || item.category === 'urgent';
    if (activeFilter === 'academic') return item.category === 'academic';
    return true;
  });

  const getItemMeta = (item: NotificationItem) => {
    const title = item.title;
    const cat = item.category;

    if (cat === 'urgent' || title.includes('غياب') || title.includes('تحذير')) {
      return {
        label: 'تنبيه غياب',
        icon: AlertTriangle,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-100',
        badgeBg: 'bg-red-100 text-red-700'
      };
    }
    if (title.includes('تأخر')) {
      return {
        label: 'تأخر صباحي',
        icon: Clock,
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-100',
        badgeBg: 'bg-amber-100 text-amber-800'
      };
    }
    if (title.includes('خروج') || title.includes('انصراف')) {
      return {
        label: 'خروج معتمد',
        icon: LogOut,
        iconColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-100',
        badgeBg: 'bg-emerald-100 text-emerald-800'
      };
    }
    if (title.includes('حضور') || title.includes('تحضير')) {
      return {
        label: 'حضور مدرسي',
        icon: CheckCircle2,
        iconColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-100',
        badgeBg: 'bg-emerald-100 text-emerald-800'
      };
    }
    if (title.includes('تقييم') || title.includes('نقطة')) {
      return {
        label: 'تقييم وسلوك',
        icon: Sparkles,
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-100',
        badgeBg: 'bg-amber-100 text-amber-800'
      };
    }
    if (cat === 'academic' || title.includes('تقرير') || title.includes('واجب')) {
      return {
        label: 'تقرير يومي',
        icon: FileText,
        iconColor: 'text-[#00288e]',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-100',
        badgeBg: 'bg-blue-100 text-[#00288e]'
      };
    }
    return {
      label: 'إشعار مدرسي',
      icon: Bell,
      iconColor: 'text-[#00288e]',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-100',
      badgeBg: 'bg-slate-100 text-slate-700'
    };
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in max-w-3xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              مركز الإشعارات
            </h1>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-[#00288e] text-xs font-black px-2.5 py-0.5 rounded-full">
                {unreadCount} غير مقروء
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            تنبيهات الحضور، التأخر، الخروج، والتقارير المدرسية اليومية المباشرة
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-[#00288e] hover:bg-blue-50 px-3.5 py-2 rounded-2xl transition-colors flex items-center gap-1.5 self-start sm:self-auto border border-blue-100 shadow-sm active:scale-95"
          >
            <CheckCheck className="w-4 h-4" />
            <span>تحديد الكل كمقروء</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-slate-100 shadow-card overflow-x-auto">
        <button
          onClick={() => { setActiveFilter('all'); sound.playTap(); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'all'
              ? 'bg-[#00288e] text-white shadow-soft'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          الكل ({notifications.length})
        </button>
        <button
          onClick={() => { setActiveFilter('unread'); sound.playTap(); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'unread'
              ? 'bg-[#00288e] text-white shadow-soft'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          غير المقروء ({unreadCount})
        </button>
        <button
          onClick={() => { setActiveFilter('attendance'); sound.playTap(); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'attendance'
              ? 'bg-[#00288e] text-white shadow-soft'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          الحضور والغياب
        </button>
        <button
          onClick={() => { setActiveFilter('academic'); sound.playTap(); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'academic'
              ? 'bg-[#00288e] text-white shadow-soft'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          التقارير والأكاديمي
        </button>
      </div>

      {/* Vertical List of Notification Cards */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-card space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">لا توجد إشعارات في هذا التصنيف</h3>
            <p className="text-xs text-slate-400">ستظهر كافة التنبيهات والتحديثات المدرسية هنا فور صدورها.</p>
          </div>
        ) : (
          filteredNotifications.map(item => {
            const meta = getItemMeta(item);
            const Icon = meta.icon;

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                  !item.read
                    ? 'bg-[#f0f4ff]/90 border-blue-200/80 shadow-soft hover:bg-blue-50'
                    : 'bg-white border-slate-100 shadow-card hover:bg-slate-50/80'
                }`}
              >
                {/* Right: Icon + Content */}
                <div className="flex items-start gap-4 flex-1">
                  
                  {/* Type Icon */}
                  <div className={`p-3 rounded-2xl ${meta.bgColor} ${meta.borderColor} border shrink-0 mt-0.5 transition-transform group-hover:scale-105`}>
                    <Icon className={`w-5 h-5 ${meta.iconColor}`} />
                  </div>

                  {/* Text & Relative Time */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm ${!item.read ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                        {item.title}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badgeBg}`}>
                        {meta.label}
                      </span>
                      {item.studentName && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                          {item.studentName}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                      {item.message}
                    </p>

                    <span className="text-[11px] font-semibold text-slate-400 block pt-1 font-tajawal">
                      ⏱️ {item.date} {item.time ? `• ${item.time}` : ''}
                    </span>
                  </div>

                </div>

                {/* Left: Blue Dot Indicator for Unread */}
                <div className="flex flex-col items-center justify-between self-stretch shrink-0">
                  {!item.read ? (
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-[#00288e] ring-4 ring-blue-100 animate-pulse mt-1"
                      title="غير مقروء"
                    />
                  ) : (
                    <span className="w-2.5 h-2.5" />
                  )}
                  <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-[#00288e] transition-colors" />
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
