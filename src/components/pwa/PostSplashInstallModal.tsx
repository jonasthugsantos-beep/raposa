import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useLanguage } from '../../i18n/LanguageContext';
import { Download, Sparkles, X } from 'lucide-react';

interface PostSplashInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostSplashInstallModal: React.FC<PostSplashInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t } = useLanguage();
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen || isInstalled) return null;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowGuide(true);
      return;
    }
    const success = await install();
    if (success) {
      onClose();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#2F1C4A] via-[#221338] to-[#160B24] border-2 border-[#D4AF37] p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/25 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#F8C8DC] p-0.5 shadow-gold mb-3">
            <div className="w-full h-full rounded-2xl bg-[#1C0D2E] flex items-center justify-center text-3xl">
              🦊
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[11px] font-bold text-[#F9E79F] mb-1">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>{t('splash', 'badge')}</span>
          </div>
          <h3 className="font-serif-royal text-xl font-extrabold text-[#FDF6E3]">
            {t('pwa', 'modalTitle')}
          </h3>
          <p className="text-xs text-white/80 mt-1">
            {t('pwa', 'modalSubtitle')}
          </p>
        </div>

        {showGuide ? (
          <div className="space-y-3 text-xs text-white/90 mb-5 bg-[#1A0E2B] p-4 rounded-xl border border-[#D4AF37]/30">
            {isIOS ? (
              <>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#1A1A1A] font-bold flex items-center justify-center shrink-0">1</span>
                  <span>{t('pwa', 'iosStep1')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#1A1A1A] font-bold flex items-center justify-center shrink-0">2</span>
                  <span>{t('pwa', 'iosStep2')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#1A1A1A] font-bold flex items-center justify-center shrink-0">3</span>
                  <span>{t('pwa', 'iosStep3')}</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-[#FDF6E3] leading-relaxed">
                {t('pwa', 'androidStep1')} {t('pwa', 'androidStep2')} {t('pwa', 'androidStep3')}
              </p>
            )}
          </div>
        ) : null}

        <div className="space-y-2.5">
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F9E79F] to-[#AA7C11] text-[#1A1A1A] font-extrabold text-sm shadow-gold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{t('pwa', 'directInstallBtn')} ✨</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 font-semibold text-xs hover:bg-white/10 hover:text-white transition"
          >
            {t('pwa', 'skipBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
