import React, { useState, useEffect } from 'react';
import { User, Story, AppSettings, ActiveTab, StoryCategory } from './types';
import { 
  getCurrentUser, 
  onAuthStateChanged, 
  getAppSettings, 
  getStories, 
  getFavoriteStoryIds, 
  toggleFavoriteStory, 
  incrementStoryStats 
} from './lib/firebase';
import { AppShell } from './components/layout/AppShell';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { SplashScreen } from './components/splash/SplashScreen';
import { PostSplashInstallModal } from './components/pwa/PostSplashInstallModal';
import { LandingPage } from './components/landing/LandingPage';
import { SubscriberHome } from './components/subscriber/SubscriberHome';
import { StoryLibrary } from './components/subscriber/StoryLibrary';
import { FavoritesView } from './components/subscriber/FavoritesView';
import { MySubscriptionView } from './components/subscriber/MySubscriptionView';
import { ProfileView } from './components/subscriber/ProfileView';
import { EnchantedChatView } from './components/chat/EnchantedChatView';
import { StoryReadingView } from './components/story/StoryReadingView';
import { EnchantedAudioPlayer } from './components/audio/EnchantedAudioPlayer';
import { InfinitePayCheckoutModal } from './components/checkout/InfinitePayCheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminStoriesManager } from './components/admin/AdminStoriesManager';
import { AdminSettingsManager } from './components/admin/AdminSettingsManager';
import { AdminUsersManager } from './components/admin/AdminUsersManager';
import { LoginAreaView } from './components/auth/LoginAreaView';
import { INITIAL_SETTINGS } from './data/initialData';
import { useLanguage } from './i18n/LanguageContext';

