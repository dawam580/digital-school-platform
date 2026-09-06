import React, { useState } from 'react';
import { Camera, Upload, Check, X, User } from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { getCleanAvatar } from '../../utils/avatarHelper';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSaveAvatar: (newAvatar: string) => void;
  title?: string;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSaveAvatar,
  title = 'تغيير الصورة الشخصية'
}) => {
  if (!isOpen) return null;

  const [selected, setSelected] = useState(currentAvatar);

  // Curated clean vector badges
  const presetAvatars = [
    getCleanAvatar('طالب', 'male'),
    getCleanAvatar('طالبة', 'female'),
    getCleanAvatar('معلم', 'teacher'),
    getCleanAvatar('إدارة', 'admin'),
    getCleanAvatar('أحمد', 'male'),
    getCleanAvatar('فاطمة', 'female'),
    getCleanAvatar('عمر', 'male'),
    getCleanAvatar('مريم', 'female'),
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelected(event.target.result as string);
          sound.playTap();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    sound.playSuccess();
    onSaveAvatar(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-right space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-400">اختر صورة رمزية جاهزة أو ارفع صورة جديدة</p>
        </div>

        {/* Current Preview */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={selected}
              alt="معاينة الصورة"
              className="w-24 h-24 rounded-3xl object-cover border-4 border-[#00288e]/20 shadow-md"
            />
            <label className="absolute -bottom-2 -right-2 p-2 bg-[#00288e] text-white rounded-full cursor-pointer hover:bg-[#002072] shadow-sm transition-transform active:scale-95">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Preset Avatars Grid */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700">الصور الرمزية المقترحة:</span>
          <div className="grid grid-cols-4 gap-3">
            {presetAvatars.map((av, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setSelected(av); sound.playTap(); }}
                className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all group ${
                  selected === av ? 'border-[#00288e] ring-4 ring-blue-100 scale-105' : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <img src={av} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                {selected === av && (
                  <div className="absolute inset-0 bg-[#00288e]/40 flex items-center justify-center text-white">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-[#00288e] hover:bg-[#002072] text-white font-bold text-xs rounded-2xl shadow-soft transition-all"
          >
            حفظ واعتماد الصورة
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-2xl transition-colors"
          >
            إلغاء
          </button>
        </div>

      </div>
    </div>
  );
};
