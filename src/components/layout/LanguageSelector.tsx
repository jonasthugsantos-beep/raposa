import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language } from '../../i18n/types';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'compact' | 'pill' | 'expanded';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = availableLanguages.find(l => l.code === language) || availableLanguages[0];

  if (variant === 'pill') {
    return (
      <div className={`flex items-center gap-1 p-1 rounded-full bg-[#24133A]/90 border border-[#D4AF37]/40 shadow-sm backdrop-blur-md ${className}`}>
        {availableLanguages.map((opt) => {
          const isSelected = opt.code === language;
          return (
            <button
              key={opt.code}
              onClick={() => setLanguage(opt.code)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold transition active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={opt.name}
            >
              <span>{opt.flag}</span>
              <span className="uppercase text-[10px]">{opt.shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#24133A]/90 hover:bg-[#2D1B48] border border-[#D4AF37]/50 text-white text-xs font-semibold shadow-sm transition active:scale-95 backdrop-blur-md"
        title={t('common', 'selectLanguage')}
      >
        <span className="text-sm">{currentOption.flag}</span>
        <span className="font-bold text-[11px] text-[#F9E79F]">{currentOption.shortLabel}</span>
        <ChevronDown className={`w-3 h-3 text-[#D4AF37] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-[#24133A] border-2 border-[#D4AF37]/60 shadow-2xl py-1.5 z-50 text-xs text-white animate-slide-down backdrop-blur-lg">
            <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] border-b border-white/10 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>{t('common', 'language')}</span>
            </div>
            {availableLanguages.map((opt) => {
              const isSelected = opt.code === language;
              return (
                <button
                  key={opt.code}
                  onClick={() => {
                    setLanguage(opt.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left font-medium transition ${
                    isSelected
                      ? 'bg-[#D4AF37]/20 text-[#F9E79F] font-bold'
                      : 'hover:bg-white/10 text-white/90'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{opt.flag}</span>
                    <span>{opt.name}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
