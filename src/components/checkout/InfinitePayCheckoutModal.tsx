import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AppSettings, User } from '../../types';
import { recordInfinitePaySubscription } from '../../lib/firebase';
import { 
  X, 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Copy, 
  Check, 
  Sparkles, 
  Lock, 
  Crown,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface InfinitePayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  currentUser: User | null;
  onSuccess: (updatedUser: User) => void;
  onOpenAuth: () => void;
}

export const InfinitePayCheckoutModal: React.FC<InfinitePayCheckoutModalProps> = ({
  isOpen,
  onClose,
  settings,
  currentUser,
  onSuccess,
  onOpenAuth,
}) => {
  const [method, setMethod] = useState<'pix' | 'credit_card'>('pix');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<{
    id: string;
    endDate: string;
  } | null>(null);

  // Form states do Cartão
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || 'PRINCESA ASSINANTE');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvv, setCardCvv] = useState('888');
  const [installments, setInstallments] = useState(1);

  // Pix Payload simulado oficial
  const pixPayload = `00020126580014BR.GOV.BCB.PIX0136clube-das-raposinhas-infinitepay@reino.com520400005303986540${settings.monthlyPrice.toFixed(2)}5802BR5925CLUBE DAS RAPOSINHAS ME6009SAO PAULO62070503***6304E8A2`;

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const triggerMagicalCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#F8C8DC', '#6B4C9A', '#FFE082', '#FFFFFF'],
    });
  };

  const handleSimulatePaymentApproval = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Simula envio do webhook da InfinitePay ou ativação direta
      const subscription = await recordInfinitePaySubscription(
        currentUser.uid,
        method,
        settings.monthlyPrice,
        settings.planName
      );

      triggerMagicalCelebration();

      setSuccessData({
        id: subscription.paymentId,
        endDate: new Date(subscription.endDate).toLocaleDateString('pt-BR'),
      });

      // Atualiza usuário no estado pai
      onSuccess({
        ...currentUser,
        subscriptionStatus: 'active',
        subscriptionStart: subscription.startDate,
        subscriptionEnd: subscription.endDate,
      });
    } catch (e) {
      console.error('Erro ao aprovar assinatura:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#2F1C4A] via-[#24133A] to-[#170B26] border-2 border-[#D4AF37] shadow-2xl text-[#FDF6E3] overflow-hidden my-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 active:scale-95 transition z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="bg-[#1C0D2E] p-6 border-b border-white/10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl" />
          
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-white/30 text-2xl">
            👑
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Checkout Seguro InfinitePay</span>
          </div>

          <h2 className="font-serif-royal text-xl font-bold text-[#FDF6E3]">
            {settings.planName}
          </h2>

          <div className="mt-2 flex items-baseline justify-center gap-1 text-[#D4AF37]">
            <span className="text-sm font-semibold">R$</span>
            <span className="text-3xl font-extrabold tracking-tight">
              {settings.monthlyPrice.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-xs text-white/70 font-normal">/mês</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {successData ? (
            /* Tela de Sucesso da Assinatura */
            <div className="text-center py-4 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg">
                ✨
              </div>

              <h3 className="font-serif-royal text-xl font-bold text-[#F9E79F] mb-1">
                Bem-vindo ao Reino Encantado!
              </h3>
              <p className="text-xs text-white/80 max-w-xs mx-auto mb-6">
                Sua assinatura mensal foi ativada com sucesso via InfinitePay. Você agora tem acesso ilimitado a todas as histórias e áudios!
              </p>

              <div className="bg-[#190C29] p-4 rounded-2xl border border-[#D4AF37]/40 text-left space-y-2 mb-6 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Código de Autenticação:</span>
                  <span className="font-mono text-[#F9E79F] font-bold">{successData.id}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold uppercase">Ativa</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Válida até:</span>
                  <span className="text-white font-medium">{successData.endDate}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-sm shadow-gold hover:brightness-110 active:scale-95 transition"
              >
                Começar a Ouvir e Ler Agora 🦊
              </button>
            </div>
          ) : (
            /* Fluxo de Checkout */
            <div>
              {/* Se o usuário não estiver logado */}
              {!currentUser && (
                <div className="mb-5 p-3.5 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-xs text-[#F9E79F] flex items-center justify-between">
                  <div>
                    <p className="font-bold">Faça login ou cadastre-se</p>
                    <p className="text-white/70 text-[11px]">Para vincular a assinatura à sua conta.</p>
                  </div>
                  <button
                    onClick={onOpenAuth}
                    className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-[#1A1A1A] font-bold text-xs shrink-0"
                  >
                    Entrar
                  </button>
                </div>
              )}

              {/* Tabs de Pagamento: Pix vs Cartão */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#190C29] border border-white/10 mb-5">
                <button
                  onClick={() => setMethod('pix')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition ${
                    method === 'pix'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Pix (Instantâneo)</span>
                </button>

                <button
                  onClick={() => setMethod('credit_card')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition ${
                    method === 'credit_card'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cartão de Crédito</span>
                </button>
              </div>

              {method === 'pix' ? (
                /* Conteúdo do Pix */
                <div className="text-center space-y-4">
                  <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto">
                    {/* SVG Pix QR Code artístico representativo */}
                    <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" fill="white" />
                      {/* Cantos do QR */}
                      <rect x="10" y="10" width="24" height="24" stroke="black" strokeWidth="4" fill="white" />
                      <rect x="16" y="16" width="12" height="12" fill="black" />
                      
                      <rect x="66" y="10" width="24" height="24" stroke="black" strokeWidth="4" fill="white" />
                      <rect x="72" y="16" width="12" height="12" fill="black" />

                      <rect x="10" y="66" width="24" height="24" stroke="black" strokeWidth="4" fill="white" />
                      <rect x="16" y="72" width="12" height="12" fill="black" />

                      {/* Pixels centrais */}
                      <rect x="42" y="15" width="6" height="6" fill="#D4AF37" />
                      <rect x="52" y="15" width="6" height="6" fill="black" />
                      <rect x="42" y="25" width="6" height="12" fill="black" />
                      <rect x="15" y="45" width="8" height="8" fill="black" />
                      <rect x="28" y="45" width="6" height="6" fill="#D4AF37" />
                      <rect x="44" y="44" width="12" height="12" fill="black" />
                      <rect x="65" y="45" width="8" height="8" fill="black" />
                      <rect x="78" y="45" width="8" height="8" fill="black" />
                      <rect x="42" y="65" width="6" height="10" fill="black" />
                      <rect x="52" y="70" width="8" height="8" fill="#D4AF37" />
                      <rect x="66" y="72" width="10" height="6" fill="black" />
                      <rect x="80" y="80" width="6" height="6" fill="black" />
                      
                      {/* Logo Pix Central */}
                      <circle cx="50" cy="50" r="10" fill="#4A2C6A" />
                      <text x="50" y="54" fontSize="10" fill="#D4AF37" textAnchor="middle" fontWeight="bold">🦊</text>
                    </svg>
                  </div>

                  <p className="text-xs text-white/75 leading-relaxed">
                    Escaneie o QR Code com o aplicativo do seu banco ou use a chave Pix Copia e Cola abaixo:
                  </p>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#190C29] border border-white/10 text-xs">
                    <input
                      type="text"
                      readOnly
                      value={pixPayload}
                      className="bg-transparent text-white/60 text-xs truncate flex-1 outline-none font-mono"
                    />
                    <button
                      onClick={copyPixCode}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-[#1A1A1A] font-bold text-xs shrink-0 flex items-center gap-1 active:scale-95 transition"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  {/* Botão de Simulação Instantânea do Webhook InfinitePay */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={handleSimulatePaymentApproval}
                      disabled={isProcessing}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Confirmando com a InfinitePay...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#FFE082]" />
                          <span>Simular Pagamento Pix Aprovado (Instantâneo)</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-white/40 block mt-1">
                      Em produção, o webhook InfinitePay ativa sua conta automaticamente em segundos.
                    </span>
                  </div>
                </div>
              ) : (
                /* Conteúdo do Cartão de Crédito */
                <div className="space-y-4">
                  {/* Cartão Visual Real */}
                  <div className="relative h-44 rounded-2xl bg-gradient-to-tr from-[#3D235F] via-[#24133A] to-[#120720] border-2 border-[#D4AF37]/80 p-5 shadow-xl flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl">🦊</span>
                        <span className="font-serif-royal text-xs font-bold text-[#F9E79F]">Clube das Raposinhas</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded-full">
                        InfinitePay
                      </span>
                    </div>

                    {/* Chip Dourado */}
                    <div className="w-9 h-6 rounded-md bg-gradient-to-tr from-[#FFE082] via-[#D4AF37] to-[#8B6508] border border-yellow-200/50 shadow-inner" />

                    <div>
                      <div className="font-mono text-sm tracking-wider text-white font-semibold">
                        {cardNumber}
                      </div>
                      <div className="flex justify-between text-[10px] text-white/70 mt-1 uppercase">
                        <span>{cardHolder || 'TITULAR DO CARTÃO'}</span>
                        <span>{cardExpiry}</span>
                      </div>
                    </div>
                  </div>

                  {/* Campos do Cartão */}
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="text-white/70 block mb-1">Número do Cartão</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-white/70 block mb-1">Validade</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="text-white/70 block mb-1">CVV</label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSimulatePaymentApproval}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-sm shadow-gold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processando InfinitePay...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pagar R$ {settings.monthlyPrice.toFixed(2).replace('.', ',')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
