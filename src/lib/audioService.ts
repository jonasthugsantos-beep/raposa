// Audio Service com suporte a arquivos MP3/AAC/WAV e Trilha de Fundo Temática Procedural
import { atmosphereEngine } from './atmosphereService';
import { StoryCategory } from '../types';

type AudioStateListener = (state: {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isSynthesized: boolean;
  category: StoryCategory;
}) => void;

class EnchantedAudioEngine {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private synthInterval: number | null = null;
  private listeners: Set<AudioStateListener> = new Set();
  
  private isPlaying = false;
  private currentTime = 0;
  private duration = 300;
  private playbackRate = 1.0;
  private isSynthesized = false;
  private currentStoryId: string | null = null;
  private currentCategory: StoryCategory = 'floresta-encantada';
  private sleepTimerId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';

      this.audioElement.addEventListener('timeupdate', () => {
        if (!this.isSynthesized && this.audioElement) {
          this.currentTime = this.audioElement.currentTime;
          this.duration = this.audioElement.duration || this.duration;
          this.notify();
        }
      });

      this.audioElement.addEventListener('ended', () => {
        this.stop();
      });

      this.audioElement.addEventListener('loadedmetadata', () => {
        if (this.audioElement && this.audioElement.duration) {
          this.duration = this.audioElement.duration;
          this.notify();
        }
      });
    }
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      playbackRate: this.playbackRate,
      isSynthesized: this.isSynthesized,
      category: this.currentCategory,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  public async loadAndPlay(storyId: string, audioUrl?: string, nominalDuration = 300, category: StoryCategory = 'floresta-encantada') {
    this.currentCategory = category;

    if (this.currentStoryId === storyId && (this.isPlaying || this.currentTime > 0)) {
      if (!this.isPlaying) {
        this.resume();
      }
      return;
    }

    this.stop();
    this.currentStoryId = storyId;
    this.duration = nominalDuration || 300;
    this.currentTime = 0;

    // Se houver uma URL de áudio real gravada da narradora
    if (audioUrl && audioUrl.trim().length > 5 && !audioUrl.startsWith('synth:')) {
      this.isSynthesized = false;
      if (this.audioElement) {
        this.audioElement.src = audioUrl;
        this.audioElement.playbackRate = this.playbackRate;
        try {
          await this.audioElement.play();
          this.isPlaying = true;

          // Inicia a atmosfera temática no fundo com volume suave (mais baixo que a voz)
          atmosphereEngine.startForStory(category);

          this.notify();
          return;
        } catch (e) {
          console.warn('Falha ao reproduzir áudio gravado, ativando fundo temático:', e);
        }
      }
    }

    // Caso não haja arquivo gravado, toca a atmosfera temática pura da história
    this.isSynthesized = true;
    this.isPlaying = true;
    atmosphereEngine.startForStory(category);
    this.startProgressTicker();
    this.notify();
  }

  public resume() {
    if (this.isPlaying) return;

    if (!this.isSynthesized && this.audioElement && this.audioElement.src) {
      this.audioElement.play().then(() => {
        this.isPlaying = true;
        atmosphereEngine.resume();
        this.notify();
      }).catch(() => {
        this.startProgressTicker();
        atmosphereEngine.resume();
      });
    } else {
      this.isPlaying = true;
      atmosphereEngine.resume();
      this.startProgressTicker();
      this.notify();
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.synthInterval) {
      window.clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    atmosphereEngine.pause();
    this.notify();
  }

  public stop() {
    this.pause();
    this.currentTime = 0;
    if (this.audioElement) {
      this.audioElement.currentTime = 0;
    }
    atmosphereEngine.pause();
    this.notify();
  }

  public seek(seconds: number) {
    const clamped = Math.max(0, Math.min(seconds, this.duration));
    this.currentTime = clamped;
    if (!this.isSynthesized && this.audioElement) {
      this.audioElement.currentTime = clamped;
    }
    this.notify();
  }

  public skip(secondsDelta: number) {
    this.seek(this.currentTime + secondsDelta);
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
    this.notify();
  }

  public setSleepTimer(minutes: number, onFinish?: () => void) {
    if (this.sleepTimerId) {
      window.clearTimeout(this.sleepTimerId);
      this.sleepTimerId = null;
    }

    if (minutes > 0) {
      this.sleepTimerId = window.setTimeout(() => {
        this.pause();
        this.sleepTimerId = null;
        if (onFinish) onFinish();
      }, minutes * 60 * 1000);
    }
  }

  private startProgressTicker() {
    if (this.synthInterval) {
      window.clearInterval(this.synthInterval);
    }
    this.synthInterval = window.setInterval(() => {
      if (!this.isPlaying) return;
      this.currentTime += 0.5 * this.playbackRate;
      if (this.currentTime >= this.duration) {
        this.stop();
        return;
      }
      this.notify();
    }, 500);
  }
}

export const audioEngine = new EnchantedAudioEngine();
