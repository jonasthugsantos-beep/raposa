import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSelector } from '../layout/LanguageSelector';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    // Sequência de animação mágica de abertura
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 1000);
    const t3 = setTimeout(() => setStage(3), 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-[#1C0D2E] via-[#2F1C4A] to-[#12081E] text-[#FDF6E3] p-8 safe-top safe-bottom overflow-hidden animate-fade-in select-none">
      {/* Background Animated Stars */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#D4AF37]/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#6B4C9A]/30 rounded-full blur-3xl" />
        
        {/* Twinkling Star Points */}
        {[
          { top: '15%', left: '20%', delay: '0s' },
          { top: '25%', right: '15%', delay: '0.4s' },
          { top: '45%', left: '10%', delay: '0.8s' },
          { top: '65%', right: '25%', delay: '0.2s' },
          { top: '80%', left: '30%', delay: '0.6s' },
        ].map((star, i) => (
          <span
            key={i}
            className="absolute text-[#FFE082] text-sm animate-ping"
            style={{ top: star.top, left: star.left, right: star.right, animationDelay: star.delay }}
          >
            ✦
          </span>
        ))}
      </div>

      {/* Top Bar with Language Selector */}
      <div className={`w-full flex items-center justify-between transition-all duration-700 transform ${stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 backdrop-blur-md text-xs font-semibold text-[#F9E79F]">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{t('splash', 'badge')}</span>
        </div>

        <LanguageSelector variant="compact" />
      </div>

      {/* Center Fox & Crown Mascot */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className={`relative transition-all duration-1000 transform ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          {/* Animated Glowing Ring */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F8C8DC] to-[#6B4C9A] p-1 shadow-gold animate-spin-slow">
            <div className="w-full h-full rounded-full bg-[#1C0D2E] flex items-center justify-center border-2 border-[#D4AF37]/50">
              <span className="text-6xl sm:text-7xl filter drop-shadow-[0_4px_12px_rgba(212,175,55,0.6)]">
                🦊
              </span>
            </div>
          </div>

          {/* Floating Royal Crown above Fox */}
          <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-4xl sm:text-5xl transition-all duration-700 transform ${
            stage >= 2 ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 -translate-y-6 -rotate-12'
          }`}>
            👑
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className={`mt-8 transition-all duration-700 delay-300 transform ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="font-serif-royal text-3xl sm:text-4xl font-extrabold text-[#FDF6E3] tracking-wide mb-2 leading-tight">
            {t('common', 'appName')}
          </h1>
          <p className="text-sm text-white/80 max-w-xs mx-auto font-medium">
            {t('splash', 'subtitle')}
          </p>
        </div>
      </div>

      {/* Bottom CTA to Enter */}
      <div className={`w-full max-w-xs transition-all duration-700 transform ${stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <button
          onClick={onComplete}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F9E79F] to-[#AA7C11] text-[#1A1A1A] font-extrabold text-base shadow-gold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 group"
        >
          <span>{t('splash', 'openBook')}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <span className="block text-center text-[11px] text-[#F9E79F]/80 mt-2.5">
          {t('splash', 'audioNotice')}
        </span>
      </div>
    </div>
  );
};

