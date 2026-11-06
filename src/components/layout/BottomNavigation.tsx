import React from 'react';
import { ActiveTab, User } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Home, 
  BookOpen, 
  Heart, 
  Crown, 
  MessageCircle, 
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentUser: User | null;
  unreadChatCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  unreadChatCount = 0,
}) => {
  const { t } = useLanguage();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'claudia@x.com';
  const isSubscriber = currentUser && currentUser.subscriptionStatus === 'active';

  let navItems: { tab: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [];

  if (!currentUser || !isSubscriber) {
    // Menu para Visitantes / Não logados
    navItems = [
      {
        tab: 'home',
        label: t('nav', 'home'),
        icon: <Home className="w-5 h-5" />,
      },
      {
        tab: 'library',
        label: t('nav', 'library'),
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        tab: 'subscription',
        label: t('nav', 'subscription'),
        icon: <Crown className="w-5 h-5 text-[#FFE082]" />,
      },
      {
        tab: 'login',
        label: t('nav', 'login'),
        icon: <UserIcon className="w-5 h-5" />,
      },
    ];
  } else if (isAdmin) {
    // Menu para Claudia Administradora
    navItems = [
      {
        tab: 'admin',
        label: t('nav', 'admin'),
        icon: <ShieldAlert className="w-5 h-5 text-[#FFE082]" />,
      },
      {
        tab: 'home',
        label: t('nav', 'home'),
        icon: <Home className="w-5 h-5" />,
      },
      {
        tab: 'library',
        label: t('nav', 'library'),
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        tab: 'chat',
        label: t('nav', 'chat'),
        icon: <MessageCircle className="w-5 h-5" />,
        badge: unreadChatCount,
      },
      {
        tab: 'profile',
        label: t('nav', 'profile'),
        icon: <UserIcon className="w-5 h-5" />,
      },
    ];
  } else {
    // Menu para Assinante Ativo
    navItems = [
      {
        tab: 'home',
        label: t('nav', 'home'),
        icon: <Home className="w-5 h-5" />,
      },
      {
        tab: 'library',
        label: t('nav', 'library'),
        icon: <BookOpen className="w-5 h-5" />,
      },
      {
        tab: 'favorites',
        label: t('nav', 'favorites'),
        icon: <Heart className="w-5 h-5" />,
      },
      {
        tab: 'chat',
        label: t('nav', 'chat'),
        icon: <MessageCircle className="w-5 h-5" />,
        badge: unreadChatCount,
      },
      {
        tab: 'profile',
        label: t('nav', 'profile'),
        icon: <UserIcon className="w-5 h-5" />,
      },
    ];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#160B24]/95 backdrop-blur-xl border-t border-[#D4AF37]/30 safe-bottom">
      <div className="max-w-md mx-auto px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-[#F9E79F] scale-105'
                  : 'text-white/60 hover:text-white/80 active:scale-95'
              }`}
            >
              {/* Active Golden Glow Background */}
              {isActive && (
                <div className="absolute inset-0 bg-[#D4AF37]/15 rounded-xl -z-10" />
              )}

              <div className="relative">
                {item.icon}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-bold text-[#D4AF37]' : ''}`}>
                {item.label}
              </span>

              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#D4AF37] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
