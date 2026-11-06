import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { getAllUsers, updateUserSubscriptionStatus } from '../../lib/firebase';
import { 
  Users, 
  Crown, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  PlusCircle, 
  Shield, 
  Search,
  Sparkles,
  Loader2
} from 'lucide-react';

export const AdminUsersManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const list = await getAllUsers();
      setUsers(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await updateUserSubscriptionStatus(uid, newStatus, 30);
    fetchUsers();
  };

  const handleExtend30Days = async (uid: string) => {
    await updateUserSubscriptionStatus(uid, 'active', 30);
    fetchUsers();
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-royal text-xl font-bold text-[#FDF6E3]">
            Gerenciador de Usuários e Assinantes
          </h2>
          <p className="text-xs text-white/70">
            Controle de acesso, ativação manual de assinaturas e acompanhamento de vencimentos.
          </p>
        </div>

        {/* Busca */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#24133A] border border-white/10 text-white placeholder-white/40 text-xs outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-white/60 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
            <span>Consultando livros de registros reais...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-white/50 text-xs rounded-2xl bg-[#24133A] border border-white/5">
            Nenhum usuário encontrado.
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isActive = user.subscriptionStatus === 'active';
            const isAdmin = user.role === 'admin';

            return (
              <div
                key={user.uid}
                className="p-4 rounded-2xl bg-[#24133A] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#D4AF37]/40 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#190C29] border border-white/15 flex items-center justify-center text-xl shrink-0">
                    {isAdmin ? '👑' : '🦊'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#FDF6E3] truncate">
                        {user.name}
                      </h4>
                      {isAdmin && (
                        <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[9px] font-bold text-[#F9E79F]">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 truncate">{user.email}</p>

                    <div className="flex items-center gap-3 text-[10px] text-white/50 mt-1">
                      <span>Status: <strong className={isActive ? 'text-emerald-400' : 'text-rose-400'}>{isActive ? 'Ativo' : 'Inativo'}</strong></span>
                      {user.subscriptionEnd && (
                        <span>• Vence em: {new Date(user.subscriptionEnd).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleExtend30Days(user.uid)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-sm hover:brightness-110 active:scale-95 transition flex items-center gap-1"
                    title="Adicionar mais 30 dias de acesso"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+30 Dias</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(user.uid, user.subscriptionStatus)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                      isActive
                        ? 'border-rose-500/40 text-rose-300 hover:bg-rose-500/10'
                        : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'
                    }`}
                  >
                    {isActive ? 'Suspender' : 'Ativar'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
