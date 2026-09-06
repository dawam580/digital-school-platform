import React, { useState, useEffect } from 'react';
import { isWindowsDesktop } from '../../services/native/windowsBridge';
import { Minus, Square, Copy, X, Monitor, ShieldCheck, FolderOpen } from 'lucide-react';

export const WindowsTitleBar: React.FC = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const desktopStatus = isWindowsDesktop();
    setIsDesktop(desktopStatus);

    if (desktopStatus && window.electronAPI) {
      window.electronAPI.isMaximized().then(setIsMaximized).catch(() => {});
    }
  }, []);

  if (!isDesktop || !window.electronAPI) {
    return null;
  }

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = async () => {
    window.electronAPI?.maximizeWindow();
    const maximized = await window.electronAPI?.isMaximized();
    setIsMaximized(!!maximized);
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  const handleOpenDocs = () => {
    window.electronAPI?.openPath();
  };

  return (
    <div
      className="bg-[#071322] border-b border-white/10 text-white select-none text-xs flex items-center justify-between px-3 py-1.5 z-[99999] relative"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* Title & Brand */}
      <div className="flex items-center gap-2.5 font-tajawal font-medium text-slate-200">
        <div className="w-5 h-5 rounded-md bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
          <Monitor className="w-3.5 h-3.5" />
        </div>
        <span className="font-bold tracking-wide text-white">منظومة مدرسة الشهيد امحمد الباعور</span>
        <span className="text-slate-400 text-[11px] hidden sm:inline">| إصدار سطح المكتب المعتمد (Windows Native)</span>
        <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>محلي ومتصل</span>
        </div>
      </div>

      {/* Action Buttons & Window Controls */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          onClick={handleOpenDocs}
          title="فتح مجلد مستندات المدرسة في ويندوز"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-[11px] ml-2"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">مجلد المستندات</span>
        </button>

        {/* Minimize */}
        <button
          onClick={handleMinimize}
          title="تصغير"
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={handleMaximize}
          title={isMaximized ? 'استعادة' : 'تكبير'}
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          {isMaximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          title="إغلاق"
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
