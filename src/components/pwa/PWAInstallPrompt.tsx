import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Sparkles, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallPrompt: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 4000);
    }
  };

  if (compact) {
    return (
      <>
        {isInstallable && (
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-semibold text-xs shadow-md hover:brightness-110 active:scale-95 transition"
            title="Instalar aplicativo no celular"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar App</span>
          </button>
        )}

        {isIOS && (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D4AF37]/50 text-[#F9E79F] font-medium text-xs hover:bg-[#D4AF37]/10 active:scale-95 transition"
            title="Como instalar no iPhone"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Instalar no iPhone</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-[#2F1C4A] border-2 border-[#D4AF37]/60 p-6 text-white shadow-2xl relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-white/80 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-lg text-2xl">
                  🦊
                </div>
                <div>
                  <h3 className="font-serif-royal text-lg font-bold text-[#F9E79F]">
                    Instalar no seu iPhone
                  </h3>
                  <p className="text-xs text-white/70">Clube das Raposinhas</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-white/90 mb-5 bg-[#1F1233] p-4 rounded-xl border border-white/10">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#1A1A1A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Toque no botão de <strong>Compartilhar</strong> (ícone com quadrado e seta para cima) na barra do Safari.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#1A1A1A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#1A1A1A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Toque em <strong>Adicionar</strong> no canto superior direito para abrir em tela cheia!
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-sm shadow-md"
              >
                Entendi, Mágico! ✨
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Banner expansivo para a home ou perfil
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4A2C6A] via-[#3B2056] to-[#251538] border border-[#D4AF37]/50 p-4 shadow-xl">
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-2xl shrink-0 shadow-inner">
          🦊
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F9E79F]" />
            Experiência 100% App Celular
          </div>
          <h4 className="font-serif-royal text-sm font-bold text-[#FDF6E3] leading-snug">
            Instale o Clube das Raposinhas
          </h4>
          <p className="text-xs text-[#FDF6E3]/70 mt-1">
            Abra em tela cheia sem barras de navegador, com navegação suave e acesso offline aos contos.
          </p>

          <div className="mt-3 flex items-center gap-2">
            {isInstallable && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-[#1A1A1A] font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar Agora</span>
              </button>
            )}

            {isIOS && (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#D4AF37] bg-[#D4AF37]/10 text-[#F9E79F] font-bold text-xs hover:bg-[#D4AF37]/20 active:scale-95 transition"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Instalar no iPhone</span>
              </button>
            )}

            {!isInstallable && !isIOS && (
              <span className="text-xs text-[#FDF6E3]/60 italic flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                PWA ativada no navegador
              </span>
            )}
          </div>
        </div>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#2F1C4A] border-2 border-[#D4AF37]/60 p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-white/80 hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-lg text-2xl">
                🦊
              </div>
              <div>
                <h3 className="font-serif-royal text-lg font-bold text-[#F9E79F]">
                  Instalar no seu iPhone
                </h3>
                <p className="text-xs text-white/70">Clube das Raposinhas</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-white/90 mb-5 bg-[#1F1233] p-4 rounded-xl border border-white/10">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#1A1A1A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Toque no botão <strong>Compartilhar</strong> na barra do Safari (ícone de quadrado com seta para cima).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#1A1A1A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Role a lista e toque em <strong>Adicionar à Tela de Início</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#1A1A1A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Confirme em <strong>Adicionar</strong>. Pronto! O ícone dourado aparecerá entre seus apps.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-sm shadow-md"
            >
              Concluído! ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const OfflineIndicator: React.FC = () => {
  const { isInstalled } = usePWAInstall();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-600/95 border border-amber-400 px-4 py-1.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md">
      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
      <span>Modo Sem Internet — Histórias e recursos salvos disponíveis</span>
    </div>
  );
};