export default function App() {
  const { t, language } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);
  const [showPostSplashInstall, setShowPostSplashInstall] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [stories, setStories] = useState<Story[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | null>(null);
  const [adminSubTab, setAdminSubTab] = useState<'dashboard' | 'stories' | 'settings' | 'users'>('dashboard');

  // Modals & Immersive Views
  const [readingStory, setReadingStory] = useState<Story | null>(null);
  const [audioStory, setAudioStory] = useState<Story | null>(null);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [chatInitialTopic, setChatInitialTopic] = useState<string | undefined>(undefined);
  const [loginInitialRole, setLoginInitialRole] = useState<'client' | 'admin'>('client');

  // Inicialização e Listeners
  useEffect(() => {
    // Auth Listener
    const unsubAuth = onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        setFavoriteIds(getFavoriteStoryIds(user.uid));
      }
    });

    // Carregar configurações e histórias
    getAppSettings().then(setSettings);
    getStories().then(setStories);

    // Escuta sincronizada para mudanças no banco de dados e aplicativo
    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail?.key || customEvent.detail.key === 'raposinhas_stories_db') {
        getStories().then((updatedStories) => {
          setStories(updatedStories);
          setReadingStory((curr) => {
            if (curr && !updatedStories.some(s => s.id === curr.id)) return null;
            return curr ? updatedStories.find(s => s.id === curr.id) || null : null;
          });
          setAudioStory((curr) => {
            if (curr && !updatedStories.some(s => s.id === curr.id)) {
              setIsAudioOpen(false);
              return null;
            }
            return curr ? updatedStories.find(s => s.id === curr.id) || null : null;
          });
        });
      }
      if (customEvent.detail?.key === 'raposinhas_settings_db') {
        getAppSettings().then(setSettings);
      }
    };

    window.addEventListener('raposinhas_storage_change', handleStorageChange);

    return () => {
      unsubAuth();
      window.removeEventListener('raposinhas_storage_change', handleStorageChange);
    };
  }, [currentUser?.uid]);

  const refreshStories = () => {
    getStories().then((updatedStories) => {
      setStories(updatedStories);
      setReadingStory((curr) => {
        if (!curr) return null;
        return updatedStories.find(s => s.id === curr.id) || null;
      });
      setAudioStory((curr) => {
        if (!curr) return null;
        const match = updatedStories.find(s => s.id === curr.id);
        if (!match) {
          setIsAudioOpen(false);
          return null;
        }
        return match;
      });
    });
  };

  const handleOpenLogin = (role: 'client' | 'admin' = 'client') => {
    setLoginInitialRole(role);
    setActiveTab('login');
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    if (user.role === 'admin' || user.email === 'claudia@x.com') {
      setActiveTab('admin');
    } else {
      setActiveTab('home');
    }
  };

  const handleToggleFavorite = (storyId: string) => {
    if (!currentUser) {
      handleOpenLogin('client');
      return;
    }
    toggleFavoriteStory(currentUser.uid, storyId);
    setFavoriteIds(getFavoriteStoryIds(currentUser.uid));
  };

  // Abrir Leitura de História
  const handleOpenReading = (story: Story) => {
    // Se o usuário não tiver assinatura ativa, abre o checkout
    if (!currentUser || currentUser.subscriptionStatus !== 'active') {
      setIsCheckoutOpen(true);
      return;
    }
    setReadingStory(story);
    incrementStoryStats(story.id, 'view');
  };

  // Abrir Áudio da História
  const handleOpenAudio = (story: Story) => {
    // Se não tiver assinatura ativa, abre o checkout ou reproduz amostra
    if (!currentUser || currentUser.subscriptionStatus !== 'active') {
      setIsCheckoutOpen(true);
      return;
    }
    setAudioStory(story);
    setIsAudioOpen(true);
    incrementStoryStats(story.id, 'listen');
  };

  // Preview gratuito de áudio para visitantes na Landing
  const handlePreviewListen = (story: Story) => {
    setAudioStory(story);
    setIsAudioOpen(true);
  };

  const handleChatAboutStory = (story: Story) => {
    setReadingStory(null);
    setChatInitialTopic(`Olá Tia Claudia! Acabei de ler "${story.title}" e achei tão lindo! ✨`);
    setActiveTab('chat');
  };

  // Verifica se deve exibir a Landing Page (quando não há usuário ou a assinatura está inativa)
  const isSubscriber = currentUser && currentUser.subscriptionStatus === 'active';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'claudia@x.com';

  return (
    <>
      {/* Splash Screen Inicial */}
      {showSplash && (
        <SplashScreen onComplete={() => {
          setShowSplash(false);
          setShowPostSplashInstall(true);
        }} />
      )}

      {/* Modal de Instalação PWA Pós-Splash */}
      <PostSplashInstallModal
        isOpen={showPostSplashInstall}
        onClose={() => setShowPostSplashInstall(false)}
      />

      {/* App Shell Mobile */}
      <AppShell>
        {/* Visualização de Leitura Imersiva (Sobreposta) */}
        {readingStory && (
          <StoryReadingView
            story={readingStory}
            onBack={() => setReadingStory(null)}
            onListen={(s) => {
              setReadingStory(null);
              handleOpenAudio(s);
            }}
            onChatAboutStory={handleChatAboutStory}
            isFavorite={favoriteIds.includes(readingStory.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* Reprodutor de Áudio Encantado (Modal & Dock) */}
        <EnchantedAudioPlayer
          story={audioStory}
          isOpen={isAudioOpen}
          onClose={() => setIsAudioOpen(false)}
          onOpenStoryText={(s) => {
            setIsAudioOpen(false);
            handleOpenReading(s);
          }}
        />

        {/* Conteúdo Principal por Aba */}
        <div>
          {/* Aba de Login Dedicada (Cliente & Admin) */}
          {activeTab === 'login' && (
            <LoginAreaView
              initialRole={loginInitialRole}
              onAuthSuccess={handleAuthSuccess}
              onGoToHome={() => setActiveTab('home')}
              onOpenCheckout={() => setIsCheckoutOpen(true)}
            />
          )}

          {/* Aba Início */}
          {activeTab === 'home' && (
            isSubscriber ? (
              <SubscriberHome
                currentUser={currentUser}
                stories={stories}
                settings={settings}
                favoriteIds={favoriteIds}
                onOpenStoryText={handleOpenReading}
                onListenStory={handleOpenAudio}
                onToggleFavorite={handleToggleFavorite}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setActiveTab('library');
                }}
                onOpenChat={() => setActiveTab('chat')}
                onOpenLibrary={() => setActiveTab('library')}
              />
            ) : (
              <LandingPage
                settings={settings}
                stories={stories}
                onOpenCheckout={() => setIsCheckoutOpen(true)}
                onOpenLogin={handleOpenLogin}
                onPreviewListen={handlePreviewListen}
              />
            )
          )}

          {/* Aba Biblioteca de Contos (Acessível a Todos!) */}
          {activeTab === 'library' && (
            <StoryLibrary
              stories={stories}
              favoriteIds={favoriteIds}
              initialCategory={selectedCategory}
              onOpenStoryText={handleOpenReading}
              onListenStory={(story) => {
                if (isSubscriber) {
                  handleOpenAudio(story);
                } else {
                  handlePreviewListen(story);
                }
              }}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {/* Aba Favoritos */}
          {activeTab === 'favorites' && (
            isSubscriber ? (
              <FavoritesView
                stories={stories}
                favoriteIds={favoriteIds}
                onOpenStoryText={handleOpenReading}
                onListenStory={handleOpenAudio}
                onToggleFavorite={handleToggleFavorite}
                onExploreLibrary={() => setActiveTab('library')}
              />
            ) : (
              <div className="p-8 text-center rounded-3xl bg-[#24133A] border-2 border-dashed border-[#D4AF37]/50 text-[#FDF6E3] space-y-4 my-6">
                <span className="text-4xl block">✨</span>
                <h3 className="font-serif-royal text-lg font-bold">
                  {language === 'en' ? 'Sign In to Save Your Tales' : language === 'es' ? 'Inicia Sesión para Guardar Tus Cuentos' : 'Faça Login para Salvar Seus Contos'}
                </h3>
                <p className="text-xs text-white/70 max-w-xs mx-auto">
                  {language === 'en' ? 'Access your account to keep all your favorite stories in one place.' : language === 'es' ? 'Accede a tu cuenta para guardar tus historias favoritas.' : 'Acesse sua conta para guardar suas histórias favoritas em um só lugar.'}
                </p>
                <div className="flex gap-2 justify-center pt-2">
                  <button
                    onClick={() => handleOpenLogin('client')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-gold"
                  >
                    {t('auth', 'clientTab')}
                  </button>
                </div>
              </div>
            )
          )}

          {/* Aba Chat com Tia Claudia */}
          {activeTab === 'chat' && (
            currentUser ? (
              <div className="h-[76vh]">
                <EnchantedChatView
                  currentUser={currentUser}
                  initialTopic={chatInitialTopic}
                  onOpenSubscription={() => setActiveTab('subscription')}
                />
              </div>
            ) : (
              <div className="p-8 text-center rounded-3xl bg-[#24133A] border border-[#D4AF37]/50 text-[#FDF6E3] space-y-4 my-6">
                <span className="text-4xl block">👑</span>
                <h3 className="font-serif-royal text-lg font-bold">
                  {language === 'en' ? 'Direct Line with Aunt Claudia' : language === 'es' ? 'Línea Directa con Tía Claudia' : 'Linha Direta com a Tia Claudia'}
                </h3>
                <p className="text-xs text-white/70 max-w-xs mx-auto">
                  {language === 'en' ? 'To chat directly with the storyteller, please sign in.' : language === 'es' ? 'Para conversar con la autora, inicia sesión.' : 'Para conversar diretamente com a autora dos contos, faça login na sua conta.'}
                </p>
                <button
                  onClick={() => handleOpenLogin('client')}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#1A1A1A] font-bold text-xs"
                >
                  {language === 'en' ? 'Sign In to Chat' : language === 'es' ? 'Entrar al Chat' : 'Entrar no Chat do Clube'}
                </button>
              </div>
            )
          )}

          {/* Aba de Assinatura */}
          {activeTab === 'subscription' && (
            currentUser && isSubscriber ? (
              <MySubscriptionView
                currentUser={currentUser}
                settings={settings}
                onOpenCheckout={() => setIsCheckoutOpen(true)}
                onOpenChat={() => setActiveTab('chat')}
              />
            ) : (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#24133A] border-2 border-[#D4AF37] text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] flex items-center justify-center mx-auto text-3xl shadow-gold">
                    👑
                  </div>
                  <h2 className="font-serif-royal text-xl font-bold text-[#FDF6E3]">
                    {settings.planName}
                  </h2>
                  <div className="text-3xl font-extrabold text-[#D4AF37]">
                    {language === 'en' ? 'US$' : language === 'es' ? 'US$' : 'R$'} {settings.monthlyPrice.toFixed(2).replace('.', ',')} <span className="text-xs text-white/70">/{language === 'en' ? 'month' : language === 'es' ? 'mes' : 'mês'}</span>
                  </div>
                  <p className="text-xs text-white/70 max-w-xs mx-auto">
                    {t('landing', 'cancelAnytime')}
                  </p>
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-sm shadow-gold active:scale-95 transition"
                  >
                    {t('landing', 'subscribeBtn')}
                  </button>
                </div>
              </div>
            )
          )}

          {/* Aba de Perfil */}
          {activeTab === 'profile' && (
            currentUser ? (
              <ProfileView
                currentUser={currentUser}
                settings={settings}
                onLogout={() => {
                  setCurrentUser(null);
                  setActiveTab('home');
                }}
                onOpenAdmin={() => setActiveTab('admin')}
              />
            ) : (
              <LoginAreaView
                initialRole={loginInitialRole}
                onAuthSuccess={handleAuthSuccess}
                onGoToHome={() => setActiveTab('home')}
                onOpenCheckout={() => setIsCheckoutOpen(true)}
              />
            )
          )}

          {/* Aba Administrativa (Exclusiva da Claudia) */}
          {activeTab === 'admin' && (
            isAdmin ? (
              <div className="space-y-4">
                {/* Admin Subnav */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#24133A] border border-white/10 overflow-x-auto no-scrollbar text-xs">
                  <button
                    onClick={() => setAdminSubTab('dashboard')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                      adminSubTab === 'dashboard' ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Visão Geral
                  </button>
                  <button
                    onClick={() => setAdminSubTab('stories')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                      adminSubTab === 'stories' ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Histórias & Áudios
                  </button>
                  <button
                    onClick={() => setAdminSubTab('settings')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                      adminSubTab === 'settings' ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Configurar Preço
                  </button>
                  <button
                    onClick={() => setAdminSubTab('users')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                      adminSubTab === 'users' ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Assinantes
                  </button>
                </div>

                {adminSubTab === 'dashboard' && (
                  <AdminDashboard
                    settings={settings}
                    onNavigateTab={(tab) => setAdminSubTab(tab as any)}
                    onOpenCreateStory={() => setAdminSubTab('stories')}
                  />
                )}

                {adminSubTab === 'stories' && (
                  <AdminStoriesManager
                    stories={stories}
                    onRefresh={refreshStories}
                  />
                )}

                {adminSubTab === 'settings' && (
                  <AdminSettingsManager
                    settings={settings}
                    onUpdate={(newSettings) => setSettings(newSettings)}
                  />
                )}

                {adminSubTab === 'users' && (
                  <AdminUsersManager />
                )}
              </div>
            ) : (
              <LoginAreaView
                initialRole="admin"
                onAuthSuccess={handleAuthSuccess}
                onGoToHome={() => setActiveTab('home')}
                onOpenCheckout={() => setIsCheckoutOpen(true)}
              />
            )
          )}
        </div>

        {/* Barra de Navegação Inferior (Fixa Estilo App) */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setSelectedCategory(null);
            setActiveTab(tab);
          }}
          currentUser={currentUser}
          unreadChatCount={0}
        />
      </AppShell>

      {/* Modal de Checkout InfinitePay */}
      <InfinitePayCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        settings={settings}
        currentUser={currentUser}
        onSuccess={(updatedUser) => {
          setCurrentUser(updatedUser);
        }}
        onOpenAuth={() => {
          setIsCheckoutOpen(false);
          handleOpenLogin('client');
        }}
      />

      {/* Modal de Autenticação */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}
