import React, { useState } from 'react';
import { AppSettings } from '../../types';
import { updateAppSettings, isRealFirebaseConfigured } from '../../lib/firebase';
import { 
  DollarSign, 
  Save, 
  Check, 
  Sparkles, 
  ToggleLeft, 
  ToggleRight, 
  Layers, 
  FileText,
  AlertCircle,
  Database
} from 'lucide-react';

interface AdminSettingsManagerProps {
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
}

export const AdminSettingsManager: React.FC<AdminSettingsManagerProps> = ({
  settings,
  onUpdate,
}) => {
  const [monthlyPrice, setMonthlyPrice] = useState(settings.monthlyPrice);
  const [planName, setPlanName] = useState(settings.planName);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(settings.isSubscriptionActive);
  const [bannerNotice, setBannerNotice] = useState(settings.bannerNotice);
  const [landingHeroTitle, setLandingHeroTitle] = useState(settings.landingHeroTitle);
  const [landingHeroSubtitle, setLandingHeroSubtitle] = useState(settings.landingHeroSubtitle);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    setSaveError(null);

    try {
      const updated = await updateAppSettings({
        monthlyPrice: Number(monthlyPrice),
        planName: planName.trim(),
        isSubscriptionActive,
        bannerNotice: bannerNotice.trim(),
        landingHeroTitle: landingHeroTitle.trim(),
        landingHeroSubtitle: landingHeroSubtitle.trim(),
      });

      onUpdate(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: unknown) {
      console.error('Erro ao atualizar configurações:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(msg || 'Falha ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif-royal text-xl font-bold text-[#FDF6E3]">
          Configurações Gerais & Preço da Assinatura
        </h2>
        <p className="text-xs text-white/70">
          Altere o valor da mensalidade (R$), nome do plano e textos da landing page. As alterações são sincronizadas com o Firestore e refletem imediatamente na landing page e no checkout da InfinitePay.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Bloco 1: Precificação e Plano */}
        <div className="p-6 rounded-3xl bg-[#24133A] border-2 border-[#D4AF37] shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            <span>Precificação Oficial da Assinatura</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Valor da Assinatura Mensal (R$)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-[#D4AF37]">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1.00"
                  required
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#190C29] border border-white/20 text-[#F9E79F] font-bold text-lg outline-none focus:border-[#D4AF37]"
                />
              </div>
              <span className="text-[11px] text-white/60 block mt-1">
                Este valor é usado dinamicamente na Landing Page e no checkout Pix/Cartão da InfinitePay.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Nome Comercial do Plano
              </label>
              <input
                type="text"
                required
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Ex: Assinatura Mensal Encantada"
                className="w-full px-4 py-3 rounded-2xl bg-[#190C29] border border-white/20 text-white font-serif-royal font-semibold text-sm outline-none focus:border-[#D4AF37]"
              />
              <span className="text-[11px] text-white/60 block mt-1">
                Aparece no topo do checkout e nos recibos dos assinantes.
              </span>
            </div>
          </div>

          {/* Ativar/Desativar Assinatura */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-[#FDF6E3]">Status do Clube de Assinaturas</h4>
              <p className="text-xs text-white/60">
                Se desativado, novas assinaturas serão pausadas temporariamente.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsSubscriptionActive(!isSubscriptionActive)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 transition"
            >
              {isSubscriptionActive ? (
                <>
                  <span className="text-xs font-bold text-emerald-400">Ativa e Aberta</span>
                  <ToggleRight className="w-6 h-6 text-emerald-400" />
                </>
              ) : (
                <>
                  <span className="text-xs font-bold text-amber-400">Pausada</span>
                  <ToggleLeft className="w-6 h-6 text-amber-400" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bloco 2: Textos da Landing Page e Banner */}
        <div className="p-6 rounded-3xl bg-[#24133A] border border-white/15 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Textos de Destaque da Landing Page</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Faixa de Aviso / Banner no Topo
            </label>
            <input
              type="text"
              value={bannerNotice}
              onChange={(e) => setBannerNotice(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#190C29] border border-white/15 text-white text-xs outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Título Principal da Landing Page (Hero)
            </label>
            <input
              type="text"
              value={landingHeroTitle}
              onChange={(e) => setLandingHeroTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#190C29] border border-white/15 text-white text-sm font-serif-royal outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Subtítulo Descritivo
            </label>
            <textarea
              rows={2}
              value={landingHeroSubtitle}
              onChange={(e) => setLandingHeroSubtitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#190C29] border border-white/15 text-white text-xs outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* Notificação de Sucesso */}
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Configurações e novo preço salvos com sucesso no Firestore!</span>
          </div>
        )}

        {/* Notificação de Erro */}
        {saveError && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Botão de Salvar */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-extrabold text-sm shadow-gold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Salvando no Banco...' : 'Salvar Todas as Configurações'}</span>
        </button>
      </form>
    </div>
  );
};
