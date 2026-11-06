import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../../types';
import { 
  subscribeToChatMessages, 
  sendChatMessage 
} from '../../lib/firebase';
import { 
  Send, 
  Crown, 
  Sparkles, 
  Volume2, 
  Play, 
  Pause, 
  Clock, 
  Smile, 
  Heart,
  ShieldCheck
} from 'lucide-react';

interface EnchantedChatViewProps {
  currentUser: User;
  initialTopic?: string;
  onOpenSubscription: () => void;
}

export const EnchantedChatView: React.FC<EnchantedChatViewProps> = ({
  currentUser,
  initialTopic,
  onOpenSubscription,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState(initialTopic || '');
  const [isPlayingVoiceNote, setIsPlayingVoiceNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToChatMessages(currentUser.uid, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [currentUser.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    setInputText('');
    await sendChatMessage(currentUser, 'admin-claudia-uid', text);

    // Resposta carinhosa simulada da Claudia após 1.5s se for a primeira mensagem ou sugestão
    setTimeout(async () => {
      const claudiaAdminUser: User = {
        uid: 'admin-claudia-uid',
        email: 'claudia@x.com',
        name: 'Claudia (Tia das Histórias)',
        role: 'admin',
        subscriptionStatus: 'active',
        createdAt: '2026-01-01T00:00:00Z',
      };

      const replies = [
        'Olá, querida raposinha! Fico com o coração transbordando de alegria em ler sua mensagem! ✨ Já estou no estúdio gravando um conto novinho para você!',
        'Que linda mensagem! Agradeço demais o carinho. As princesas e os passarinhos do reino mandam um abraço bem quentinho!',
        'Ah, que maravilha! Se você tiver qualquer pedido especial de personagem, me conte que eu coloco no próximo conto! 🦊👑',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      await sendChatMessage(claudiaAdminUser, currentUser.uid, randomReply);
    }, 1800);
  };

  const quickPrompts = [
    'Adorei a história da raposinha! 🦊',
    'Qual será o próximo conto? ✨',
    'Tem dica de história para dormir hoje? 🌙',
    'Minha irmãzinha amou a Princesa Celeste! 👑',
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#1C0D2E] via-[#24133A] to-[#12081E] text-[#FDF6E3]">
      {/* Header com a Tia Claudia */}
      <div className="p-4 bg-[#180E25] border-b border-[#D4AF37]/30 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-2xl border-2 border-[#D4AF37] shadow-gold">
              👑
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#180E25]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif-royal text-sm font-bold text-[#FDF6E3]">
                Claudia (Tia das Histórias)
              </h3>
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <p className="text-[11px] text-[#D4AF37] flex items-center gap-1">
              <span>●</span>
              <span>Online no Castelo das Histórias</span>
            </p>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[10px] font-bold text-[#F9E79F]">
          Chat Real Oficial
        </div>
      </div>

      {/* Áudio Voice Note de Boas-Vindas da Claudia */}
      <div className="p-3 bg-[#D4AF37]/10 border-b border-[#D4AF37]/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#F9E79F]">
          <Volume2 className="w-4 h-4 text-[#D4AF37]" />
          <span className="font-medium">Mensagem de voz de boas-vindas da Claudia</span>
        </div>
        <button
          onClick={() => setIsPlayingVoiceNote(!isPlayingVoiceNote)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D4AF37] text-[#1A1A1A] font-bold text-[11px] hover:brightness-110 active:scale-95 transition"
        >
          {isPlayingVoiceNote ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          <span>{isPlayingVoiceNote ? 'Pausar' : 'Ouvir (0:24)'}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {/* Enchanted Welcome Card */}
        <div className="p-4 rounded-2xl bg-[#2F1C4A]/60 border border-[#D4AF37]/30 text-center max-w-xs mx-auto">
          <Sparkles className="w-6 h-6 text-[#D4AF37] mx-auto mb-1.5" />
          <h4 className="font-serif-royal text-xs font-bold text-[#F9E79F]">
            Linha Direta Encantada
          </h4>
          <p className="text-[11px] text-white/70 mt-1">
            Fale diretamente com a autora Claudia, envie sugestões de contos, tire dúvidas ou deixe um recadinho carinhoso!
          </p>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.uid;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#AA7C11] text-xs flex items-center justify-center shrink-0 border border-white/30">
                  👑
                </div>
              )}

              <div
                className={`max-w-[78%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isMe
                    ? 'bg-gradient-to-tr from-[#6B4C9A] to-[#4A2C6A] text-[#FDF6E3] rounded-br-none border border-[#F8C8DC]/30 shadow-md'
                    : 'bg-[#FDF6E3] text-[#1A1A1A] rounded-bl-none border border-[#D4AF37] shadow-lg font-reading'
                }`}
              >
                {!isMe && (
                  <span className="block text-[10px] font-bold text-[#8B6508] mb-1 font-sans">
                    {msg.senderName}
                  </span>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div className={`text-[9px] mt-1.5 text-right ${isMe ? 'text-white/60' : 'text-stone-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {isMe && (
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-xs flex items-center justify-center shrink-0">
                  🦊
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-white/5">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37]/60 text-[11px] text-[#F9E79F] whitespace-nowrap active:scale-95 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[#180E25] border-t border-white/10 safe-bottom">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escreva sua cartinha mágica para Tia Claudia..."
            className="flex-1 px-4 py-3 rounded-2xl bg-[#26153B] border border-white/15 text-white placeholder-white/30 text-xs sm:text-sm outline-none focus:border-[#D4AF37] transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] flex items-center justify-center shadow-gold disabled:opacity-40 disabled:pointer-events-none hover:brightness-110 active:scale-95 transition shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
