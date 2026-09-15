import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { Camera, X, RefreshCw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { sound } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

interface MobileQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export const MobileQrScannerModal: React.FC<MobileQrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMsg('');
    setScanStatus('idle');
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        animFrameRef.current = requestAnimationFrame(scanLoop);
      }
    } catch (err: any) {
      setIsScanning(false);
      setErrorMsg('تعذر فتح الكاميرا. يرجى منح الإذن أو إدخال الرمز يدوياً.');
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const scanLoop = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data && code.data.trim()) {
        const raw = code.data.trim();
        let finalCode = raw;
        try {
          if (raw.includes('code=')) {
            const parsed = new URL(raw);
            finalCode = parsed.searchParams.get('code') || raw;
          } else if (raw.startsWith('madrasa:')) {
            finalCode = raw.replace('madrasa:', '').trim();
          }
        } catch {}

        setScanStatus('success');
        sound.playSuccess();
        triggerConfetti();
        stopCamera();
        setTimeout(() => {
          onScanSuccess(finalCode);
          onClose();
        }, 500);
        return;
      }
    }
    animFrameRef.current = requestAnimationFrame(scanLoop);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-sm bg-slate-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl text-white">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">مسح باركود شاشة الكمبيوتر</h3>
              <p className="text-[10px] text-slate-400">وجه الكاميرا نحو كود الطالب في شاشة المدرسة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Body */}
        <div className="relative p-6 flex flex-col items-center justify-center min-h-[300px] bg-slate-950">
          <div className="relative w-64 h-64 rounded-2xl overflow-hidden border-2 border-dashed border-amber-400/70 shadow-inner flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-4 border border-amber-400/40 rounded-xl pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <span className="w-4 h-4 border-t-2 border-r-2 border-amber-400 rounded-tr" />
                <span className="w-4 h-4 border-t-2 border-l-2 border-amber-400 rounded-tl" />
              </div>
              <div className="flex justify-between">
                <span className="w-4 h-4 border-b-2 border-r-2 border-amber-400 rounded-br" />
                <span className="w-4 h-4 border-b-2 border-l-2 border-amber-400 rounded-bl" />
              </div>
            </div>

            {/* Scanning Laser Animation */}
            {isScanning && scanStatus === 'idle' && (
              <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b] animate-bounce pointer-events-none" />
            )}

            {scanStatus === 'success' && (
              <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 animate-in zoom-in-90">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                <span className="text-xs font-black text-emerald-300">تم التقاط الكود بنجاح!</span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-rose-900/40 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400 mt-4 text-center leading-relaxed">
            افتح شاشة المدرسة على الكمبيوتر، اضغط على زر <strong>(📱 كود ربط الهاتف)</strong>، وقرب كاميرا الهاتف لمسحه مباشرة.
          </p>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => { stopCamera(); startCamera(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة تشغيل الكاميرا</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
