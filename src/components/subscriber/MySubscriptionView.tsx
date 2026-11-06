import React from 'react';
import { User, AppSettings, Subscription } from '../../types';
import { getUserSubscriptions } from '../../lib/firebase';
import { 
  Crown, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface MySubscriptionViewProps {
  currentUser: User;
  settings: AppSettings;
  onOpenCheckout: () => void;
  onOpenChat: () => void;
}

export const MySubscriptionView: React.FC<MySubscriptionViewProps> = ({
  currentUser,
  settings,
  onOpenCheckout,
  onOpenChat,
}) => {
  const subscriptions = getUserSubscriptions(currentUser.uid);
  const isActive = currentUser.subscriptionStatus === 'active';
  const renewalDate = currentUser.subscriptionEnd 
    ? new Date(currentUser.subscriptionEnd).toLocaleDateString('pt-BR')
    : 'Em 30 dias';

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
          <Crown className="w-4 h-4" />
          <span>Membro Real do Clube</span>
        </div>
        <h1 className="font-serif-royal text-2xl font-bold text-[#FDF6E3]">
          Minha Assinatura
        </h1>
        <p className="text-xs text-white/70">
          Detalhes do seu plano, status de acesso e histórico de pagamentos InfinitePay.
        </p>
      </div>

      {/* Cartão Real de Membro da Nobreza */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#3D235F] via-[#2A1444] to-[#160B24] border-2 border-[#D4AF37] p-6 shadow-2xl text-[#FDF6E3]">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] flex items-center justify-center text-3xl shadow-gold border-2 border-white/30">
              🦊
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">
                Passe Livre do Reino
              </span>
              <h3 className="font-serif-royal text-lg font-bold text-[#FDF6E3]">
                {settings.planName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isActive ? 'Ativa' : 'Suspensa'}</span>
          </div>
        </div>

        {/* Informações do Assinante */}
        <div className="space-y-3 bg-[#170928]/80 p-4 rounded-2xl border border-white/10 text-xs">
          <div className="flex justify-between items-center text-white/70">
            <span>Nome do Assinante:</span>
            <span className="font-bold text-white">{currentUser.name}</span>
          </div>

          <div className="flex justify-between items-center text-white/70">
            <span>Valor Mensal:</span>
            <span className="font-bold text-[#F9E79F]">
              R$ {settings.monthlyPrice.toFixed(2).replace('.', ',')} / mês
            </span>
          </div>

          <div className="flex justify-between items-center text-white/70">
            <span>Próxima Renovação:</span>
            <span className="font-bold text-emerald-400">{renewalDate}</span>
          </div>

          <div className="flex justify-between items-center text-white/70">
            <span>Processadora de Pagamento:</span>
            <span className="font-semibold text-white">InfinitePay Segura</span>
          </div>
        </div>

        {!isActive && (
          <button
            onClick={onOpenCheckout}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-gold hover:brightness-110 active:scale-95 transition"
          >
            Reativar Assinatura Agora
          </button>
        )}
      </div>

      {/* Benefícios Inclusos na Assinatura */}
      <div className="p-5 rounded-3xl bg-[#24133A] border border-white/10 shadow-lg">
        <h3 className="font-serif-royal text-sm font-bold text-[#FDF6E3] mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>Privilégios Inclusos na Sua Assinatura</span>
        </h3>

        <div className="space-y-2.5">
          {settings.perksList.map((perk, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-white/80">
              <span className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✓
              </span>
              <span>{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dúvidas ou Suporte */}
      <div className="p-4 rounded-2xl bg-[#1C0D2E] border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
          <div>
            <h4 className="text-xs font-bold text-[#FDF6E3]">Precisa de ajuda com o plano?</h4>
            <p className="text-[11px] text-white/60">Tia Claudia responde suas dúvidas diretamente no chat.</p>
          </div>
        </div>

        <button
          onClick={onOpenChat}
          className="px-3.5 py-1.5 rounded-xl border border-[#D4AF37] text-xs font-bold text-[#F9E79F] hover:bg-[#D4AF37]/10 active:scale-95 transition"
        >
          Conversar
        </button>
      </div>
    </div>
  );
};
