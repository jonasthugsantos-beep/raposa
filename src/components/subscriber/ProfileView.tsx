import React, { useState } from 'react';
import { User, AppSettings } from '../../types';
import { logoutUser } from '../../lib/firebase';
import { PWAInstallPrompt } from '../pwa/PWAInstallPrompt';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSelector } from '../layout/LanguageSelector';
import { 
  User as UserIcon, 
  Crown, 
  Sparkles, 
  LogOut, 
  Globe,
  Info
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: User;
  settings: AppSettings;
  onLogout: () => void;
  onOpenAdmin: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  settings,
  onLogout,
  onOpenAdmin,
}) => {
  const { t, language } = useLanguage();
  const [selectedBadge, setSelectedBadge] = useState(currentUser.avatarBadge || 'fox');
  const isAdmin = currentUser.role === 'admin' || currentUser.email === 'claudia@x.com';

  const badges = [
    { id: 'fox', icon: '🦊', label: 'Raposinha' },
    { id: 'crown', icon: '👑', label: 'Princesa' },
    { id: 'wand', icon: '🪄', label: 'Fadinha' },
    { id: 'star', icon: '⭐', label: 'Estrela' },
    { id: 'rose', icon: '🌹', label: 'Rosa Real' },
  ];

  const handleSelectBadge = (badgeId: any) => {
    setSelectedBadge(badgeId);
    currentUser.avatarBadge = badgeId;
    localStorage.setItem('raposinhas_current_user', JSON.stringify(currentUser));
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = async () => {
    await logoutUser();
    onLogout();
  };

  return (
    <div className="space-y-6 pb-6 text-[#FDF6E3]">
      {/* Header */}
      <div>
        <h1 className="font-serif-royal text-2xl font-bold text-[#FDF6E3]">
          {language === 'en' ? 'My Royal Profile' : language === 'es' ? 'Mi Perfil Real' : 'Meu Perfil Real'}
        </h1>
        <p className="text-xs text-white/70">
          {language === 'en' 
            ? 'Account information and language preferences.' 
            : language === 'es' 
            ? 'Datos de tu cuenta y preferencias de idioma.' 
            : 'Dados da sua conta no Clube das Raposinhas e preferências do aplicativo.'}
        </p>
      </div>

      {/* Cartão de Perfil */}
      <div className="p-6 rounded-3xl bg-[#24133A] border-2 border-[#D4AF37]/50 shadow-xl text-center relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] flex items-center justify-center mx-auto mb-3 text-4xl shadow-gold border-2 border-white/30">
          {badges.find(b => b.id === selectedBadge)?.icon || '🦊'}
        </div>

        <h2 className="font-serif-royal text-lg font-bold text-[#FDF6E3]">
          {currentUser.name}
        </h2>
        <p className="text-xs text-[#D4AF37] font-medium">{currentUser.email}</p>

        <div className="mt-3 flex items-center justify-center gap-2">
          {isAdmin ? (
            <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-xs font-bold text-[#F9E79F] flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Administradora Claudia</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300">
              {language === 'en' ? 'Active Member' : language === 'es' ? 'Suscriptor Activo' : 'Assinante Oficial'}
            </span>
          )}
        </div>

        {/* Escolha de Avatar Mágico */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <label className="text-[11px] font-bold text-white/70 block mb-2 uppercase tracking-wider">
            {language === 'en' ? 'Choose Your Royal Avatar' : language === 'es' ? 'Elige tu Escudo de Avatar' : 'Escolha seu Brasão de Avatar'}
          </label>
          <div className="flex items-center justify-center gap-2">
            {badges.map((b) => (
              <button
                key={b.id}
                onClick={() => handleSelectBadge(b.id)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition active:scale-95 ${
                  selectedBadge === b.id
                    ? 'bg-[#D4AF37] border-2 border-white shadow-gold scale-110'
                    : 'bg-[#190C29] border border-white/10 hover:border-[#D4AF37]/50'
                }`}
                title={b.label}
              >
                {b.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Seção de Idioma do Aplicativo */}
      <div className="p-4 rounded-3xl bg-[#24133A] border border-[#D4AF37]/40 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-lg text-[#1A1A1A] font-bold shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif-royal text-xs font-bold text-[#FDF6E3]">
              {t('common', 'language')} (Language / Idioma)
            </h4>
            <p className="text-[10px] text-white/60">
              {language === 'en' ? 'Change app language anytime' : language === 'es' ? 'Cambia el idioma de la app' : 'Português 🇧🇷, Español 🇪🇸, English 🇺🇸'}
            </p>
          </div>
        </div>

        <LanguageSelector variant="compact" />
      </div>

      {/* Acesso Especial de Administradora */}
      {isAdmin && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#4A2C6A] via-[#351952] to-[#200E33] border-2 border-[#D4AF37] shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] text-[#1A1A1A] flex items-center justify-center text-2xl shadow-gold shrink-0">
              👑
            </div>
            <div>
              <h3 className="font-serif-royal text-sm font-bold text-[#FDF6E3]">
                Painel Administrativo da Claudia
              </h3>
              <p className="text-[11px] text-white/70">
                Gerencie contos, uploads de áudio, assinantes e preço mensal.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAdmin}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-gold hover:brightness-110 active:scale-95 transition shrink-0"
          >
            Abrir Painel
          </button>
        </div>
      )}

      {/* PWA & Instalação */}
      <PWAInstallPrompt compact={false} />

      {/* Informações da Versão */}
      <div className="p-4 rounded-2xl bg-[#1C0D2E] border border-white/10 text-xs text-white/70 space-y-2">
        <div className="flex justify-between">
          <span>{t('common', 'appName')}:</span>
          <span className="font-semibold text-white">PWA Mobile-First</span>
        </div>
        <div className="flex justify-between">
          <span>{language === 'en' ? 'Active Plan:' : language === 'es' ? 'Plan Activo:' : 'Plano Ativo:'}</span>
          <span className="text-[#F9E79F] font-semibold">{settings.planName}</span>
        </div>
      </div>

      {/* Logout */}
      {showLogoutConfirm ? (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-center space-y-3 animate-fade-in">
          <p className="text-xs font-semibold text-rose-200">
            {language === 'en' ? 'Do you really want to sign out?' : language === 'es' ? '¿Deseas cerrar sesión?' : 'Deseja realmente sair da sua conta mágica?'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 py-2 rounded-xl border border-white/20 text-xs font-medium text-white hover:bg-white/10"
            >
              {t('common', 'cancel')}
            </button>
            <button
              onClick={handleLogoutClick}
              className="flex-1 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
            >
              {language === 'en' ? 'Yes, Sign Out' : language === 'es' ? 'Sí, Salir' : 'Sim, Sair'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-300 font-bold text-xs hover:bg-rose-500/20 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{language === 'en' ? 'Sign Out' : language === 'es' ? 'Cerrar Sesión' : 'Sair da Minha Conta'}</span>
        </button>
      )}
    </div>
  );
};
