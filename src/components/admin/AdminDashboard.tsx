import React, { useState, useEffect } from 'react';
import { Story, User, AppSettings } from '../../types';
import { getAllUsers, getStories, seedNewFirebaseProject, isRealFirebaseConfigured } from '../../lib/firebase';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  Headphones, 
  Sparkles, 
  Crown, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Loader2
} from 'lucide-react';

interface AdminDashboardProps {
  settings: AppSettings;
  onNavigateTab: (tab: 'stories' | 'users' | 'settings' | 'chats') => void;
  onOpenCreateStory: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  onNavigateTab,
  onOpenCreateStory,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    getAllUsers().then(setUsers);
    getStories().then(setStories);
  }, []);

  const activeSubscribers = users.filter(u => u.subscriptionStatus === 'active');
  const totalRevenue = activeSubscribers.length * settings.monthlyPrice;
  const totalViews = stories.reduce((acc, s) => acc + (s.views || 0), 0);
  const totalListens = stories.reduce((acc, s) => acc + (s.listens || 0), 0);

  const handleSeedFirebase = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedNewFirebaseProject();
      setSeedResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setSeedResult({ success: false, message: msg });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4A2C6A] via-[#3B2056] to-[#251538] border-2 border-[#D4AF37]/60 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
              <Crown className="w-4 h-4" />
              <span>Painel Real da Claudia</span>
            </div>
            <h2 className="font-serif-royal text-2xl font-bold text-[#FDF6E3]">
              Gestão do Clube das Raposinhas
            </h2>
            <p className="text-xs text-white/70 mt-1 max-w-md">
              Acompanhe seus assinantes, publique novas histórias com narração em áudio e defina o valor da mensalidade.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenCreateStory}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-gold hover:brightness-110 active:scale-95 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nova História</span>
            </button>

            <button
              onClick={() => onNavigateTab('settings')}
              className="px-4 py-2.5 rounded-xl border border-[#D4AF37] bg-[#D4AF37]/10 text-[#F9E79F] font-bold text-xs hover:bg-[#D4AF37]/20 active:scale-95 transition"
            >
              Configurar Preço
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Assinantes Ativos */}
        <div className="p-4 rounded-2xl bg-[#24133A] border border-[#D4AF37]/30 shadow-md">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-medium">Assinantes Ativos</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-[#FDF6E3]">
            {activeSubscribers.length}
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 block">
            {users.length} usuários cadastrados
          </span>
        </div>

        {/* Receita Mensal Recorrente */}
        <div className="p-4 rounded-2xl bg-[#24133A] border border-[#D4AF37]/30 shadow-md">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-medium">Receita Estimada (MRR)</span>
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F9E79F]">
            R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[10px] text-[#D4AF37] mt-1 block">
            Plano: R$ {settings.monthlyPrice.toFixed(2).replace('.', ',')} / mês
          </span>
        </div>

        {/* Histórias no Acervo */}
        <div className="p-4 rounded-2xl bg-[#24133A] border border-[#D4AF37]/30 shadow-md">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-medium">Contos Publicados</span>
            <BookOpen className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-[#FDF6E3]">
            {stories.length}
          </div>
          <span className="text-[10px] text-sky-400 mt-1 block">
            {totalViews} leituras totais
          </span>
        </div>

        {/* Áudios Ouvidos */}
        <div className="p-4 rounded-2xl bg-[#24133A] border border-[#D4AF37]/30 shadow-md">
          <div className="flex items-center justify-between text-white/60 mb-2">
            <span className="text-xs font-medium">Audições de Histórias</span>
            <Headphones className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-[#FDF6E3]">
            {totalListens}
          </div>
          <span className="text-[10px] text-rose-400 mt-1 block">
            Player com Harpa & Voz
          </span>
        </div>
      </div>

      {/* NOVO Projeto Firebase Status & 1-Click Seed Tool */}
      <div className="p-5 rounded-3xl bg-[#1C0D2E] border border-[#D4AF37]/40 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-xl shrink-0">
              <Database className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif-royal text-sm font-bold text-[#FDF6E3]">
                  Status do Banco Firebase (Projeto Isolado)
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isRealFirebaseConfigured 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {isRealFirebaseConfigured ? 'Conectado ao Firebase' : 'Armazenamento Local Ativo'}
                </span>
              </div>
              <p className="text-xs text-white/70 mt-1 max-w-lg">
                O aplicativo foi estruturado para usar um <strong>NOVO projeto Firebase exclusivo</strong>. Você pode popular todas as histórias e configurações no seu novo projeto em 1 clique abaixo.
              </p>
            </div>
          </div>

          <button
            onClick={handleSeedFirebase}
            disabled={isSeeding}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md active:scale-95 transition flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isSeeding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Populando Firebase...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#FFE082]" />
                <span>Popular NOVO Firebase (1-Click)</span>
              </>
            )}
          </button>
        </div>

        {seedResult && (
          <div className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
            seedResult.success 
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200' 
              : 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
          }`}>
            {seedResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{seedResult.message}</span>
          </div>
        )}
      </div>

      {/* Top Stories Performance */}
      <div className="p-5 rounded-3xl bg-[#24133A] border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif-royal text-base font-bold text-[#FDF6E3]">
            Histórias Mais Queridas Pelos Assinantes
          </h3>
          <button
            onClick={() => onNavigateTab('stories')}
            className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            <span>Ver Todas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {stories.slice(0, 4).map((story) => (
            <div
              key={story.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#190C29] border border-white/5 hover:border-[#D4AF37]/40 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={story.coverUrl}
                  alt={story.title}
                  className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-serif-royal text-xs font-bold text-[#FDF6E3] truncate">
                    {story.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-white/60 mt-0.5">
                    <span>{story.category.replace(/-/g, ' ')}</span>
                    <span>•</span>
                    <span>{story.readingTimeMinutes} min de leitura</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium shrink-0 ml-3">
                <span className="flex items-center gap-1 text-sky-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  {story.views}
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <Headphones className="w-3.5 h-3.5" />
                  {story.listens}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
