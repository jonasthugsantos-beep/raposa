/**
 * AtmosphereService - Gerador de Paisagem Sonora e Fundo Musical Temático
 * Reproduz ambiência sonora e melodia suave baseada no tema da história contada,
 * mantendo o volume sempre abaixo da voz para conforto acústico e imersão mágica.
 */

import { StoryCategory } from '../types';

export interface AtmosphereThemeInfo {
  id: StoryCategory;
  name: string;
  icon: string;
  description: string;
}

export const ATMOSPHERE_THEMES: Record<StoryCategory, AtmosphereThemeInfo> = {
  'floresta-encantada': {
    id: 'floresta-encantada',
    name: 'Brisa da Floresta & Harpa Celta',
    icon: '🌲',
    description: 'Brisa suave nas copas das árvores, pássaros da manhã e harpa relaxante.',
  },
  'princesas-e-castelos': {
    id: 'princesas-e-castelos',
    name: 'Salão Dourado & Sinos de Cristal',
    icon: '👑',
    description: 'Campainhas de cristal suaves e harmonia de castelo real encantado.',
  },
  'lendas-medievais': {
    id: 'lendas-medievais',
    name: 'Alaúde Medieval & Harmonia Serena',
    icon: '🛡️',
    description: 'Acordes medievais tranquilos de alaúde e harpa de sândalo.',
  },
  'historias-para-dormir': {
    id: 'historias-para-dormir',
    name: 'Canção de Ninar & Luar das Estrelas',
    icon: '🌙',
    description: 'Caixinha de música lenta, vento brando e estrelas cintilantes.',
  },
  'contos-de-fadas': {
    id: 'contos-de-fadas',
    name: 'Águas Encantadas & Pó de Fada',
    icon: '✨',
    description: 'Gotas de água cristalina, chimes cintilantes e melodia mágica.',
  },
};

type AtmosphereListener = (state: {
  isPlaying: boolean;
  currentTheme: StoryCategory;
  volume: number; // 0.0 a 1.0 (default 0.18 - bem mais baixo que a voz)
  isEnabled: boolean;
}) => void;

class EnchantedAtmosphereEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private isEnabled = true;
  private currentTheme: StoryCategory = 'floresta-encantada';
  private volume = 0.18; // Volume padrão: ~18% (suave, de fundo, abaixo da voz)
  private sequenceTimer: number | null = null;
  private noiseNode: AudioNode | null = null;
  private noiseGain: GainNode | null = null;
  private listeners: Set<AtmosphereListener> = new Set();

  constructor() {
    // Inicialização sob demanda com gesto do usuário
  }

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public subscribe(listener: AtmosphereListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentTheme: this.currentTheme,
      volume: this.volume,
      isEnabled: this.isEnabled,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(vol, 0.45)); // Limita o teto para nunca abafar a voz
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.audioCtx.currentTime + 0.1);
    }
    this.notify();
  }

  public toggleEnabled() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled && this.isPlaying) {
      this.pause();
    }
    this.notify();
  }

  // Inicia ou muda o fundo sonoro para harmonizar com a história contada
  public startForStory(category: StoryCategory = 'floresta-encantada') {
    if (!this.isEnabled) return;
    this.currentTheme = category;
    this.initAudioContext();
    if (!this.audioCtx || !this.masterGain) return;

    if (this.isPlaying) {
      // Se já estava tocando, atualiza o tema dinamicamente
      this.stopCurrentLoops();
      this.startAtmosphereLoop();
      this.notify();
      return;
    }

    this.isPlaying = true;
    this.startAtmosphereLoop();
    this.notify();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.stopCurrentLoops();
    this.notify();
  }

  public resume() {
    if (!this.isEnabled || this.isPlaying) return;
    this.startForStory(this.currentTheme);
  }

  private stopCurrentLoops() {
    if (this.sequenceTimer) {
      window.clearInterval(this.sequenceTimer);
      this.sequenceTimer = null;
    }
    if (this.noiseNode) {
      try {
        (this.noiseNode as any).stop?.();
        this.noiseNode.disconnect();
      } catch {
        // no-op
      }
      this.noiseNode = null;
    }
  }

  // Gera som contínuo suave e notas de fundo de acordo com o tema
  private startAtmosphereLoop() {
    if (!this.audioCtx || !this.masterGain) return;

    this.stopCurrentLoops();

    // Cria ambiência de brisa/arvoredo para histórias com natureza
    if (this.currentTheme === 'floresta-encantada' || this.currentTheme === 'historias-para-dormir') {
      this.createGentleBreeze();
    }

    // Dispara a primeira harmonia
    this.playThemeHarmonics();

    // Intervalo rítmico calmo para alimentar a atmosfera sem poluição sonora
    const intervalMs = this.currentTheme === 'historias-para-dormir' ? 2400 : 1800;
    this.sequenceTimer = window.setInterval(() => {
      if (!this.isPlaying) return;
      this.playThemeHarmonics();
    }, intervalMs);
  }

  // Brisa suave orgânica sintetizada (vento brando filtrado)
  private createGentleBreeze() {
    if (!this.audioCtx || !this.masterGain) return;

    try {
      const bufferSize = this.audioCtx.sampleRate * 2;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Ruído rosa / marrom suave
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 0.15; // Bem sutil
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filtro passa-baixa para remover qualquer aspereza
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.015, this.audioCtx.currentTime); // Extremamente delicado

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      whiteNoise.start();
      this.noiseNode = whiteNoise;
      this.noiseGain = gain;
    } catch (e) {
      // Navegadores sem suporte silencioso
    }
  }

  // Toca notas e acordes que combinam exatamente com a temática da história
  private playThemeHarmonics() {
    if (!this.audioCtx || !this.masterGain || !this.isPlaying) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    switch (this.currentTheme) {
      // 1. FLORESTA ENCANTADA (Aventuras dos Murmúrios, Artesã, Raposinha)
      case 'floresta-encantada': {
        // Escala pentatônica da floresta: Dó, Ré, Mi, Sol, Lá com timbre de harpa doce
        const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25];
        const note = notes[Math.floor(Math.random() * notes.length)];
        this.synthesizeHarpPluck(note, 0.07, 2.8);

        // Ocasionalmente um canto suave de pássaro ou sino distante
        if (Math.random() < 0.3) {
          const birdPitch = 1200 + Math.random() * 800;
          this.synthesizeWoodlandChirp(birdPitch, 0.03);
        }
        break;
      }

      // 2. PRINCESAS & CASTELOS (Vestido de Estrelas, Palácio Dourado)
      case 'princesas-e-castelos': {
        // Campanadas celestes de cristal e glockenspiel no salão real
        const castleNotes = [523.25, 659.25, 783.99, 987.77, 1046.50];
        const note = castleNotes[Math.floor(Math.random() * castleNotes.length)];
        this.synthesizeCrystalChime(note, 0.06, 3.2);

        if (Math.random() < 0.4) {
          // Harmonia de apoio suave
          this.synthesizeSoftPad(261.63, 0.04, 3.5);
        }
        break;
      }

      // 3. LENDAS MEDIEVAIS (Cavaleiro da Esperança, Dragão Musical)
      case 'lendas-medievais': {
        // Acordes de alaúde/harpa modal em Ré menor / Lídio relaxante
        const luteNotes = [220.00, 261.63, 293.66, 349.23, 392.00, 440.00, 523.25];
        const note1 = luteNotes[Math.floor(Math.random() * luteNotes.length)];
        this.synthesizeLutePluck(note1, 0.065, 2.5);

        if (Math.random() < 0.5) {
          const note2 = luteNotes[Math.floor(Math.random() * luteNotes.length)];
          this.synthesizeLutePluck(note2, 0.045, 2.2, 0.2);
        }
        break;
      }

      // 4. PARA DORMIR (Canção de Ninar, Lua de Prata)
      case 'historias-para-dormir': {
        // Melodia de ninar etérea, tempo lentíssimo, afinada em frequências calmantes
        const lullabyNotes = [329.63, 392.00, 440.00, 523.25, 587.33];
        const note = lullabyNotes[Math.floor(Math.random() * lullabyNotes.length)];
        this.synthesizeMusicBox(note, 0.05, 3.5);

        // Suave ressonância de sono
        if (Math.random() < 0.35) {
          this.synthesizeSoftPad(196.00, 0.03, 4.0);
        }
        break;
      }

      // 5. CONTOS DE FADAS (Espelho de Águas, Fadas)
      case 'contos-de-fadas':
      default: {
        // Gotas d'água cristalinas com ressonância dourada
        const fairyNotes = [392.00, 440.00, 523.25, 659.25, 783.99, 880.00];
        const note = fairyNotes[Math.floor(Math.random() * fairyNotes.length)];
        this.synthesizeDewdrop(note, 0.06, 2.8);

        if (Math.random() < 0.4) {
          this.synthesizeCrystalChime(note * 1.5, 0.03, 2.5);
        }
        break;
      }
    }
  }

  // Timbres Específicos:
  // 1. Harpa Suave
  private synthesizeHarpPluck(freq: number, peakGain: number, duration: number, delay = 0) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + delay);

    const startTime = this.audioCtx.currentTime + delay;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  // 2. Chime de Cristal Real
  private synthesizeCrystalChime(freq: number, peakGain: number, duration: number) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    const startTime = this.audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  // 3. Alaúde Medieval
  private synthesizeLutePluck(freq: number, peakGain: number, duration: number, delay = 0) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 2.2, this.audioCtx.currentTime);

    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + delay);

    const startTime = this.audioCtx.currentTime + delay;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  // 4. Caixinha de Música de Ninar
  private synthesizeMusicBox(freq: number, peakGain: number, duration: number) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    const startTime = this.audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  // 5. Gota d'Água Mágica
  private synthesizeDewdrop(freq: number, peakGain: number, duration: number) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    const startTime = this.audioCtx.currentTime;
    // Rápido pitch glide que soa como gota mágica
    osc.frequency.setValueAtTime(freq * 0.85, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.35, startTime + 0.08);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  // 6. Canto suave de pássaro da floresta
  private synthesizeWoodlandChirp(startFreq: number, peakGain: number) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    const startTime = this.audioCtx.currentTime;
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.linearRampToValueAtTime(startFreq + 350, startTime + 0.06);
    osc.frequency.linearRampToValueAtTime(startFreq + 100, startTime + 0.14);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + 0.25);
  }

  // 7. Pad Aveludado Contínuo
  private synthesizeSoftPad(freq: number, peakGain: number, duration: number) {
    if (!this.audioCtx || !this.masterGain) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    const startTime = this.audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.8);
    gain.gain.linearRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }
}

export const atmosphereEngine = new EnchantedAtmosphereEngine();
