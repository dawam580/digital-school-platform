import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, RefreshCw, Sparkles, Image as ImageIcon } from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto: (photoDataUrl: string) => void;
  personName: string;
  currentPhoto?: string;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  isOpen,
  onClose,
  onSavePhoto,
  personName,
  currentPhoto
}) => {
  const [mode, setMode] = useState<'camera' | 'file'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && mode === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode, capturedImage]);

  const startCamera = async () => {
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      setCameraActive(false);
      setErrorMessage('تعذر تشغيل الكاميرا. يمكنك رفع صورة مباشرة من جهازك.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
        sound.playTap();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCapturedImage(result);
      sound.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onSavePhoto(capturedImage);
      sound.playSuccess();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md font-cairo text-right animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                صورة: {personName}
              </h3>
              <p className="text-xs text-slate-400">التقاط بالكاميرا أو اختيار ملف</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        {!capturedImage && (
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('camera'); sound.playTap(); }}
              className={`flex-1 py-2 rounded-xl transition ${
                mode === 'camera' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-black' : 'text-slate-500'
              }`}
            >
              📷 التقاط بالكاميرا
            </button>
            <button
              type="button"
              onClick={() => { setMode('file'); sound.playTap(); }}
              className={`flex-1 py-2 rounded-xl transition ${
                mode === 'file' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-black' : 'text-slate-500'
              }`}
            >
              📁 رفع ملف صورة
            </button>
          </div>
        )}

        {/* Viewfinder or Preview */}
        <div className="flex flex-col items-center justify-center">
          {capturedImage ? (
            <div className="space-y-3 text-center">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl mx-auto">
                <img src={capturedImage} alt="اللقطة الملتقطة" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => { setCapturedImage(null); if (mode === 'camera') startCamera(); }}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة الالتقاط</span>
              </button>
            </div>
          ) : mode === 'camera' ? (
            <div className="space-y-4 w-full">
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl mx-auto bg-slate-950 flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {cameraActive && (
                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>التقاط الصورة الآن 📸</span>
                </button>
              )}

              {errorMessage && (
                <p className="text-xs text-rose-500 text-center font-bold">{errorMessage}</p>
              )}
            </div>
          ) : (
            <div className="w-full space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 p-8 rounded-3xl text-center cursor-pointer bg-slate-50 dark:bg-slate-800/50 transition"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <strong className="block text-xs text-slate-700 dark:text-slate-300 font-black">
                  اضغط لاختيار صورة من جهازك
                </strong>
                <span className="text-[11px] text-slate-400">JPG, PNG, WEBP</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-500 text-xs font-bold"
          >
            إلغاء
          </button>

          <button
            type="button"
            disabled={!capturedImage}
            onClick={handleConfirm}
            className={`px-6 py-2.5 rounded-2xl font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 ${
              capturedImage
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>حفظ واعتماد الصورة</span>
          </button>
        </div>

      </div>
    </div>
  );
};
