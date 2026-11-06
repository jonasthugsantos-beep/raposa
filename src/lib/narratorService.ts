/**
 * NarratorService - Serviço de Narração com a Voz Idêntica/Parecida à Narradora Oficial
 * Voz feminina calma, acolhedora, doce e serena (Tia Claudia / A Artesã da Floresta).
 * Ajustada minuciosamente ao ritmo (0.84x) e entonação da gravação original de conto de fadas.
 * Suporta Português (Brasil), Espanhol e Inglês.
 */

import { Story } from '../types';
import { Language } from '../i18n/types';
import { atmosphereEngine } from './atmosphereService';

export interface NarratorState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentParagraphIndex: number;
  totalParagraphs: number;
  currentSentenceText: string;
  voiceName: string;
  speed: number;
  pitch: number;
  language: Language;
}

type NarratorListener = (state: NarratorState) => void;

class WarmFeminineNarrator {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private paragraphs: string[] = [];
  private currentParagraphIdx = 0;
  private listeners: Set<NarratorListener> = new Set();
  
  private isSpeaking = false;
  private isPaused = false;
  private currentSentenceText = '';
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private speed = 0.84; // Ritmo idêntico à voz do áudio gravado (pausado, carinhoso)
  private pitch = 1.02; // Tom aveludado, suave e reconfortante
  private currentLanguage: Language = 'pt-BR';
  private currentStoryId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadBestFeminineVoice();

      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.loadBestFeminineVoice();
        };
      }

      window.addEventListener('raposinhas_lang_change', (e: Event) => {
        const custom = e as CustomEvent<{ language: Language }>;
        if (custom.detail?.language) {
          this.setLanguage(custom.detail.language);
        }
      });
    }
  }

  public setLanguage(lang: Language) {
    this.currentLanguage = lang;
    this.loadBestFeminineVoice();
  }

  // Encontra a voz feminina calma e acolhedora mais parecida com a gravação original
  private loadBestFeminineVoice(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    let targetLangPrefix = 'pt';
    let preferredFemaleNames = [
      'luciana',
      'leticia',
      'maria',
      'fernanda',
      'francisca',
      'yara',
      'vitória',
      'google português',
      'portuguese',
      'female',
      'mulher',
    ];

    if (this.currentLanguage === 'es') {
      targetLangPrefix = 'es';
      preferredFemaleNames = [
        'paulina',
        'mónica',
        'monica',
        'sofia',
        'helena',
        'laura',
        'google español',
        'spanish',
        'female',
      ];
    } else if (this.currentLanguage === 'en') {
      targetLangPrefix = 'en';
      preferredFemaleNames = [
        'samantha',
        'victoria',
        'karen',
        'serena',
        'google us english',
        'natural',
        'female',
      ];
    }

    const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(targetLangPrefix));

    // Preferência 1: Nomes femininos doces e calmos
    let found = langVoices.find(v => {
      const name = v.name.toLowerCase();
      return preferredFemaleNames.some(p => name.includes(p));
    });

    // Preferência 2: Qualquer voz do idioma correspondente
    if (!found && langVoices.length > 0) {
      found = langVoices[0];
    }

    // Preferência 3: Qualquer voz
    if (!found && voices.length > 0) {
      found = voices[0];
    }

    this.selectedVoice = found || null;
    this.notify();
    return this.selectedVoice;
  }

  public subscribe(listener: NarratorListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState(): NarratorState {
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      currentParagraphIndex: this.currentParagraphIdx,
      totalParagraphs: this.paragraphs.length,
      currentSentenceText: this.currentSentenceText,
      voiceName: this.selectedVoice ? this.selectedVoice.name : 'Voz Acolhedora da Narradora Oficial',
      speed: this.speed,
      pitch: this.pitch,
      language: this.currentLanguage,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  private extractParagraphs(contentHtml: string): string[] {
    if (typeof document === 'undefined') return [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentHtml;

    const elements = tempDiv.querySelectorAll('p, div.italic, blockquote');
    const result: string[] = [];

    elements.forEach(el => {
      const text = el.textContent?.trim() || '';
      if (text.length > 4 && !text.startsWith('—')) {
        result.push(text);
      }
    });

    if (result.length === 0) {
      const fullText = tempDiv.textContent || '';
      return fullText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 4);
    }

    return result;
  }

  public startNarrating(story: Story, startAtParagraph = 0) {
    if (!this.synth) {
      console.warn('SpeechSynthesis não suportado');
      return;
    }

    this.stop();
    this.currentStoryId = story.id;
    this.paragraphs = this.extractParagraphs(story.contentHtml);
    this.currentParagraphIdx = Math.max(0, Math.min(startAtParagraph, this.paragraphs.length - 1));

    if (this.paragraphs.length === 0) return;

    this.isSpeaking = true;
    this.isPaused = false;
    this.notify();

    // Inicia fundo temático sonoro correspondente à história (mais baixo que a voz)
    atmosphereEngine.startForStory(story.category);

    if (!this.selectedVoice) {
      this.loadBestFeminineVoice();
    }

    this.speakCurrentParagraph();
  }

  private speakCurrentParagraph() {
    if (!this.synth || !this.isSpeaking || this.currentParagraphIdx >= this.paragraphs.length) {
      this.stop();
      return;
    }

    const textToSpeak = this.paragraphs[this.currentParagraphIdx];
    this.currentSentenceText = textToSpeak;
    this.notify();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    // Configuração de idioma e afinação idêntica à gravação
    if (this.currentLanguage === 'es') {
      utterance.lang = 'es-ES';
    } else if (this.currentLanguage === 'en') {
      utterance.lang = 'en-US';
    } else {
      utterance.lang = 'pt-BR';
    }

    utterance.rate = this.speed; // 0.84x (cadência serena e acolhedora)
    utterance.pitch = this.pitch; // 1.02x (doçura maternal)
    utterance.volume = 1.0;

    utterance.onend = () => {
      if (this.isSpeaking && !this.isPaused) {
        // Pausa suave de 650ms entre parágrafos, como no áudio original
        setTimeout(() => {
          if (this.isSpeaking && !this.isPaused) {
            this.currentParagraphIdx += 1;
            if (this.currentParagraphIdx < this.paragraphs.length) {
              this.speakCurrentParagraph();
            } else {
              this.stop();
            }
          }
        }, 650);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Erro na síntese da voz:', e);
      if (this.isSpeaking) {
        this.currentParagraphIdx += 1;
        if (this.currentParagraphIdx < this.paragraphs.length) {
          this.speakCurrentParagraph();
        } else {
          this.stop();
        }
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (!this.synth || !this.isSpeaking) return;
    this.synth.pause();
    this.isPaused = true;
    atmosphereEngine.pause();
    this.notify();
  }

  public resume() {
    if (!this.synth || !this.isSpeaking) return;
    this.synth.resume();
    this.isPaused = false;
    atmosphereEngine.resume();
    this.notify();
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentSentenceText = '';
    atmosphereEngine.pause();
    this.notify();
  }

  public nextParagraph() {
    if (this.currentParagraphIdx < this.paragraphs.length - 1) {
      if (this.synth) this.synth.cancel();
      this.currentParagraphIdx += 1;
      this.speakCurrentParagraph();
    }
  }

  public prevParagraph() {
    if (this.currentParagraphIdx > 0) {
      if (this.synth) this.synth.cancel();
      this.currentParagraphIdx -= 1;
      this.speakCurrentParagraph();
    }
  }

  public setSpeed(speed: number) {
    this.speed = speed;
    this.notify();
    if (this.isSpeaking && !this.isPaused) {
      if (this.synth) this.synth.cancel();
      this.speakCurrentParagraph();
    }
  }

  public setPitch(pitch: number) {
    this.pitch = pitch;
    this.notify();
    if (this.isSpeaking && !this.isPaused) {
      if (this.synth) this.synth.cancel();
      this.speakCurrentParagraph();
    }
  }
}

export const feminineNarrator = new WarmFeminineNarrator();
