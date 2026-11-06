import React, { useState } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Sparkles } from 'lucide-react';
import { OfflineIndicator } from '../pwa/PWAInstallPrompt';
import { TopInstallBanner } from '../pwa/TopInstallBanner';
import { LanguageSelector } from './LanguageSelector';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [deviceFrame, setDeviceFrame] = useState(true);

  return (
    <div className="min-h-screen bg-[#0D0614] flex flex-col items-center justify-center relative selection:bg-[#D4AF37]/30">
      {/* Offline Status */}
      <OfflineIndicator />

      {/* Desktop Device Frame Switcher (Discreto no topo direito para quem testa no computador) */}
      <div className="hidden lg:flex fixed top-4 right-4 z-50 items-center gap-2 px-3 py-1.5 rounded-full bg-[#24133A]/90 border border-[#D4AF37]/40 text-xs text-white shadow-xl backdrop-blur-md">
        <LanguageSelector variant="pill" />
        <span className="h-4 w-[1px] bg-white/20 mx-1" />
        <span className="text-[10px] text-[#D4AF37] font-semibold mr-1">Modo:</span>
        <button
          onClick={() => setDeviceFrame(true)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
            deviceFrame ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-white/60 hover:text-white'
          }`}
          title="Ver como celular nativo com moldura"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Celular</span>
        </button>
        <button
          onClick={() => setDeviceFrame(false)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
            !deviceFrame ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-white/60 hover:text-white'
          }`}
          title="Ver em tela cheia do navegador"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Tela Cheia</span>
        </button>
      </div>

      {/* Container Principal */}
      <div
        className={`w-full transition-all duration-300 relative ${
          deviceFrame
            ? 'max-w-[440px] min-h-[100dvh] lg:my-6 lg:rounded-[44px] lg:border-[8px] lg:border-[#2D1B48] lg:shadow-[0_0_50px_rgba(212,175,55,0.25)] overflow-hidden bg-[#180E25]'
            : 'max-w-2xl min-h-[100dvh] bg-[#180E25]'
        }`}
      >
        {/* Mobile Status Bar Simulation (Para dar a sensação 100% de aplicativo nativo) */}
        <div className="w-full px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-semibold text-white/70 select-none safe-top">
          <div className="flex items-center gap-2">
            <span>09:41</span>
            <LanguageSelector variant="compact" />
          </div>
          
          {/* Dynamic Island / Notch Fake */}
          <div className="w-16 h-4 bg-black/60 rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/80 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-white/80" />
            <span className="text-[10px]">5G</span>
            <Battery className="w-3.5 h-3.5 text-white/80" />
          </div>
        </div>

        {/* Top Install Banner (Fica no topo da página para instalar direto o PWA) */}
        <TopInstallBanner />

        {/* Conteúdo do App */}
        <div className="px-4 py-2 pb-24">
          {children}
        </div>
      </div>
    </div>
  );
};
