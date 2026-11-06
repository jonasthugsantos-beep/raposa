import React, { useState, useEffect, useRef } from 'react';
import { Story } from '../../types';
import { feminineNarrator, NarratorState } from '../../lib/narratorService';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSelector } from '../layout/LanguageSelector';
import { 
  ArrowLeft, 
  Headphones, 
  Heart, 
  Sparkles, 
  Moon, 
  Sun, 
  Type, 
  MessageCircle, 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Clock,
  Mic,
  Music
} from 'lucide-react';
import { atmosphereEngine, ATMOSPHERE_THEMES } from '../../lib/atmosphereService';

interface StoryReadingViewProps {
  story: Story;
  onBack: () => void;
  onListen: (story: Story) => void;
  onChatAboutStory: (story: Story) => void;
  isFavorite: boolean;
  onToggleFavorite: (storyId: string) => void;
}

export const StoryReadingView: React.FC<StoryReadingViewProps> = ({
  story,
  onBack,
  onListen,
  onChatAboutStory,
  isFavorite,
  onToggleFavorite,
}) => {
  const { t } = useLanguage();
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readingTheme, setReadingTheme] = useState<'parchment' | 'night'>('parchment');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [narratorState, setNarratorState] = useState<NarratorState>(feminineNarrator.getState());
  const contentRef = useRef<HTMLDivElement>(null);

  const hasOriginalAudio = Boolean(story.audioUrl && story.audioUrl.trim().length > 5);

  // Assinatura do Narrador Feminino
  useEffect(() => {
    const unsub = feminineNarrator.subscribe((state) => {
      setNarratorState(state);
    });
    return () => {
      unsub();
      feminineNarrator.stop();
    };
  }, [story.id]);

  useEffect(() => {
    const handleScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const total = el.scrollHeight - el.clientHeight;
      if (total <= 0) {
        setScrollProgress(100);
        return;
      }
      const progress = Math.min(100, Math.max(0, (el.scrollTop / total) * 100));
      setScrollProgress(progress);
    };

    const container = contentRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fontSizeClasses = {
    sm: 'text-sm sm:text-base leading-relaxed',
    base: 'text-base sm:text-lg leading-relaxed',
    lg: 'text-lg sm:text-xl leading-loose',
    xl: 'text-xl sm:text-2xl leading-loose',
  };

  const themeClasses = {
    parchment: 'bg-[#FDF6E3] text-[#2C1D11]',
    night: 'bg-[#180E25] text-[#F3E5AB]',
  };

  const cycleFontSize = () => {
    const sizes: ('sm' | 'base' | 'lg' | 'xl')[] = ['sm', 'base', 'lg', 'xl'];
    const nextIdx = (sizes.indexOf(fontSize) + 1) % sizes.length;
    setFontSize(sizes[nextIdx]);
  };

  const handleStartNarrating = () => {
    feminineNarrator.startNarrating(story, 0);
  };

  const handleToggleNarratorPlay = () => {
    if (narratorState.isSpeaking) {
      if (narratorState.isPaused) {
        feminineNarrator.resume();
      } else {
        feminineNarrator.pause();
      }
    } else {
      handleStartNarrating();
    }
  };

  return (
    <div className={`fixed inset-0 z-40 flex flex-col ${themeClasses[readingTheme]} transition-colors duration-300`}>
      {/* Scroll Progress Bar */}
      <div className="w-full h-1 bg-black/10 fixed top-0 left-0 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Reading Navigation Bar */}
      <header className={`sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 py-2.5 border-b ${
        readingTheme === 'parchment' ? 'bg-[#FDF6E3]/95 border-[#D4AF37]/30 text-[#1A1A1A]' : 'bg-[#180E25]/95 border-white/10 text-white'
      } backdrop-blur-md safe-top`}>
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            onClick={() => {
              feminineNarrator.stop();
              onBack();
            }}
            className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition shrink-0"
            title={t('reader', 'backToLibrary')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-serif-royal font-bold text-xs truncate max-w-[110px] sm:max-w-xs">
            {story.title}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Seletor de Idioma Rápido no Leitor */}
          <LanguageSelector variant="compact" />

          {/* Botão de Narração em Voz Feminina Calma */}
          <button
            onClick={handleToggleNarratorPlay}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full font-bold text-xs shadow-xs active:scale-95 transition ${
              narratorState.isSpeaking
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-[#F8C8DC] to-[#FFB6C1] text-[#4A2C6A] hover:brightness-105'
            }`}
            title="Ouvir o texto lido em voz feminina calma e acolhedora"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {narratorState.isSpeaking
                ? narratorState.isPaused
                  ? t('reader', 'continueVoice')
                  : t('reader', 'pauseVoice')
                : t('reader', 'calmVoiceBtn')}
            </span>
          </button>

          {/* Botão Player de Áudio / Áudio Gravado */}
          <button
            onClick={() => {
              feminineNarrator.stop();
              onListen(story);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-xs hover:brightness-110 active:scale-95 transition"
            title={hasOriginalAudio ? 'Ouvir voz gravada original da narradora' : 'Abrir player de áudio'}
          >
            {hasOriginalAudio ? <Mic className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
            <span>{hasOriginalAudio ? 'Voz Oficial' : 'Player'}</span>
          </button>

          {/* Alternar Tamanho da Fonte */}
          <button
            onClick={cycleFontSize}
            className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-xs font-bold"
            title={t('reader', 'fontAdjust')}
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Alternar Modo Noturno / Pergaminho */}
          <button
            onClick={() => setReadingTheme(readingTheme === 'parchment' ? 'night' : 'parchment')}
            className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            title={readingTheme === 'parchment' ? t('reader', 'nightMode') : t('reader', 'parchmentMode')}
          >
            {readingTheme === 'parchment' ? <Moon className="w-4 h-4 text-[#4A2C6A]" /> : <Sun className="w-4 h-4 text-[#FFE082]" />}
          </button>

          {/* Favoritar */}
          <button
            onClick={() => onToggleFavorite(story.id)}
            className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            title={t('reader', 'favoriteTooltip')}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-current'}`} />
          </button>
        </div>
      </header>

      {/* Banner de Transcrição de Voz Feminina Ativa (Quando o cliente opta por escutar) */}
      {narratorState.isSpeaking && (
        <div className="bg-gradient-to-r from-[#4A2C6A] to-[#2F1C4A] text-white px-4 py-2 flex items-center justify-between border-b border-[#D4AF37]/40 shadow-md animate-slide-down">
          <div className="flex items-center gap-2 text-xs min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping shrink-0" />
            <div className="truncate">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-[#F9E79F]">Narração da Tia Claudia:</span>
                <span className="text-[11px] text-white/90">
                  Parágrafo {narratorState.currentParagraphIndex + 1} de {narratorState.totalParagraphs}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#F9E79F]/90 mt-0.5">
                <span>{(ATMOSPHERE_THEMES[story.category] || ATMOSPHERE_THEMES['floresta-encantada']).icon} Fundo: {(ATMOSPHERE_THEMES[story.category] || ATMOSPHERE_THEMES['floresta-encantada']).name} (Suave de Fundo)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              onClick={() => feminineNarrator.prevParagraph()}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              title="Parágrafo anterior"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleToggleNarratorPlay}
              className="p-1.5 rounded-lg bg-[#D4AF37] text-[#1A1A1A] font-bold"
              title={narratorState.isPaused ? 'Continuar fala' : 'Pausar fala'}
            >
              {narratorState.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            </button>
            <button
              onClick={() => feminineNarrator.nextParagraph()}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              title="Próximo parágrafo"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => feminineNarrator.stop()}
              className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
              title="Parar narração de voz"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Story Content Area */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 max-w-2xl mx-auto w-full safe-bottom"
      >
        {/* Story Header */}
        <div className="text-center mb-8">
          <div className="relative w-full h-52 sm:h-64 rounded-3xl overflow-hidden mb-6 border-2 border-[#D4AF37]/50 shadow-lg">
            <img 
              src={story.coverUrl} 
              alt={story.title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#1A1A1A] font-bold text-[10px] uppercase tracking-wider mb-1.5 self-start">
                {story.category.replace(/-/g, ' ')}
              </span>
              <h1 className="font-serif-royal text-xl sm:text-2xl font-bold text-white leading-tight">
                {story.title}
              </h1>
            </div>
          </div>

          {/* Destaque da Opção de Áudio Oficial Gravado ou Transcrição de Voz Feminina */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#F8C8DC]/30 via-[#FFE082]/20 to-[#6B4C9A]/20 border border-[#D4AF37]/50 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-xl shrink-0 shadow-xs">
                {hasOriginalAudio ? '🎙️' : '🌸'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold font-serif-royal text-[#4A2C6A] dark:text-[#F9E79F]">
                    {hasOriginalAudio 
                      ? 'Áudio com a Voz Oficial da Narradora'
                      : t('reader', 'wantToListenBoxTitle')}
                  </h4>
                  {hasOriginalAudio && (
                    <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#1A1A1A] font-extrabold text-[9px] uppercase tracking-wider">
                      Gravado
                    </span>
                  )}
                </div>
                <p className="text-[11px] opacity-85 mt-0.5">
                  {hasOriginalAudio
                    ? 'Ouça a história completa narrada por esta voz calorosa, calma e acolhedora gravada no conto.'
                    : t('reader', 'wantToListenBoxDesc')}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (hasOriginalAudio) {
                  feminineNarrator.stop();
                  onListen(story);
                } else {
                  handleToggleNarratorPlay();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition shrink-0 flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
              {hasOriginalAudio ? <Mic className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>
                {hasOriginalAudio 
                  ? 'Ouvir Voz Original da Narradora'
                  : narratorState.isSpeaking ? 'Controlar Voz' : t('reader', 'wantToListenBoxBtn')}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-medium opacity-75 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              {story.readingTimeMinutes} {t('common', 'minRead')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5 text-[#D4AF37]" />
              {Math.round(story.audioDurationSec / 60)} {t('common', 'minAudio')}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6">
            {story.tags.map(tag => (
              <span 
                key={tag}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-[#D4AF37]/40 bg-[#D4AF37]/10"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Enchanted Divider */}
          <div className="flex items-center justify-center gap-3 my-6">
            <div className="h-[1px] w-16 bg-[#D4AF37]/40" />
            <span className="text-[#D4AF37] text-lg">⚜️</span>
            <div className="h-[1px] w-16 bg-[#D4AF37]/40" />
          </div>
        </div>

        {/* Story Text */}
        <article 
          className={`font-reading ${fontSizeClasses[fontSize]} prose max-w-none text-justify space-y-4`}
          dangerouslySetInnerHTML={{ __html: story.contentHtml }}
        />

        {/* Story End Seal and Next Steps */}
        <div className="mt-12 pt-8 border-t border-[#D4AF37]/40 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] text-[#1A1A1A] flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg border-2 border-white/40">
            🦊
          </div>
          <h3 className="font-serif-royal text-lg font-bold mb-1">{t('reader', 'storyEndTitle')}</h3>
          <p className="text-xs opacity-75 max-w-sm mx-auto mb-6">
            {t('reader', 'storyEndDesc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                if (hasOriginalAudio) {
                  feminineNarrator.stop();
                  onListen(story);
                } else {
                  handleToggleNarratorPlay();
                }
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition"
            >
              {hasOriginalAudio ? <Mic className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{hasOriginalAudio ? 'Ouvir Novamente (Voz da Narradora)' : t('reader', 'listenAgainBtn')}</span>
            </button>

            <button
              onClick={() => {
                feminineNarrator.stop();
                onChatAboutStory(story);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl border-2 border-[#D4AF37] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#D4AF37]/10 active:scale-95 transition"
            >
              <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('reader', 'tellClaudiaBtn')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
