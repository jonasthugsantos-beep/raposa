import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useLanguage } from '../../i18n/LanguageContext';
import { Download, Sparkles, X, Smartphone } from 'lucide-react';

export const TopInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    const success = await install();
    if (!success && !isInstallable) {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-[#6B4C9A] via-[#4A2C6A] to-[#2D1B48] border-b border-[#D4AF37]/50 px-3 py-2 flex items-center justify-between shadow-md text-white z-40 relative animate-fade-in">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#1A1A1A] font-bold flex items-center justify-center text-sm shadow shrink-0">
            🦊
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-[#F9E79F] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>{t('pwa', 'topBannerTitle')}</span>
            </div>
            <p className="text-xs font-serif-royal font-bold text-[#FDF6E3] truncate">
              {t('common', 'appName')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-extrabold text-xs shadow hover:brightness-110 active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('pwa', 'installButton')}</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
            title={t('common', 'close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#2F1C4A] border-2 border-[#D4AF37]/60 p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowIOSModal(false)}
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
                  Instalar Aplicativo
                </h3>
                <p className="text-xs text-white/70">Clube das Raposinhas</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-white/90 mb-5 bg-[#1F1233] p-4 rounded-xl border border-white/10">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#1A1A1A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                    <span>Toque no botão <strong>Compartilhar</strong> (ícone com seta para cima) na barra do navegador.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#1A1A1A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                    <span>Selecione <strong>Adicionar à Tela de Início</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#1A1A1A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                    <span>Toque em <strong>Adicionar</strong> e o app estará pronto!</span>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-[#F9E79F] font-semibold">Instalação Direta no Android/PC:</p>
                  <p className="text-xs text-white/80">
                    Se o navegador solicitar a confirmação, clique em <strong>Instalar</strong>. Caso contrário, abra o menu do navegador (três pontos no canto superior direito) e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowIOSModal(false);
                install();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Confirmar Instalação ✨</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
