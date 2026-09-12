import React, { useState, useEffect } from 'react';
import { Bell, Plus, Calendar, Tag, ChevronLeft, Check, Trash2 } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export interface SchoolAnnouncement {
  id: string;
  title: string;
  date: string;
  category: 'urgent' | 'exams' | 'administrative' | 'general';
  content: string;
}

const DEFAULT_ANNOUNCEMENTS: SchoolAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'موعد انطلاق امتحانات الفترة الأولى لصفوف النقل',
    date: '2026-10-18',
    category: 'exams',
    content: 'تبدأ امتحانات الفترة الأولى لجميع صفوف التعليم الأساسي (من الصف 1 إلى 9) وفق الجدول المعتمد من مكتب الامتحانات.',
  },
  {
    id: 'ann-2',
    title: 'تأكيد إدخال ومطابقة الأرقام الوطنية وكشوفات القيد',
    date: '2026-09-22',
    category: 'administrative',
    content: 'يرجى من جميع المعلمين ومربيي الفصول التحقق من مطابقة كشوفات الـ 873 طالباً مع منظومة المركز الوطني للامتحانات.',
  },
  {
    id: 'ann-3',
    title: 'اجتماع مجلس الآباء والمعلمين الأول للفصل الدراسي',
    date: '2026-09-28',
    category: 'general',
    content: 'تدعو إدارة مدرسة الشهيد امحمد الباعور السادة أولياء الأمور الكرام لحضور اللقاء الدوري لمناقشة الخطط التربوية.',
  },
];

const STORAGE_KEY = 'madrasa_school_announcements_v1';

export const SchoolAnnouncementsWidget: React.FC = () => {
  const { showToast } = useSchool();
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_ANNOUNCEMENTS;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'urgent' | 'exams' | 'administrative' | 'general'>('general');
  const [newContent, setNewContent] = useState('');

  const saveAnnouncements = (list: SchoolAnnouncement[]) => {
    setAnnouncements(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // storage quota or private mode
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showToast('error', 'بيانات ناقصة', 'يرجى كتابة عنوان الإعلان وتفاصيله.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const item: SchoolAnnouncement = {
      id: `ann-${Date.now()}`,
      title: newTitle.trim(),
      date: today,
      category: newCategory,
      content: newContent.trim(),
    };
    const updated = [item, ...announcements];
    saveAnnouncements(updated);
    setNewTitle('');
    setNewContent('');
    setShowAddForm(false);
    showToast('success', 'تم النشر بنجاح 📢', 'تمت إضافة التعميم المدرسي وحفظه.');
  };

  const handleDelete = (id: string) => {
    const filtered = announcements.filter(a => a.id !== id);
    saveAnnouncements(filtered);
    showToast('info', 'تم الحذف', 'تمت إزالة الإعلان من اللوحة.');
  };

  const getCategoryBadge = (cat: SchoolAnnouncement['category']) => {
    switch (cat) {
      case 'urgent':
        return { text: 'عاجل ومهم', bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200' };
      case 'exams':
        return { text: 'كنترول وامتحانات', bg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200' };
      case 'administrative':
        return { text: 'تعميم إداري', bg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200' };
      case 'general':
      default:
        return { text: 'إعلان عام', bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200' };
    }
  };

  return (
    <div
      className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-inner">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              لوحة التعاميم والإعلانات
            </h3>
            <p className="text-xs text-slate-400 font-bold">القرارات الإدارية والتنبيهات المدرسية</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
        >
          <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>{showAddForm ? 'إلغاء' : 'إعلان جديد'}</span>
        </button>
      </div>

      {/* Add Announcement Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              عنوان الإعلان
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="مثال: موعد تسليم درجات أعمال السنة..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                التصنيف
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="general">إعلان عام</option>
                <option value="exams">امتحانات وكنترول</option>
                <option value="administrative">تعميم إداري</option>
                <option value="urgent">عاجل ومهم</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>حفظ ونشر</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              تفاصيل التعميم
            </label>
            <textarea
              rows={2}
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="اكتب نص الإعلان هنا..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
        </form>
      )}

      {/* Announcements List */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {announcements.map(item => {
          const badge = getCategoryBadge(item.category);
          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-100 dark:border-slate-800 transition-all group"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${badge.bg}`}>
                  {badge.text}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{item.date}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    title="حذف الإعلان"
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug mb-1">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
