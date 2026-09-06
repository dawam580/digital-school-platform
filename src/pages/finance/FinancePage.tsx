import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Download,
  Filter,
  Users,
  Award,
  BookOpen,
  Building2,
  Sparkles,
  QrCode,
  Layers,
  X
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { FinancialTransaction, TuitionFeeRecord } from '../../types';

export const FinancePage: React.FC = () => {
  const {
    schoolProfile,
    financialTransactions,
    tuitionFees,
    addFinancialTransaction,
    updateTuitionPayment,
    students,
    classes
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState<'tuition' | 'transactions' | 'e-grading'>('tuition');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');

  // Quick Payment Modal State
  const [selectedFee, setSelectedFee] = useState<TuitionFeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'sadad' | 'bank_transfer'>('sadad');

  // New Transaction Modal State
  const [showNewTxModal, setShowNewTxModal] = useState(false);
  const [newTxType, setNewTxType] = useState<'income' | 'expense'>('income');
  const [newTxTitle, setNewTxTitle] = useState('');
  const [newTxCategory, setNewTxCategory] = useState<FinancialTransaction['category']>('tuition');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxMethod, setNewTxMethod] = useState<FinancialTransaction['paymentMethod']>('cash');
  const [newTxNotes, setNewTxNotes] = useState('');

  // Financial KPI Calculations
  const stats = useMemo(() => {
    const totalRevenue = financialTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpenses = financialTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalTuitionExpected = tuitionFees.reduce((acc, f) => acc + f.totalFee, 0);
    const totalTuitionCollected = tuitionFees.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalTuitionRemaining = tuitionFees.reduce((acc, f) => acc + f.remainingAmount, 0);

    const netBalance = totalRevenue - totalExpenses;
    const collectionRate = totalTuitionExpected > 0
      ? Math.round((totalTuitionCollected / totalTuitionExpected) * 100)
      : 0;

    return {
      totalRevenue,
      totalExpenses,
      netBalance,
      totalTuitionExpected,
      totalTuitionCollected,
      totalTuitionRemaining,
      collectionRate
    };
  }, [financialTransactions, tuitionFees]);

  // Filtered Tuition Fees
  const filteredFees = useMemo(() => {
    return tuitionFees.filter(fee => {
      const matchSearch =
        fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.guardianPhone.includes(searchTerm);

      const matchStatus = statusFilter === 'all' ? true : fee.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tuitionFees, searchTerm, statusFilter]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return financialTransactions.filter(tx => {
      return (
        tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.studentName && tx.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [financialTransactions, searchTerm]);

  // Submit Quick Tuition Payment
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    updateTuitionPayment(selectedFee.id, amountNum);

    // Also record transaction
    addFinancialTransaction({
      type: 'income',
      title: `سداد رسوم دراسية (${selectedFee.studentName})`,
      category: 'tuition',
      amount: amountNum,
      referenceNumber: `REC-${Date.now().toString().slice(-6)}`,
      paymentMethod,
      studentName: selectedFee.studentName,
      studentId: selectedFee.studentId,
      recordedBy: 'إدارة الشؤون المالية',
      notes: `دفعة مخصصة للفصل الدراسي - ${selectedFee.className}`,
      status: 'completed'
    });

    setSelectedFee(null);
    setPaymentAmount('');
  };

  // Submit New Custom Transaction
  const handleNewTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newTxAmount);
    if (!newTxTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    addFinancialTransaction({
      type: newTxType,
      title: newTxTitle.trim(),
      category: newTxCategory,
      amount: amountNum,
      referenceNumber: `${newTxType === 'income' ? 'REC' : 'EXP'}-${Date.now().toString().slice(-6)}`,
      paymentMethod: newTxMethod,
      recordedBy: schoolProfile.directorName || 'مدير المدرسة',
      notes: newTxNotes.trim(),
      status: 'completed'
    });

    setShowNewTxModal(false);
    setNewTxTitle('');
    setNewTxAmount('');
    setNewTxNotes('');
  };

  return (
    <div className="space-y-6 pb-12 font-cairo text-right animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800">
              💰 المنظومة المالية والمصروفات المعتمدة
            </span>
            <span className="text-xs text-slate-400 font-bold">
              • المعاملات بالدينار الليبي (د.ل)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            الشؤون المالية والرسوم المدرسية 🏫
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            إدارة ومتابعة رسوم الطلاب، سندات الصرف والقبض، ومطابقة براءة الذمة للامتحانات والتصحيح الإلكتروني.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => { setShowNewTxModal(true); sound.playTap(); }}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل سند جديد 🧾</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Collected */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              إجمالي الإيرادات والتحصيل
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {stats.totalRevenue.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-500">د.ل</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
              نسبة التحصيل: {stats.collectionRate}%
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              المصروفات التشغيلية
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {stats.totalExpenses.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-500">د.ل</span>
            </div>
            <span className="text-[11px] text-slate-400 font-bold block mt-0.5">
              صيانة، أحبار، ومكافآت
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Remaining Tuition */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              المتأخرات والرسوم المتبقية
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {stats.totalTuitionRemaining.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-500">د.ل</span>
            </div>
            <span className="text-[11px] text-amber-600 font-bold block mt-0.5">
              مطلوبة من أولياء الأمور
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Net Balance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              صافي الميزانية / الخزينة
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                {stats.netBalance.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-500">د.ل</span>
            </div>
            <span className="text-[11px] text-purple-600 font-bold block mt-0.5">
              رصيد الخزينة المتوفر
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setActiveSubTab('tuition'); sound.playTap(); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
              activeSubTab === 'tuition'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>سجل الرسوم الدراسية ({tuitionFees.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubTab('transactions'); sound.playTap(); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
              activeSubTab === 'transactions'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>سندات القبض والمصروفات ({financialTransactions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubTab('e-grading'); sound.playTap(); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
              activeSubTab === 'e-grading'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>التصحيح الإلكتروني وبراءة الذمة ✨</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم، الفصل، أو السند..."
            className="w-full px-4 py-2.5 pr-9 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* SUB-TAB 1: TUITION FEES */}
      {activeSubTab === 'tuition' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Status Filter Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-bold ml-1">تصفية الحالة:</span>
            {[
              { id: 'all', label: 'كافة الطلاب' },
              { id: 'paid', label: 'مسدد بالكامل ✅' },
              { id: 'partial', label: 'مسدد جزئياً ⏳' },
              { id: 'unpaid', label: 'غير مسدد ⚠️' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                  statusFilter === f.id
                    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Tuition Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">اسم الطالب</th>
                    <th className="py-3.5 px-4">الفصل الدراسي</th>
                    <th className="py-3.5 px-4">رقم ولي الأمر</th>
                    <th className="py-3.5 px-4">إجمالي الرسوم</th>
                    <th className="py-3.5 px-4">المسدد (د.ل)</th>
                    <th className="py-3.5 px-4">المتبقي (د.ل)</th>
                    <th className="py-3.5 px-4">الحالة</th>
                    <th className="py-3.5 px-4 text-center">إجراء السداد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredFees.map(fee => (
                    <tr key={fee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                        {fee.studentName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {fee.className} ({fee.gradeLevel})
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {fee.guardianPhone}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-slate-800 dark:text-slate-200">
                        {fee.totalFee.toLocaleString()} د.ل
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {fee.paidAmount.toLocaleString()} د.ل
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-amber-600 dark:text-amber-400">
                        {fee.remainingAmount.toLocaleString()} د.ل
                      </td>
                      <td className="py-3.5 px-4">
                        {fee.status === 'paid' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>خالص الرسوم</span>
                          </span>
                        )}
                        {fee.status === 'partial' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>مسدد جزئياً</span>
                          </span>
                        )}
                        {fee.status === 'unpaid' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 text-[11px] font-bold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>غير مسدد</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => { setSelectedFee(fee); sound.playTap(); }}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-black text-xs transition active:scale-95"
                        >
                          تحصيل دفعة 💳
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TRANSACTIONS & VOUCHERS */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">رقم السند</th>
                    <th className="py-3.5 px-4">البيان / الوصف</th>
                    <th className="py-3.5 px-4">النوع</th>
                    <th className="py-3.5 px-4">التاريخ</th>
                    <th className="py-3.5 px-4">المبلغ</th>
                    <th className="py-3.5 px-4">طريقة الدفع</th>
                    <th className="py-3.5 px-4">المسؤول</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                        {tx.referenceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {tx.title}
                        {tx.notes && <span className="block text-[10px] text-slate-400 font-normal">{tx.notes}</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {tx.type === 'income' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
                            سند قبض (إيراد) 📥
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-bold">
                            سند صرف (مصروف) 📤
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {tx.date}
                      </td>
                      <td className={`py-3.5 px-4 font-mono font-black ${
                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} د.ل
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-bold">
                        {tx.paymentMethod === 'sadad' && 'خدمة سداد ⚡'}
                        {tx.paymentMethod === 'cash' && 'نقداً بالخزينة 💵'}
                        {tx.paymentMethod === 'bank_transfer' && 'تحويل مصرفي 🏛️'}
                        {tx.paymentMethod === 'card' && 'بطاقة مصرفية 💳'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {tx.recordedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ELECTRONIC GRADING & FINANCIAL CLEARANCE */}
      {activeSubTab === 'e-grading' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white flex items-center justify-between gap-6 flex-wrap">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-black">
                <Sparkles className="w-3.5 h-3.5" />
                <span>الربط الآلي بين الكنترول والمالية والتصحيح</span>
              </div>
              <h3 className="text-xl font-black">
                منظومة التصحيح الإلكتروني وبراءة الذمة المدرسية 📝
              </h3>
              <p className="text-xs text-blue-200 leading-relaxed">
                تتيح المنظومة الربط الفوري بين كشوفات الرسوم الدراسية وحق دخول الامتحانات، مع دعم القراءة الآلية لنماذج الإجابة البابل شيت (OMR) وإصدار أرقام الجلوس الذكية بباركود QR.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-center space-y-2">
              <QrCode className="w-12 h-12 mx-auto text-amber-300" />
              <span className="text-xs font-bold block">نماذج تصحيح معتمدة</span>
              <button
                type="button"
                onClick={() => { sound.playSuccess(); triggerConfetti(); }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition active:scale-95"
              >
                توليد نماذج الإجابة (PDF) 📄
              </button>
            </div>
          </div>

          {/* Quick Integration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 w-fit">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                براءة الذمة التلقائية للامتحانات
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                منح بطاقة رقم الجلوس فور سداد القسط المدرسي المقرر، مع تنبيه ولي الأمر تلقائياً.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 w-fit">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                المسح الضوئي لأوراق البابل شيت
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تصحيح 100 ورقة اختبار في أقل من دقيقة باستخدام كاميرا الهاتف أو الماسح الضوئي المكتبي.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 w-fit">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                الرصد التلقائي في الكنترول
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ترحيل الدرجات مباشرة لمنظومة الكنترول المركزي وتصدير كشوفات الوزارة الرسمية.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QUICK PAYMENT MODAL */}
      {selectedFee && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                تحصيل دفعة رسوم دراسية 💳
              </h3>
              <button
                type="button"
                onClick={() => setSelectedFee(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs space-y-1">
              <div className="font-black text-purple-900 dark:text-purple-200">
                الطالب: {selectedFee.studentName}
              </div>
              <div className="text-purple-700 dark:text-purple-300">
                الفصل: {selectedFee.className} • المتبقي الحالي: <strong className="font-mono font-bold">{selectedFee.remainingAmount} د.ل</strong>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  المبلغ المدفوع (د.ل):
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedFee.remainingAmount}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder={`الحد الأقصى ${selectedFee.remainingAmount}`}
                  className="w-full px-4 py-3 text-sm font-mono rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  طريقة الدفع:
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="sadad">خدمة سداد الإلكترونية ⚡</option>
                  <option value="cash">نقداً بالخزينة 💵</option>
                  <option value="bank_transfer">تحويل مصرفي 🏛️</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition active:scale-95"
              >
                تأكيد التحصيل وإصدار سند القبض 🧾
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NEW CUSTOM TRANSACTION MODAL */}
      {showNewTxModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                تسجيل معاملة مالية جديدة 🧾
              </h3>
              <button
                type="button"
                onClick={() => setShowNewTxModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewTxSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewTxType('income')}
                  className={`py-2 rounded-xl text-xs font-black border transition ${
                    newTxType === 'income'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  سند قبض (إيراد) 📥
                </button>
                <button
                  type="button"
                  onClick={() => setNewTxType('expense')}
                  className={`py-2 rounded-xl text-xs font-black border transition ${
                    newTxType === 'expense'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  سند صرف (مصروف) 📤
                </button>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  البيان / العنوان:
                </label>
                <input
                  type="text"
                  required
                  value={newTxTitle}
                  onChange={e => setNewTxTitle(e.target.value)}
                  placeholder="مثال: شراء أحبار وأوراق طباعة للامتحانات"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    المبلغ (د.ل):
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newTxAmount}
                    onChange={e => setNewTxAmount(e.target.value)}
                    placeholder="500"
                    className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    طريقة الدفع:
                  </label>
                  <select
                    value={newTxMethod}
                    onChange={e => setNewTxMethod(e.target.value as any)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="cash">نقداً 💵</option>
                    <option value="sadad">سداد ⚡</option>
                    <option value="bank_transfer">تحويل مصرفي 🏛️</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  ملاحظات إضافية:
                </label>
                <input
                  type="text"
                  value={newTxNotes}
                  onChange={e => setNewTxNotes(e.target.value)}
                  placeholder="ملاحظات أو اسم المستلم / المورد"
                  className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition active:scale-95"
              >
                حفظ وترحيل السند المالي 💾
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
