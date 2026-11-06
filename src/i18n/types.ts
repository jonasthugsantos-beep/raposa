export type Language = 'pt-BR' | 'es' | 'en';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
  shortLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷', shortLabel: 'PT' },
  { code: 'es', name: 'Español', flag: '🇪🇸', shortLabel: 'ES' },
  { code: 'en', name: 'English', flag: '🇺🇸', shortLabel: 'EN' },
];
