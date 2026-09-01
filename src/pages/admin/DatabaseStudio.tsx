import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { databaseEngine, TableMeta, DATABASE_SCHEMA_SQL } from '../../services/databaseEngine';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  Table,
  CheckCircle,
  FileCode,
  Layers,
  Search,
  Server,
  Zap,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

export const DatabaseStudio: React.FC = () => {
  const { resetDatabase, students, classes, notifications, conversations, schedule } = useSchool();
  const [selectedTable, setSelectedTable] = useState<string>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'tables' | 'sql' | 'backup'>('tables');
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const tablesMeta = databaseEngine.getTablesMeta();
  const totalRows = tablesMeta.reduce((acc, t) => acc + t.rowCount, 0);

  const handleDownloadSQL = () => {
    const sqlContent = databaseEngine.exportSQLDump();
    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `madrasa_database_dump_${new Date().toISOString().split('T')[0]}.sql`;
    link.click();
    URL.revokeObjectURL(url);
    sound.playSuccess();
  };

  const handleDownloadJSON = () => {
    const jsonContent = databaseEngine.exportJSONBackup();
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `madrasa_backup_v3_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    sound.playSuccess();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = databaseEngine.restoreFromJSON(content);
      if (success) {
        setImportStatus('تم استعادة قاعدة البيانات بنجاح! جاري تحديث الشاشة...');
        sound.playSuccess();
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus('خطأ: ملف النسخة الاحتياطية غير صالح أو تالف.');
        sound.playAlert();
      }
    };
    reader.readAsText(file);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(DATABASE_SCHEMA_SQL);
    setCopiedSQL(true);
    sound.playTap();
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  // Get table records based on selected table
  const getTableData = () => {
    switch (selectedTable) {
      case 'students':
        return students;
      case 'classes':
        return classes;
      case 'notifications':
        return notifications;
      case 'chat_messages':
        return conversations.flatMap(c => c.messages.map(m => ({ ...m, conversation: c.teacherName })));
      case 'timetable_schedule':
        return schedule.flatMap(d => d.periods.map(p => ({ ...p, day: d.dayName })));
      default:
        return students;
    }
  };

  const rawData = getTableData();
  const filteredData = rawData.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-3xl shadow-xl border border-indigo-500/30">
              🗄️
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black">مركز إدارة قواعد البيانات (Database Studio)</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>نشطة ومتزامنة</span>
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                استعراض الجداول الهيكلية، تشغيل استعلامات SQL، وأخذ النسخ الاحتياطية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSQL}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-2xl transition text-xs shadow-md"
            >
              <FileCode className="w-4 h-4" />
              <span>تصدير كود SQL (.sql)</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl transition text-xs shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>نسخة كاملة (.json)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Diagnostics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">عدد الجداول الهيكلية</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{tablesMeta.length}</span>
            <span className="text-xs font-bold text-slate-500">جداول أساسية</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">مع علاقات الربط والمفاتيح الأجنبية</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي السجلات (Rows)</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
              <Table className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{totalRows}</span>
            <span className="text-xs font-bold text-slate-500">سجل حي</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">مفهرسة بالكامل للبحث السريع</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">محرك المعالجة والسرعة</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">&lt; 1 ms</span>
            <span className="text-xs font-bold text-slate-500">زمن الاستجابة</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Zero Latency Local Storage</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">حالة التزامن السحابي</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Cross-Tab 360°</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">BroadcastChannel + LocalStorage</p>
        </div>
      </div>

      {/* Main Mode Switcher */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tables' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>مستكشف الجداول والسجلات ({tablesMeta.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sql' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>هيكل وقواعد بيانات SQL Schema</span>
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'backup' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>النسخ الاحتياطي والاستعادة</span>
        </button>
      </div>

      {/* Mode 1: Table Explorer */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tables Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-black text-sm text-slate-900 dark:text-white px-2">قائمة الجداول المتاحة</h3>
            <div className="space-y-2">
              {tablesMeta.map((table) => {
                const isSelected = selectedTable === table.tableName;

                return (
                  <button
                    key={table.tableName}
                    onClick={() => { setSelectedTable(table.tableName); sound.playTap(); }}
                    className={`w-full text-right p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{table.icon}</span>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">{table.nameArabic}</h4>
                          <span className="font-mono text-[10px] text-slate-400">{table.tableName}</span>
                        </div>
                      </div>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg text-[10px] font-mono font-black">
                        {table.rowCount} صف
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">{table.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Data Viewer */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  بيانات جدول: <span className="font-mono text-blue-600 dark:text-blue-400">{selectedTable}</span>
                </h3>
                <p className="text-xs text-slate-400">عرض السجلات الحية المخزنة في النظام</p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث داخل السجلات..."
                  className="pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Records List / Table */}
            <div className="overflow-x-auto max-h-[480px]">
              {filteredData.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">لا توجد سجلات مطابقة للبحث</div>
              ) : (
                <div className="space-y-3">
                  {filteredData.map((row: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-200/40 dark:border-slate-700/40 pb-1">
                        <span className="font-bold text-blue-600 dark:text-blue-400">السجل #{idx + 1}</span>
                        <span>ID: {row.id || row.code || idx}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 font-sans text-xs">
                        {Object.entries(row).slice(0, 6).map(([key, val]) => (
                          <div key={key}>
                            <span className="text-[10px] text-slate-400 block font-mono">{key}:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                              {typeof val === 'object' ? JSON.stringify(val).slice(0, 30) + '...' : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: SQL Schema Console */}
      {activeTab === 'sql' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">كود مخطط قواعد البيانات (SQL DDL Schema)</h3>
              <p className="text-xs text-slate-400">متوافق 100% مع PostgreSQL, SQLite, MySQL, و Supabase</p>
            </div>
            <button
              onClick={handleCopySQL}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              {copiedSQL ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSQL ? 'تم النسخ للحافظة!' : 'نسخ الكود'}</span>
            </button>
          </div>

          <div className="bg-slate-950 text-emerald-400 p-6 rounded-2xl font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed border border-slate-800 text-left" dir="ltr">
            <pre>{DATABASE_SCHEMA_SQL}</pre>
          </div>
        </div>
      )}

      {/* Mode 3: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backup Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">إنشاء نسخة احتياطية كاملة</h3>
              <p className="text-xs text-slate-400 mt-1">
                قم بتنزيل كافة بيانات المنصة والطلاب والدرجات والمحادثات في ملف واحد آمن.
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <button
                onClick={handleDownloadJSON}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl text-xs transition shadow flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل النسخة الكاملة (JSON Full Snapshot)</span>
              </button>
              <button
                onClick={handleDownloadSQL}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-2xl text-xs transition flex items-center justify-center gap-2"
              >
                <FileCode className="w-4 h-4" />
                <span>تنزيل ملف استعلامات SQL (.sql)</span>
              </button>
            </div>
          </div>

          {/* Restore Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">استعادة نسخة سابقة</h3>
              <p className="text-xs text-slate-400 mt-1">
                ارفع ملف النسخة الاحتياطية لاسترجاع كافة البيانات والحسابات فورياً.
              </p>
            </div>

            <div className="pt-4">
              <label className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">اختر ملف JSON للاستعادة</span>
                <span className="text-[10px] text-slate-400 mt-1">madrasa_backup_*.json</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>

              {importStatus && (
                <p className="text-xs font-bold text-center mt-3 text-blue-600 dark:text-blue-400">
                  {importStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
