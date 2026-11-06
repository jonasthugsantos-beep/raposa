import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, SUPPORTED_LANGUAGES, LanguageOption } from './types';
import { translations } from './translations';

export type TranslationSection = keyof typeof translations['pt-BR'];
export type DictSchema = {
  [K in TranslationSection]: Record<string, string>;
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: TranslationSection, key: string, params?: Record<string, string | number>) => string;
  dict: DictSchema;
  availableLanguages: LanguageOption[];
}

const STORAGE_KEY = 'clube_raposinhas_lang';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && (saved === 'pt-BR' || saved === 'es' || saved === 'en')) {
        return saved;
      }
      const navLang = navigator.language?.toLowerCase() || '';
      if (navLang.startsWith('es')) return 'es';
      if (navLang.startsWith('en')) return 'en';
    }
    return 'pt-BR';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
      // Dispara evento para serviços que escutam idioma
      window.dispatchEvent(new CustomEvent('raposinhas_lang_change', { detail: { language: newLang } }));
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const dict = (translations[language] || translations['pt-BR']) as unknown as DictSchema;

  const t = (
    section: TranslationSection,
    key: string,
    params?: Record<string, string | number>
  ): string => {
    const sec = (dict[section] || translations['pt-BR'][section]) as Record<string, any>;
    let text = sec?.[key] ?? (translations['pt-BR'][section] as Record<string, any>)?.[key] ?? key;

    if (params && typeof text === 'string') {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      });
    }

    return typeof text === 'string' ? text : key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        dict,
        availableLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage deve ser utilizado dentro de um LanguageProvider');
  }
  return context;
};
