import React from 'react';
import { AppSettings, Story } from '../../types';
import { PWAInstallPrompt } from '../pwa/PWAInstallPrompt';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Sparkles, 
  Crown, 
  Headphones, 
  BookOpen, 
  ShieldCheck, 
  Heart, 
  Star, 
  ArrowRight, 
  Play,
  Mic
} from 'lucide-react';

interface LandingPageProps {
  settings: AppSettings;
  stories: Story[];
  onOpenCheckout: () => void;
  onOpenLogin: (role?: 'client' | 'admin') => void;
  onPreviewListen: (story: Story) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  settings,
  stories,
  onOpenCheckout,
  onOpenLogin,
  onPreviewListen,
}) => {
  const { t, language } = useLanguage();
  // Pega a história com áudio original gravado como destaque de amostra
  const officialStory = stories.find(s => s.audioUrl && s.audioUrl.trim().length > 5) || stories[0];

  const currencySymbol = language === 'en' ? 'US$' : language === 'es' ? 'US$' : 'R$';

  const testimonials = [
    {
      name: 'Camila & Princesa Manu (5 anos)',
      text: language === 'en' 
        ? 'Bedtime has completely transformed! The tales are so gentle and the harp soundtrack calms Manu in minutes. Worth every penny!'
        : language === 'es'
        ? '¡La hora de dormir se ha transformado! Los cuentos son tan tiernos y la música de arpa calma a Manu en minutos. ¡Vale cada centavo!'
        : 'O momento de dormir se transformou! Os contos são tão delicados e a trilha com harpa acalma a Manu em poucos minutos. Vale cada centavo!',
      avatar: '👑',
      stars: 5,
    },
    {
      name: 'Mariana (Mãe do Theo)',
      text: language === 'en'
        ? 'The app works smoothly on mobile just like an App Store app. My son adores the Little Fox Aurelia and the Musical Dragon!'
        : language === 'es'
        ? 'La app funciona fluidamente en el móvil como si la hubiéramos bajado de la tienda. ¡A mi hijo le encanta la Zorrita Aurelia!'
        : 'O aplicativo funciona perfeitamente no celular como se tivesse baixado da loja. Meu filho adora a Raposinha Aurelia e o Dragão Musical!',
      avatar: '🦊',
      stars: 5,
    },
    {
      name: 'Luciana',
      text: language === 'en'
        ? 'Claudia has such a warm, comforting storytelling voice and the stories teach noble values of kindness and courage. Highly recommended!'
        : language === 'es'
        ? 'Claudia tiene una voz sumamente acogedora y las historias enseñan bellos valores de amistad y bondad. ¡Recomendado con los ojos cerrados!'
        : 'A Claudia tem uma voz acolhedora e as histórias ensinam valores lindos de amizade e bondade. Recomendo de olhos fechados!',
      avatar: '🌹',
      stars: 5,
    },
  ];

  return (
    <div className="space-y-8 pb-12 text-[#FDF6E3]">
      {/* Top Banner Notice */}
      {settings.bannerNotice && (
        <div className="p-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37]/20 via-[#F8C8DC]/20 to-[#6B4C9A]/20 border border-[#D4AF37]/40 text-center text-xs font-semibold text-[#F9E79F] flex items-center justify-center gap-1.5 shadow-sm">
          <span>✨</span>
          <span>{settings.bannerNotice}</span>
        </div>
      )}

      {/* Top Bar com Áreas de Login do Cliente e do Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] flex items-center justify-center text-xl shadow-gold border border-white/30 shrink-0">
            🦊
          </div>
          <div>
            <h2 className="font-serif-royal text-sm font-bold text-[#FDF6E3] leading-none">
              {t('common', 'appName')}
            </h2>
            <span className="text-[10px] text-[#D4AF37]">{t('common', 'tagline')}</span>
          </div>
        </div>

        {/* Botões de Acesso: Cliente e Admin */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenLogin('client')}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border border-[#D4AF37]/60 bg-[#D4AF37]/15 text-[#F9E79F] font-bold text-xs hover:bg-[#D4AF37]/25 active:scale-95 transition flex items-center justify-center gap-1"
          >
            <span>🦊</span>
            <span>{t('auth', 'clientTab')}</span>
          </button>

          <button
            onClick={() => onOpenLogin('admin')}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border border-white/20 bg-white/5 text-white/90 font-bold text-xs hover:bg-white/15 active:scale-95 transition flex items-center justify-center gap-1"
          >
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t('auth', 'adminTab')}</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center relative py-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 backdrop-blur-md text-xs font-bold text-[#F9E79F] mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{t('landing', 'badge')}</span>
        </div>

        <h1 className="font-serif-royal text-3xl sm:text-4xl font-extrabold text-[#FDF6E3] leading-tight tracking-wide mb-3">
          {t('landing', 'heroTitle')}
        </h1>

        <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto leading-relaxed mb-6 font-medium">
          {t('landing', 'heroSubtitle')}
        </p>

        {/* Card do Preço Dinâmico (Vindo do Painel Admin!) */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#2F1C4A] via-[#24133A] to-[#170B26] border-2 border-[#D4AF37] shadow-2xl max-w-sm mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/15 rounded-full blur-2xl" />

          <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-[#1A1A1A] font-extrabold text-[10px] uppercase tracking-wider inline-block mb-2 shadow-sm">
            {settings.planName}
          </span>

          <div className="flex items-baseline justify-center gap-1 text-[#D4AF37] my-2">
            <span className="text-base font-bold">{currencySymbol}</span>
            <span className="text-4xl font-extrabold tracking-tight">
              {settings.monthlyPrice.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-xs text-white/70">/{language === 'en' ? 'month' : language === 'es' ? 'mes' : 'mês'}</span>
          </div>

          <p className="text-[11px] text-white/70 mb-5">
            {t('landing', 'cancelAnytime')}
          </p>

          <button
            onClick={onOpenCheckout}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F9E79F] to-[#AA7C11] text-[#1A1A1A] font-extrabold text-sm shadow-gold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 group"
          >
            <Crown className="w-4 h-4 fill-current" />
            <span>{t('landing', 'subscribeBtn')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('landing', 'infinitePaySeal')}</span>
          </div>
        </div>
      </div>

      {/* PWA Prompt na Landing */}
      <PWAInstallPrompt compact={false} />

      {/* Demonstração de Áudio e História com a Voz Original da Narradora */}
      {officialStory && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#2F1C4A] to-[#24133A] border-2 border-[#D4AF37] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
            <div className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-rose-400" />
              <span>{t('landing', 'officialStoryBadge')}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#1A1A1A] text-[9px] font-extrabold">
              Áudio Real
            </span>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={officialStory.coverUrl}
              alt={officialStory.title}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4AF37] shrink-0 shadow-md"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-serif-royal text-sm font-bold text-[#FDF6E3] truncate">
                {officialStory.title}
              </h3>
              <p className="text-xs text-white/70 line-clamp-2 mt-0.5">
                {officialStory.description}
              </p>
              <button
                onClick={() => onPreviewListen(officialStory)}
                className="mt-2.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Ouvir Voz Gravada da Narradora</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Benefícios Inclusos */}
      <div>
        <h3 className="font-serif-royal text-xl font-bold text-center text-[#FDF6E3] mb-4">
          {t('landing', 'perksTitle')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {settings.perksList.map((perk, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[#24133A] border border-white/10 flex items-start gap-3 shadow-md"
            >
              <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ✓
              </div>
              <span className="text-xs font-medium text-white/90 leading-relaxed">
                {perk}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Depoimentos Encantados */}
      <div>
        <h3 className="font-serif-royal text-xl font-bold text-center text-[#FDF6E3] mb-4">
          {language === 'en' ? 'What Families Are Saying' : language === 'es' ? 'Lo Que Dicen las Familias' : 'O Que as Famílias Estão Dizendo'}
        </h3>

        <div className="space-y-3">
          {testimonials.map((tItem, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#1F1133] border border-[#D4AF37]/20 shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{tItem.avatar}</span>
                  <span className="text-xs font-bold text-[#F9E79F]">{tItem.name}</span>
                </div>
                <div className="flex text-[#D4AF37]">
                  {Array.from({ length: tItem.stars }).map((_, s) => (
                    <Star key={s} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-white/80 italic leading-relaxed">
                "{tItem.text}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Final */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#4A2C6A] via-[#3B2056] to-[#251538] border-2 border-[#D4AF37] text-center shadow-2xl">
        <Crown className="w-10 h-10 text-[#D4AF37] mx-auto mb-2" />
        <h3 className="font-serif-royal text-xl font-bold text-[#FDF6E3] mb-1">
          {language === 'en' ? 'Spark Imagination Today' : language === 'es' ? 'Da Alas a la Imaginación Hoy Mismo' : 'Dê Asas à Imaginação Hoje Mesmo'}
        </h3>
        <p className="text-xs text-white/70 max-w-xs mx-auto mb-5">
          {currencySymbol} {settings.monthlyPrice.toFixed(2).replace('.', ',')} • {t('landing', 'cancelAnytime')}
        </p>

        <button
          onClick={onOpenCheckout}
          className="w-full max-w-xs mx-auto py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-extrabold text-sm shadow-gold hover:brightness-110 active:scale-95 transition"
        >
          {t('landing', 'subscribeBtn')}
        </button>

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-4 text-xs">
          <button
            onClick={() => onOpenLogin('client')}
            className="text-[#F9E79F] hover:underline font-semibold flex items-center gap-1"
          >
            <span>🦊 {t('auth', 'clientTab')}</span>
          </button>
          <span className="text-white/30">•</span>
          <button
            onClick={() => onOpenLogin('admin')}
            className="text-white/70 hover:text-white font-semibold flex items-center gap-1"
          >
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t('auth', 'adminTab')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
