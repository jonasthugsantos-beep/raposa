import React from 'react';
import { Story, User, StoryCategory, AppSettings } from '../../types';
import { INITIAL_CATEGORIES } from '../../data/initialData';
import { PWAInstallPrompt } from '../pwa/PWAInstallPrompt';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Sparkles, 
  Headphones, 
  BookOpen, 
  Heart, 
  Crown, 
  Clock, 
  ArrowRight, 
  MessageCircle, 
  Flame,
  Mic
} from 'lucide-react';

interface SubscriberHomeProps {
  currentUser: User;
  stories: Story[];
  settings: AppSettings;
  favoriteIds: string[];
  onOpenStoryText: (story: Story) => void;
  onListenStory: (story: Story) => void;
  onToggleFavorite: (storyId: string) => void;
  onSelectCategory: (category: StoryCategory) => void;
  onOpenChat: () => void;
  onOpenLibrary: () => void;
}

export const SubscriberHome: React.FC<SubscriberHomeProps> = ({
  currentUser,
  stories,
  settings,
  favoriteIds,
  onOpenStoryText,
  onListenStory,
  onToggleFavorite,
  onSelectCategory,
  onOpenChat,
  onOpenLibrary,
}) => {
  const { t, language } = useLanguage();
  const featuredStory = stories.find(s => s.isFeatured) || stories[0];
  const bedtimeStories = stories.filter(s => s.category === 'historias-para-dormir');
  const recentStories = stories.slice(0, 6);

  const hasOriginalAudio = Boolean(featuredStory?.audioUrl && featuredStory.audioUrl.trim().length > 5);

  return (
    <div className="space-y-6 pb-6 text-[#FDF6E3]">
      {/* Top Banner Notice */}
      {settings.bannerNotice && (
        <div className="p-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37]/20 via-[#F8C8DC]/20 to-[#6B4C9A]/20 border border-[#D4AF37]/40 text-center text-xs font-semibold text-[#F9E79F] flex items-center justify-center gap-1.5 shadow-sm">
          <span>✨</span>
          <span>{settings.bannerNotice}</span>
        </div>
      )}

      {/* Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {language === 'en' ? 'Enchanted Realm' : language === 'es' ? 'Reino Encantado' : 'Reino Encantado'}
          </span>
          <h1 className="font-serif-royal text-xl sm:text-2xl font-extrabold text-[#FDF6E3] mt-0.5">
            {language === 'en' ? `Hello, ${currentUser.name || 'Little Fox'}! 🦊` : language === 'es' ? `¡Hola, ${currentUser.name || 'Zorrita'}! 🦊` : `Olá, ${currentUser.name || 'Pequena Raposinha'}! 🦊`}
          </h1>
        </div>

        {/* Status de Assinante Ativo */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
          <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{language === 'en' ? 'Member' : language === 'es' ? 'Miembro' : 'Clube Ativo'}</span>
        </div>
      </div>

      {/* PWA Install Banner */}
      <PWAInstallPrompt compact={false} />

      {/* Destaque Real da Semana */}
      {featuredStory && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#D4AF37] shadow-xl group">
          <div className="relative h-64 sm:h-72 w-full">
            <img
              src={featuredStory.coverUrl}
              alt={featuredStory.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C0D2E] via-[#1C0D2E]/50 to-transparent" />
            
            {/* Seal Tag */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#D4AF37] text-[#1A1A1A] font-bold text-xs flex items-center gap-1 shadow-md">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{hasOriginalAudio ? '🎙️ Voz Oficial da Narradora' : 'Conto em Destaque'}</span>
            </div>

            {/* Favorite Button */}
            <button
              onClick={() => onToggleFavorite(featuredStory.id)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:text-rose-400 active:scale-90 transition"
            >
              <Heart
                className={`w-4 h-4 ${
                  favoriteIds.includes(featuredStory.id) ? 'fill-rose-500 text-rose-500' : 'text-white'
                }`}
              />
            </button>

            {/* Bottom Info on Hero Image */}
            <div className="absolute bottom-4 left-4 right-4 text-left">
              <div className="flex items-center gap-2 text-xs text-[#F9E79F] font-semibold mb-1">
                <span>{featuredStory.category.replace(/-/g, ' ')}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {featuredStory.readingTimeMinutes} {t('common', 'minutes')}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Headphones className="w-3 h-3" />
                  {Math.round(featuredStory.audioDurationSec / 60)} {t('common', 'minutes')}
                </span>
              </div>

              <h2 className="font-serif-royal text-lg sm:text-xl font-bold text-[#FDF6E3] leading-snug drop-shadow-md">
                {featuredStory.title}
              </h2>
              <p className="text-xs text-white/80 line-clamp-2 mt-1">
                {featuredStory.description}
              </p>

              {/* Action Buttons: Ouvir e Ler */}
              <div className="flex items-center gap-2.5 mt-3">
                <button
                  onClick={() => onListenStory(featuredStory)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-gold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  {hasOriginalAudio ? <Mic className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                  <span>{hasOriginalAudio ? 'Ouvir Voz Oficial' : t('common', 'listenAudio')}</span>
                </button>

                <button
                  onClick={() => onOpenStoryText(featuredStory)}
                  className="flex-1 py-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/30 font-bold text-xs hover:bg-white/30 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t('common', 'readText')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categorias Mágicas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif-royal text-base font-bold text-[#FDF6E3] flex items-center gap-2">
            <span>🏰</span>
            <span>{language === 'en' ? 'Explore Realms & Themes' : language === 'es' ? 'Explorar por Reinos & Temas' : 'Explorar por Reinos & Temas'}</span>
          </h3>
          <button
            onClick={onOpenLibrary}
            className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            <span>{language === 'en' ? 'View Library' : language === 'es' ? 'Ver Biblioteca' : 'Ver Biblioteca'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="px-4 py-3 rounded-2xl bg-[#24133A] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-left shrink-0 transition active:scale-95 shadow-md flex items-center gap-3 min-w-[170px]"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <h4 className="font-serif-royal text-xs font-bold text-[#FDF6E3]">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-white/50">{language === 'en' ? 'Tap to view' : language === 'es' ? 'Toca para ver' : 'Toque para ver'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Histórias para o Soninho */}
      {bedtimeStories.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#201035] via-[#2D1B48] to-[#1B0B2E] border border-[#D4AF37]/30 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌙</span>
              <div>
                <h3 className="font-serif-royal text-sm font-bold text-[#FDF6E3]">
                  {language === 'en' ? 'Bedtime Calm Tales' : language === 'es' ? 'Cuentos para Dormir' : 'Para a Hora de Dormir'}
                </h3>
                <p className="text-[10px] text-white/60">
                  {language === 'en' ? 'Gentle narration and sleep timer' : language === 'es' ? 'Audios suaves con temporizador' : 'Áudios calmos com timer de sono para uma noite tranquila'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {bedtimeStories.map((story) => (
              <div
                key={story.id}
                onClick={() => onListenStory(story)}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#180A28] border border-white/5 hover:border-[#D4AF37]/50 cursor-pointer active:scale-95 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={story.coverUrl}
                    alt={story.title}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-serif-royal text-xs font-bold text-[#FDF6E3] truncate">
                      {story.title}
                    </h4>
                    <p className="text-[10px] text-[#D4AF37] flex items-center gap-1 mt-0.5">
                      <Headphones className="w-3 h-3" />
                      <span>{Math.round(story.audioDurationSec / 60)} {t('common', 'minAudio')}</span>
                    </p>
                  </div>
                </div>

                <button
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] text-[#1A1A1A] flex items-center justify-center font-bold text-xs shrink-0 shadow-md"
                >
                  ▶
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recém-Chegadas no Reino */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif-royal text-base font-bold text-[#FDF6E3] flex items-center gap-2">
            <span>📖</span>
            <span>{language === 'en' ? 'Recently Added Tales' : language === 'es' ? 'Cuentos Añadidos Recientemente' : 'Contos Adicionados Recentemente'}</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {recentStories.map((story) => {
            const isRecorded = Boolean(story.audioUrl && story.audioUrl.trim().length > 5);

            return (
              <div
                key={story.id}
                className="rounded-2xl bg-[#24133A] border border-[#D4AF37]/30 overflow-hidden shadow-md flex flex-col justify-between"
              >
                <div className="relative h-28 w-full">
                  <img
                    src={story.coverUrl}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                  {isRecorded && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#1A1A1A] font-extrabold text-[8px] uppercase tracking-wider shadow">
                      🎙️ Voz Oficial
                    </span>
                  )}
                  <button
                    onClick={() => onToggleFavorite(story.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:text-rose-400"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        favoriteIds.includes(story.id) ? 'fill-rose-500 text-rose-500' : 'text-white'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-[#D4AF37] uppercase block truncate">
                      {story.category.replace(/-/g, ' ')}
                    </span>
                    <h4 className="font-serif-royal text-xs font-bold text-[#FDF6E3] line-clamp-2 mt-0.5">
                      {story.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/10">
                    <button
                      onClick={() => onListenStory(story)}
                      className="flex-1 py-1.5 rounded-lg bg-[#D4AF37] text-[#1A1A1A] font-bold text-[10px] flex items-center justify-center gap-1 active:scale-95 transition"
                    >
                      {isRecorded ? <Mic className="w-3 h-3" /> : <Headphones className="w-3 h-3" />}
                      <span>{t('common', 'listenAudio')}</span>
                    </button>
                    <button
                      onClick={() => onOpenStoryText(story)}
                      className="flex-1 py-1.5 rounded-lg border border-white/20 text-white font-bold text-[10px] flex items-center justify-center gap-1 active:scale-95 transition hover:bg-white/10"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{t('common', 'readText')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recado Carinhoso da Claudia */}
      <div 
        onClick={onOpenChat}
        className="p-4 rounded-3xl bg-gradient-to-r from-[#4A2C6A] to-[#2F1C4A] border border-[#D4AF37]/50 shadow-lg flex items-center justify-between cursor-pointer active:scale-95 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-2xl shadow-gold shrink-0">
            👑
          </div>
          <div>
            <h4 className="font-serif-royal text-xs font-bold text-[#FDF6E3]">
              {language === 'en' ? 'Chat with Aunt Claudia' : language === 'es' ? 'Habla con Tía Claudia' : 'Fale com a Tia Claudia'}
            </h4>
            <p className="text-[11px] text-white/70">
              {language === 'en' ? 'Send a warm message or ask for your favorite story!' : language === 'es' ? '¡Envía un mensaje o pide tu cuento favorito!' : 'Mande um recadinho carinhoso ou peça seu conto favorito!'}
            </p>
          </div>
        </div>

        <span className="p-2 rounded-xl bg-[#D4AF37] text-[#1A1A1A] text-xs font-bold shrink-0">
          <MessageCircle className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
};
