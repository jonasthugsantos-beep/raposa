import React, { useState, useEffect } from 'react';
import { Story } from '../../types';
import { audioEngine } from '../../lib/audioService';
import { feminineNarrator, NarratorState } from '../../lib/narratorService';
import { atmosphereEngine, ATMOSPHERE_THEMES } from '../../lib/atmosphereService';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Moon, 
  Volume2, 
  ChevronDown, 
  Sparkles, 
  Maximize2,
  Clock,
  Music,
  SkipBack,
  SkipForward,
  BookOpen,
  HeartHandshake,
  Mic
} from 'lucide-react';

interface EnchantedAudioPlayerProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenStoryText: (story: Story) => void;
}

export const EnchantedAudioPlayer: React.FC<EnchantedAudioPlayerProps> = ({
  story,
  isOpen,
  onClose,
  onOpenStoryText,
}) => {
  const { t } = useLanguage();
  const [audioState, setAudioState] = useState(audioEngine.getState());
  const [narratorState, setNarratorState] = useState<NarratorState>(feminineNarrator.getState());
  const [atmosphereState, setAtmosphereState] = useState(atmosphereEngine.getState());
  
  const hasRecordedAudio = Boolean(story?.audioUrl && story.audioUrl.trim().length > 5);
  const [playbackMode, setPlaybackMode] = useState<'recorded' | 'narrator' | 'instrumental'>(
    hasRecordedAudio ? 'recorded' : 'narrator'
  );

  const [isMinimized, setIsMinimized] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // Escuta o motor musical
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((state) => {
      setAudioState(state);
    });
    return () => unsubscribe();
  }, []);

  // Escuta o narrador de voz feminina calma
  useEffect(() => {
    const unsub = feminineNarrator.subscribe((state) => {
      setNarratorState(state);
    });
    return () => unsub();
  }, []);

  // Escuta a ambiência e fundo sonoro do conto
  useEffect(() => {
    const unsub = atmosphereEngine.subscribe((state) => {
      setAtmosphereState(state);
    });
    return () => unsub();
  }, []);

  // Quando uma nova história é aberta no player
  useEffect(() => {
    if (story && isOpen) {
      if (hasRecordedAudio) {
        // Se tiver o áudio gravado pela narradora, toca o áudio original com a harmonia de fundo
        setPlaybackMode('recorded');
        feminineNarrator.stop();
        audioEngine.loadAndPlay(story.id, story.audioUrl, story.audioDurationSec, story.category);
      } else {
        setPlaybackMode('narrator');
        audioEngine.pause();
        feminineNarrator.startNarrating(story, 0);
      }
    }
  }, [story?.id, isOpen]);

  if (!story) return null;

  const currentAtmosphereTheme = ATMOSPHERE_THEMES[story.category] || ATMOSPHERE_THEMES['floresta-encantada'];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleSwitchMode = (newMode: 'recorded' | 'narrator' | 'instrumental') => {
    setPlaybackMode(newMode);
    if (newMode === 'narrator') {
      audioEngine.pause();
      feminineNarrator.startNarrating(story, narratorState.currentParagraphIndex || 0);
    } else if (newMode === 'recorded') {
      feminineNarrator.stop();
      audioEngine.loadAndPlay(story.id, story.audioUrl, story.audioDurationSec, story.category);
    } else {
      feminineNarrator.stop();
      audioEngine.loadAndPlay(story.id, '', story.audioDurationSec, story.category); // síntese instrumental com tema
    }
  };

  const handleTogglePlay = () => {
    if (playbackMode === 'narrator') {
      if (narratorState.isSpeaking) {
        if (narratorState.isPaused) {
          feminineNarrator.resume();
        } else {
          feminineNarrator.pause();
        }
      } else {
        feminineNarrator.startNarrating(story, narratorState.currentParagraphIndex || 0);
      }
    } else {
      if (audioState.isPlaying) {
        audioEngine.pause();
      } else {
        audioEngine.resume();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    audioEngine.seek(target);
  };

  const speeds = [0.75, 0.84, 1.0, 1.25];
  const cycleSpeed = () => {
    if (playbackMode === 'narrator') {
      const currentSpeed = narratorState.speed;
      const currentIdx = speeds.findIndex(s => Math.abs(s - currentSpeed) < 0.05);
      const nextIdx = (currentIdx + 1) % speeds.length;
      feminineNarrator.setSpeed(speeds[nextIdx]);
    } else {
      const currentIdx = speeds.indexOf(audioState.playbackRate);
      const nextIdx = (currentIdx + 1) % speeds.length;
      audioEngine.setPlaybackRate(speeds[nextIdx]);
    }
  };

  const handleSetSleepTimer = (minutes: number) => {
    if (minutes === 0) {
      setSleepTimerRemaining(null);
      setShowSleepTimerModal(false);
      return;
    }

    setSleepTimerRemaining(minutes);
    setShowSleepTimerModal(false);

    setTimeout(() => {
      feminineNarrator.stop();
      audioEngine.pause();
      setSleepTimerRemaining(null);
    }, minutes * 60 * 1000);
  };

  const isCurrentlyPlaying = playbackMode === 'narrator' 
    ? (narratorState.isSpeaking && !narratorState.isPaused)
    : audioState.isPlaying;

  // Barra Flutuante Minimizada no Rodapé
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md rounded-2xl bg-gradient-to-r from-[#2F1C4A] via-[#4A2C6A] to-[#1F1233] border-2 border-[#D4AF37] p-2.5 shadow-2xl flex items-center justify-between animate-slide-up backdrop-blur-md">
        <div 
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
        >
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[#D4AF37]/60">
            <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" />
            {isCurrentlyPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#FDF6E3] truncate font-serif-royal">{story.title}</h4>
            <div className="flex items-center gap-1.5 text-[10px] text-[#D4AF37] flex-wrap">
              <span>
                {playbackMode === 'recorded' 
                  ? '🎙️ Voz Oficial' 
                  : playbackMode === 'narrator' ? '🌸 Voz Calma' : '🎵 Harpa'}
              </span>
              <span>•</span>
              <span className="text-white/80">
                {currentAtmosphereTheme.icon} {currentAtmosphereTheme.name.split('&')[0]}
              </span>
              <span>•</span>
              <span>
                {playbackMode === 'narrator' 
                  ? `P ${(narratorState.currentParagraphIndex || 0) + 1}/${narratorState.totalParagraphs || 1}`
                  : `${formatTime(audioState.currentTime)} / ${formatTime(audioState.duration)}`
                }
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {playbackMode === 'narrator' ? (
            <button
              onClick={() => feminineNarrator.prevParagraph()}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              title="Voltar parágrafo"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => audioEngine.skip(-15)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              title="Voltar 15s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={handleTogglePlay}
            className="w-9 h-9 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-[#1A1A1A] flex items-center justify-center font-bold shadow-md hover:brightness-110 active:scale-95"
          >
            {isCurrentlyPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {playbackMode === 'narrator' ? (
            <button
              onClick={() => feminineNarrator.nextParagraph()}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              title="Próximo parágrafo"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          ) : null}

          <button
            onClick={() => setIsMinimized(false)}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
            title="Expandir reprodutor"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#1C0D2E] via-[#2F1C4A] to-[#12081E] text-[#FDF6E3] safe-top safe-bottom overflow-y-auto no-scrollbar animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button
          onClick={() => setIsMinimized(true)}
          className="p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 active:scale-95 transition"
          title="Minimizar para o rodapé"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FFE082]" />
            {t('common', 'appName')}
          </span>
          <h3 className="text-xs font-serif-royal text-white/80">{t('player', 'title')}</h3>
        </div>

        <button
          onClick={() => {
            onClose();
            onOpenStoryText(story);
          }}
          className="px-3 py-1.5 rounded-full border border-[#D4AF37]/50 text-xs font-bold text-[#F9E79F] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 active:scale-95 transition flex items-center gap-1"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t('player', 'readTextBtn')}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 max-w-sm mx-auto w-full">
        {/* Seletor de Modo: Voz Gravada da Narradora vs Voz Calma Sintética vs Harpa */}
        <div className="w-full mb-4 p-1 rounded-2xl bg-black/40 border border-[#D4AF37]/40 flex items-center gap-1 shadow-inner">
          {hasRecordedAudio && (
            <button
              onClick={() => handleSwitchMode('recorded')}
              className={`flex-1 py-2 px-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition ${
                playbackMode === 'recorded'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>🎙️ Voz Oficial</span>
            </button>
          )}

          <button
            onClick={() => handleSwitchMode('narrator')}
            className={`flex-1 py-2 px-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition ${
              playbackMode === 'narrator'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{t('player', 'modeCalmVoice')}</span>
          </button>

          <button
            onClick={() => handleSwitchMode('instrumental')}
            className={`flex-1 py-2 px-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition ${
              playbackMode === 'instrumental'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>{t('player', 'modeHarp')}</span>
          </button>
        </div>

        {/* Cover Art with Golden Glow */}
        <div className="relative w-56 h-56 sm:w-60 sm:h-60 rounded-3xl overflow-hidden p-2 shadow-2xl mb-4">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#D4AF37]/40 via-[#6B4C9A]/40 to-transparent blur-xl" />
          
          <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-inner bg-black">
            <img 
              src={story.coverUrl} 
              alt={story.title} 
              className={`w-full h-full object-cover transition-transform duration-700 ${isCurrentlyPlaying ? 'scale-105' : 'scale-100'}`} 
            />
            {/* Story Seal */}
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#D4AF37]/50 text-[10px] font-semibold text-[#F9E79F] flex items-center gap-1">
              <span>🦊</span>
              <span>
                {playbackMode === 'recorded' 
                  ? 'Voz Original Gravada' 
                  : playbackMode === 'narrator' ? 'Voz Feminina Calma' : 'Música Encantada'}
              </span>
            </div>
          </div>
        </div>

        {/* Story Titles */}
        <div className="text-center w-full mb-3">
          <h2 className="font-serif-royal text-lg sm:text-xl font-bold text-[#FDF6E3] tracking-wide mb-1 leading-snug truncate">
            {story.title}
          </h2>
          <p className="text-xs text-[#D4AF37] font-medium flex items-center justify-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>
              {playbackMode === 'recorded' 
                ? 'Narrado com a voz oficial de Claudia (Gravação)'
                : playbackMode === 'narrator' 
                  ? t('player', 'narratedByClaudia') 
                  : 'Composição de Ninar'}
            </span>
          </p>
        </div>

        {/* Caixa de Texto do Parágrafo Sendo Narrado (Modo Voz Calma) */}
        {playbackMode === 'narrator' && (
          <div className="w-full mb-4 p-3 rounded-2xl bg-white/5 border border-pink-400/30 text-left backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between text-[11px] text-[#F8C8DC] font-bold mb-1.5">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                {t('player', 'readingNow')}
              </span>
              <span>Parágrafo {(narratorState.currentParagraphIndex || 0) + 1} de {narratorState.totalParagraphs || 1}</span>
            </div>
            <p className="text-xs text-white/90 font-serif-royal italic leading-relaxed line-clamp-3">
              "{narratorState.currentSentenceText || 'Era uma vez, em um reino encantado onde as raposinhas brincavam...'}"
            </p>
          </div>
        )}

        {/* Animated Waveform Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-7 mb-4 w-full">
          {[40, 75, 30, 90, 60, 100, 45, 80, 50, 85, 35, 70, 95, 60, 40].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full bg-gradient-to-t ${playbackMode === 'narrator' ? 'from-rose-400 to-[#F8C8DC]' : 'from-[#D4AF37] to-[#F9E79F]'} transition-all duration-300 ${
                isCurrentlyPlaying ? 'animate-pulse' : 'opacity-30'
              }`}
              style={{
                height: isCurrentlyPlaying ? `${Math.max(15, (h * ((i % 3) + 1)) % 100)}%` : '20%',
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>

        {/* Progress Slider (Modo Áudio / Gravado / Harpa) ou Barra de Parágrafos (Modo Sintetizador) */}
        <div className="w-full mb-5">
          {playbackMode !== 'narrator' ? (
            <>
              <input
                type="range"
                min={0}
                max={audioState.duration || 110}
                value={audioState.currentTime}
                onChange={handleSeek}
                className="w-full h-2 rounded-lg bg-white/15 accent-[#D4AF37] cursor-pointer"
              />
              <div className="flex justify-between items-center text-xs text-white/60 mt-1 font-mono">
                <span>{formatTime(audioState.currentTime)}</span>
                <span>{formatTime(audioState.duration)}</span>
              </div>
            </>
          ) : (
            <div className="w-full">
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-400 to-[#D4AF37] transition-all duration-300"
                  style={{ 
                    width: `${Math.round((((narratorState.currentParagraphIndex || 0) + 1) / (narratorState.totalParagraphs || 1)) * 100)}%` 
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-[#F8C8DC] mt-1 font-mono">
                <span>Início</span>
                <span>Progresso da Narração</span>
                <span>Fim</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4 w-full mb-4">
          {/* Speed Toggle */}
          <button
            onClick={cycleSpeed}
            className="w-10 h-10 rounded-full bg-white/10 text-xs font-bold text-[#F9E79F] hover:bg-white/20 active:scale-95 transition flex items-center justify-center"
            title={t('player', 'speed')}
          >
            {playbackMode === 'narrator' ? `${narratorState.speed}x` : `${audioState.playbackRate}x`}
          </button>

          {/* Skip Back */}
          {playbackMode === 'narrator' ? (
            <button
              onClick={() => feminineNarrator.prevParagraph()}
              className="p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition"
              title="Voltar parágrafo"
            >
              <SkipBack className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={() => audioEngine.skip(-15)}
              className="p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition"
              title="Voltar 15 segundos"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          )}

          {/* Play / Pause Giant Button */}
          <button
            onClick={handleTogglePlay}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-gold hover:brightness-110 active:scale-95 transition ${
              playbackMode === 'narrator'
                ? 'bg-gradient-to-tr from-rose-500 via-pink-400 to-rose-600 text-white'
                : 'bg-gradient-to-tr from-[#D4AF37] via-[#F9E79F] to-[#AA7C11] text-[#1A1A1A]'
            }`}
            title={isCurrentlyPlaying ? 'Pausar conto' : 'Tocar conto'}
          >
            {isCurrentlyPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          {/* Skip Forward */}
          {playbackMode === 'narrator' ? (
            <button
              onClick={() => feminineNarrator.nextParagraph()}
              className="p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition"
              title="Avançar parágrafo"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={() => audioEngine.skip(15)}
              className="p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition"
              title="Avançar 15 segundos"
            >
              <RotateCw className="w-6 h-6" />
            </button>
          )}

          {/* Sleep Timer */}
          <button
            onClick={() => setShowSleepTimerModal(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              sleepTimerRemaining 
                ? 'bg-[#D4AF37] text-[#1A1A1A] font-bold' 
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
            title={t('player', 'sleepTimer')}
          >
            <Moon className="w-5 h-5" />
          </button>
        </div>

        {/* Active Sleep Timer Indicator */}
        {sleepTimerRemaining && (
          <div className="text-xs text-[#D4AF37] flex items-center gap-1.5 animate-pulse mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('player', 'timerActiveNotice', { mins: sleepTimerRemaining })}</span>
          </div>
        )}

        {/* Fundo Temático Suave (Sons e Harmonias no tema da história, mais baixo que a voz) */}
        <div className="w-full mt-1 p-3 rounded-2xl bg-black/40 border border-[#D4AF37]/30 backdrop-blur-md text-xs shadow-inner">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0 p-1 rounded-xl bg-white/5 border border-white/10">
                {currentAtmosphereTheme.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[#F9E79F] text-xs font-serif-royal truncate">
                    {currentAtmosphereTheme.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[9px] text-[#F9E79F] font-bold">
                    {t('player', 'atmosphereSubordinateNotice')}
                  </span>
                </div>
                <p className="text-[10px] text-white/70 line-clamp-1 mt-0.5">
                  {currentAtmosphereTheme.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => atmosphereEngine.toggleEnabled()}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition shrink-0 flex items-center gap-1 ${
                atmosphereState.isEnabled 
                  ? 'border-[#D4AF37]/60 bg-[#D4AF37]/25 text-[#F9E79F] shadow-xs' 
                  : 'border-white/20 bg-white/5 text-white/50'
              }`}
              title={atmosphereState.isEnabled ? t('player', 'atmosphereMute') : t('player', 'atmosphereUnmute')}
            >
              <Music className="w-3 h-3" />
              <span>{atmosphereState.isEnabled ? 'Fundo Ativo' : 'Silenciado'}</span>
            </button>
          </div>

          {/* Volume slider sutil para o fundo sonoro */}
          {atmosphereState.isEnabled && (
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <span className="text-[10px] text-white/60 shrink-0 flex items-center gap-1 font-medium">
                <Volume2 className="w-3 h-3 text-[#D4AF37]" />
                {t('player', 'atmosphereVolume')}:
              </span>
              <input
                type="range"
                min={0}
                max={0.35}
                step={0.01}
                value={atmosphereState.volume}
                onChange={(e) => atmosphereEngine.setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1.5 rounded-lg bg-white/20 accent-[#D4AF37] cursor-pointer"
                title="Ajuste do fundo temático (mantido suave abaixo da voz)"
              />
              <span className="text-[10px] font-mono text-[#F9E79F] shrink-0 font-bold">
                {Math.round((atmosphereState.volume / 0.35) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sleep Timer Modal */}
      {showSleepTimerModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#2F1C4A] border-2 border-[#D4AF37] p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center mx-auto mb-3 text-2xl">
              🌙
            </div>
            <h3 className="font-serif-royal text-lg font-bold text-[#FDF6E3] mb-1">
              {t('player', 'sleepTimerTitle')}
            </h3>
            <p className="text-xs text-white/70 mb-5">
              {t('player', 'sleepTimerDesc')}
            </p>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSetSleepTimer(mins)}
                  className={`py-2.5 rounded-xl border font-bold text-xs transition ${
                    sleepTimerRemaining === mins
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-[#1A1A1A]'
                      : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {mins} {t('player', 'minutesLabel')}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSetSleepTimer(0)}
                className="flex-1 py-2 rounded-xl border border-white/20 text-white/80 text-xs font-medium hover:bg-white/10"
              >
                {t('player', 'disableTimer')}
              </button>
              <button
                onClick={() => setShowSleepTimerModal(false)}
                className="flex-1 py-2 rounded-xl bg-[#D4AF37] text-[#1A1A1A] text-xs font-bold"
              >
                {t('common', 'close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
