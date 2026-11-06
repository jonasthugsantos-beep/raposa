import React, { useState } from 'react';
import { User } from '../../types';
import { loginUser, signUpUser } from '../../lib/firebase';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Crown, 
  User as UserIcon, 
  Mail, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  KeyRound
} from 'lucide-react';

interface LoginAreaViewProps {
  initialRole?: 'client' | 'admin';
  onAuthSuccess: (user: User) => void;
  onGoToHome: () => void;
  onOpenCheckout: () => void;
}

export const LoginAreaView: React.FC<LoginAreaViewProps> = ({
  initialRole = 'client',
  onAuthSuccess,
  onGoToHome,
  onOpenCheckout,
}) => {
  const { t, language } = useLanguage();
  const [activeArea, setActiveArea] = useState<'client' | 'admin'>(initialRole);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSwitchArea = (area: 'client' | 'admin') => {
    setActiveArea(area);
    setErrorMessage(null);
    setSuccessNotice(null);
    if (area === 'admin') {
      setEmail('claudia@x.com');
      setPassword('claudia4321');
      setMode('login');
    } else {
      setEmail('');
      setPassword('');
      setMode('login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);
    setIsLoading(true);

    try {
      if (activeArea === 'admin') {
        const user = await loginUser(email, password);
        if (user.role !== 'admin' && user.email !== 'claudia@x.com') {
          throw new Error(
            language === 'en' 
              ? 'This account does not have administrator privileges.' 
              : language === 'es' 
              ? 'Esta cuenta no posee privilegios de administradora.'
              : 'Esta conta não possui privilégios de administradora.'
          );
        }
        onAuthSuccess(user);
        return;
      }

      // Área do Cliente
      if (mode === 'login') {
        const user = await loginUser(email, password);
        onAuthSuccess(user);
      } else if (mode === 'signup') {
        if (!name.trim()) {
          throw new Error(
            language === 'en'
              ? 'Please enter your name or child\'s name.'
              : language === 'es'
              ? 'Por favor, introduce tu nombre o el del pequeño/a.'
              : 'Por favor, informe seu nome ou o nome do seu pequeno leitor.'
          );
        }
        const user = await signUpUser(name, email, password);
        onAuthSuccess(user);
      } else if (mode === 'forgot') {
        setSuccessNotice(
          language === 'en'
            ? 'We sent a magical password reset link to your email!'
            : language === 'es'
            ? '¡Hemos enviado un enlace mágico para restablecer tu clave!'
            : 'Enviamos um link mágico de redefinição para o seu email!'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || t('common', 'error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickClientLogin = async () => {
    setEmail('princesa.sofia@reino.com');
    setPassword('senha123');
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginUser('princesa.sofia@reino.com', 'senha123');
      onAuthSuccess(user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setEmail('claudia@x.com');
    setPassword('claudia4321');
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginUser('claudia@x.com', 'claudia4321');
      onAuthSuccess(user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-6 text-[#FDF6E3] animate-fade-in">
      {/* Top Header */}
      <div className="text-center pt-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] flex items-center justify-center mx-auto mb-3 text-3xl shadow-gold border-2 border-white/20">
          🦊
        </div>
        <h1 className="font-serif-royal text-2xl font-extrabold text-[#FDF6E3]">
          {language === 'en' ? 'Access Portal' : language === 'es' ? 'Portal de Acceso' : 'Portal de Acesso'}
        </h1>
        <p className="text-xs text-white/70 max-w-xs mx-auto mt-1">
          {language === 'en' 
            ? 'Select below whether you are a Subscriber (Customer) or Administrator (Claudia).'
            : language === 'es'
            ? 'Selecciona si eres Suscriptor (Cliente) o Administradora (Claudia).'
            : 'Selecione abaixo se você é um Assinante (Cliente) ou a Administradora (Claudia).'}
        </p>
      </div>

      {/* Seletor de Área: Cliente vs Admin */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#24133A] border-2 border-[#D4AF37]/50 shadow-lg">
        <button
          type="button"
          onClick={() => handleSwitchArea('client')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition active:scale-95 ${
            activeArea === 'client'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] shadow-gold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>{t('auth', 'clientTab')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitchArea('admin')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition active:scale-95 ${
            activeArea === 'admin'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] shadow-gold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>{t('auth', 'adminTab')}</span>
        </button>
      </div>

      {/* Cartão de Login Conforme a Área Selecionada */}
      {activeArea === 'client' ? (
        /* ================= ÁREA DO CLIENTE ================= */
        <div className="p-6 rounded-3xl bg-[#24133A] border border-[#D4AF37]/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="font-serif-royal text-base font-bold text-[#FDF6E3]">
                {mode === 'login' && t('auth', 'clientLoginTitle')}
                {mode === 'signup' && t('auth', 'createAccountBtn')}
                {mode === 'forgot' && (language === 'en' ? 'Reset Password' : language === 'es' ? 'Recuperar Contraseña' : 'Recuperar Senha')}
              </h2>
              <p className="text-[11px] text-white/60">
                {t('auth', 'clientLoginSubtitle')}
              </p>
            </div>
            <span className="text-2xl">📖</span>
          </div>

          {/* Atalho de Demonstração para Cliente */}
          <div className="p-3 rounded-2xl bg-[#190C29] border border-[#D4AF37]/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] block">
                {language === 'en' ? 'Quick Test Access' : language === 'es' ? 'Acceso Rápido de Prueba' : 'Atalho de Teste Rápido'}
              </span>
              <p className="text-xs font-semibold text-white">Princesa Sofia</p>
            </div>
            <button
              type="button"
              onClick={handleQuickClientLogin}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-[#1A1A1A] font-bold text-xs shadow-sm hover:brightness-110 active:scale-95 transition"
            >
              1-Click
            </button>
          </div>

          {/* Avisos */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
              {errorMessage}
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Formulário do Cliente */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block text-white/70 font-semibold mb-1">{t('auth', 'nameLabel')}</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('auth', 'namePlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-white/70 font-semibold mb-1">{t('auth', 'emailLabel')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth', 'emailPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-white/70 font-semibold">{t('auth', 'passwordLabel')}</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[#D4AF37] hover:underline"
                    >
                      {language === 'en' ? 'Forgot password?' : language === 'es' ? '¿Olvidaste tu clave?' : 'Esqueceu a senha?'}
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
                    placeholder={t('auth', 'passwordPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-sm shadow-gold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('common', 'loading')}</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && t('auth', 'enterBtn')}
                    {mode === 'signup' && t('auth', 'createAccountBtn')}
                    {mode === 'forgot' && (language === 'en' ? 'Send Link' : language === 'es' ? 'Enviar Enlace' : 'Enviar Link')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Alternar Modos de Conta do Cliente */}
          <div className="pt-3 border-t border-white/10 text-center text-xs space-y-2">
            {mode === 'login' ? (
              <>
                <p className="text-white/70">
                  {t('auth', 'noAccountYet')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-[#D4AF37] font-bold hover:underline"
                  >
                    {t('auth', 'createAccountBtn')}
                  </button>
                </p>
                <button
                  type="button"
                  onClick={onOpenCheckout}
                  className="inline-block text-xs font-semibold text-[#F9E79F] underline"
                >
                  {t('auth', 'subscribeNow')}
                </button>
              </>
            ) : (
              <p className="text-white/70">
                {t('auth', 'alreadyHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#D4AF37] font-bold hover:underline"
                >
                  {t('auth', 'signInLink')}
                </button>
              </p>
            )}
          </div>
        </div>
      ) : (
        /* ================= ÁREA DO ADMIN (CLAUDIA) ================= */
        <div className="p-6 rounded-3xl bg-[#24133A] border-2 border-[#D4AF37] shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block">
                {t('auth', 'adminLoginTitle')}
              </span>
              <h2 className="font-serif-royal text-base font-bold text-[#FDF6E3]">
                {language === 'en' ? 'Administrator Login (Claudia)' : language === 'es' ? 'Login Administradora (Claudia)' : 'Login da Administradora (Claudia)'}
              </h2>
            </div>
            <span className="text-2xl">👑</span>
          </div>

          {/* Caixa de Credenciais Oficiais */}
          <div className="p-3.5 rounded-2xl bg-[#190C29] border border-[#D4AF37]/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Email Admin:</span>
              <span className="font-mono text-xs font-bold text-[#F9E79F]">claudia@x.com</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Password:</span>
              <span className="font-mono text-xs font-bold text-[#F9E79F]">claudia4321</span>
            </div>

            <button
              type="button"
              onClick={handleQuickAdminLogin}
              disabled={isLoading}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-gold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 mt-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Auto Sign In as Claudia' : language === 'es' ? 'Entrar como Claudia' : 'Entrar Automaticamente como Claudia'}</span>
            </button>
          </div>

          {/* Erro */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Formulário de Login do Admin */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-white/70 font-semibold mb-1">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="claudia@x.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/70 font-semibold mb-1">{t('auth', 'passwordLabel')}</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#190C29] border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-sm shadow-gold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('common', 'loading')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth', 'enterAdminBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Botão de Voltar para a Página Inicial */}
      <div className="text-center pt-2">
        <button
          onClick={onGoToHome}
          className="text-xs text-white/60 hover:text-[#D4AF37] underline transition"
        >
          ← {language === 'en' ? 'Back to Home' : language === 'es' ? 'Volver al Inicio' : 'Volver para a Página Inicial do Clube'}
        </button>
      </div>
    </div>
  );
};
