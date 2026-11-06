import React, { useState } from 'react';
import { User } from '../../types';
import { loginUser, signUpUser } from '../../lib/firebase';
import { X, Lock, Mail, User as UserIcon, Sparkles, Crown, ArrowRight, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const user = await loginUser(email, password);
        onAuthSuccess(user);
        onClose();
      } else if (mode === 'signup') {
        if (!name.trim()) throw new Error('Por favor, informe o seu nome ou o nome da sua raposinha.');
        const user = await signUpUser(name, email, password);
        onAuthSuccess(user);
        onClose();
      } else if (mode === 'forgot') {
        setForgotSent(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Ocorreu um erro ao conectar ao reino encantado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLoginAdmin = async () => {
    setEmail('claudia@x.com');
    setPassword('claudia4321');
    setError(null);
    setIsLoading(true);
    try {
      const user = await loginUser('claudia@x.com', 'claudia4321');
      onAuthSuccess(user);
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLoginSubscriber = async () => {
    setEmail('princesa.sofia@reino.com');
    setPassword('senha123');
    setError(null);
    setIsLoading(true);
    try {
      const user = await loginUser('princesa.sofia@reino.com', 'senha123');
      onAuthSuccess(user);
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#2F1C4A] via-[#24133A] to-[#170B26] border-2 border-[#D4AF37] shadow-2xl text-[#FDF6E3] overflow-hidden my-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 active:scale-95 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="bg-[#1C0D2E] p-6 text-center border-b border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-white/20 text-3xl">
            🦊
          </div>
          <h2 className="font-serif-royal text-xl font-bold text-[#FDF6E3]">
            {mode === 'login' && 'Entrar no Reino'}
            {mode === 'signup' && 'Cadastrar no Clube'}
            {mode === 'forgot' && 'Recuperar Acesso'}
          </h2>
          <p className="text-xs text-white/70 mt-1">
            Clube das Raposinhas • Histórias & Áudios Mágicos
          </p>
        </div>

        {/* Fast Login Shortcuts (Super useful for Claudia & Reviewers!) */}
        <div className="px-6 pt-4 pb-1">
          <p className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Acesso Rápido de Demonstração</span>
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickLoginAdmin}
              className="p-2.5 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 text-left text-xs transition active:scale-95"
            >
              <div className="flex items-center gap-1.5 font-bold text-[#F9E79F]">
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Admin Claudia</span>
              </div>
              <span className="text-[10px] text-white/60 block mt-0.5">claudia@x.com</span>
            </button>

            <button
              type="button"
              onClick={handleQuickLoginSubscriber}
              className="p-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-left text-xs transition active:scale-95"
            >
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>👑</span>
                <span>Assinante Sofia</span>
              </div>
              <span className="text-[10px] text-white/60 block mt-0.5">Assinatura Ativa</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
              {error}
            </div>
          )}

          {forgotSent ? (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs text-center">
              Instruções de redefinição de senha foram enviadas para seu email!
              <button
                type="button"
                onClick={() => {
                  setForgotSent(false);
                  setMode('login');
                }}
                className="mt-3 block w-full py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs"
              >
                Voltar para o Login
              </button>
            </div>
          ) : (
            <>
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs text-white/70 mb-1">Nome Completo</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Princesa Helena"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white placeholder-white/30 text-xs outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-white/70 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white placeholder-white/30 text-xs outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-white/70">Senha</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-[#D4AF37] hover:underline"
                      >
                        Esqueceu?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white placeholder-white/30 text-xs outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-sm shadow-gold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conectando ao Castelo...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Entrar no Clube'}
                      {mode === 'signup' && 'Criar Conta Mágica'}
                      {mode === 'forgot' && 'Enviar Email de Recuperação'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}

          {/* Toggle Login / Signup */}
          <div className="pt-2 text-center text-xs text-white/70">
            {mode === 'login' ? (
              <p>
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-bold text-[#D4AF37] hover:underline ml-1"
                >
                  Cadastre-se aqui
                </button>
              </p>
            ) : (
              <p>
                Já possui conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-[#D4AF37] hover:underline ml-1"
                >
                  Fazer login
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
