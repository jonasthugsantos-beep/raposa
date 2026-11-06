import React, { useState } from 'react';
import { Story, StoryCategory } from '../../types';
import { INITIAL_CATEGORIES } from '../../data/initialData';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Search, 
  Headphones, 
  BookOpen, 
  Heart, 
  Clock, 
  Sparkles,
  Mic
} from 'lucide-react';

interface StoryLibraryProps {
  stories: Story[];
  favoriteIds: string[];
  initialCategory?: StoryCategory | null;
  onOpenStoryText: (story: Story) => void;
  onListenStory: (story: Story) => void;
  onToggleFavorite: (storyId: string) => void;
}

export const StoryLibrary: React.FC<StoryLibraryProps> = ({
  stories,
  favoriteIds,
  initialCategory = null,
  onOpenStoryText,
  onListenStory,
  onToggleFavorite,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');

  const filteredStories = stories.filter((story) => {
    const matchesSearch = 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div>
        <h1 className="font-serif-royal text-2xl font-bold text-[#FDF6E3]">
          {t('library', 'title')}
        </h1>
        <p className="text-xs text-white/70">
          {t('library', 'subtitle')}
        </p>
      </div>

      {/* Busca Rápida */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('library', 'searchPlaceholder')}
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#24133A] border border-[#D4AF37]/30 text-white placeholder-white/40 text-xs sm:text-sm outline-none focus:border-[#D4AF37] transition shadow-md"
        />
      </div>

      {/* Filtro de Categorias (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition active:scale-95 ${
            selectedCategory === 'all'
              ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-gold'
              : 'bg-[#24133A] border border-white/10 text-white/70 hover:text-white'
          }`}
        >
          ✨ {t('library', 'allCategories')}
        </button>

        {INITIAL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition active:scale-95 flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-gold'
                : 'bg-[#24133A] border border-white/10 text-white/70 hover:text-white'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Grid de Histórias */}
      {filteredStories.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#24133A] border border-white/10 text-white/60">
          <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-2 opacity-50" />
          <h3 className="font-serif-royal text-sm font-bold text-white mb-1">
            {t('library', 'noStoriesFound')}
          </h3>
          <p className="text-xs">{t('library', 'tryAnotherSearch')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredStories.map((story) => {
            const isFav = favoriteIds.includes(story.id);
            const hasRecordedAudio = Boolean(story.audioUrl && story.audioUrl.trim().length > 5);

            return (
              <div
                key={story.id}
                className="rounded-3xl bg-[#24133A] border border-[#D4AF37]/30 overflow-hidden shadow-lg flex flex-col justify-between hover:border-[#D4AF37] transition group"
              >
                {/* Imagem de Capa */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={story.coverUrl}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#24133A] via-transparent to-black/30" />

                  {/* Categoria Badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/50 text-[#F9E79F] font-bold text-[10px] uppercase tracking-wider">
                    {story.category.replace(/-/g, ' ')}
                  </span>

                  {/* Badge de Voz Oficial Gravada */}
                  {hasRecordedAudio && (
                    <span className="absolute top-3 left-28 px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#1A1A1A] font-extrabold text-[9px] uppercase tracking-wider shadow-md flex items-center gap-1">
                      <Mic className="w-2.5 h-2.5" />
                      <span>{t('common', 'officialVoice')}</span>
                    </span>
                  )}

                  {/* Botão de Favoritar */}
                  <button
                    onClick={() => onToggleFavorite(story.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-rose-400 active:scale-90 transition"
                  >
                    <Heart
                      className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-white'}`}
                    />
                  </button>

                  <div className="absolute bottom-2 left-3 right-3 flex items-center gap-3 text-[11px] text-[#F9E79F] font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {story.readingTimeMinutes} {t('common', 'minRead')}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Headphones className="w-3.5 h-3.5 text-rose-400" />
                      {Math.round(story.audioDurationSec / 60)} {t('common', 'minAudio')}
                    </span>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif-royal text-base font-bold text-[#FDF6E3] leading-snug">
                      {story.title}
                    </h3>
                    <p className="text-xs text-white/70 line-clamp-2 mt-1.5 leading-relaxed">
                      {story.description}
                    </p>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
                    <button
                      onClick={() => onListenStory(story)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-gold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5"
                    >
                      {hasRecordedAudio ? <Mic className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
                      <span>{hasRecordedAudio ? t('common', 'listenAudio') : t('common', 'listenAudio')}</span>
                    </button>

                    <button
                      onClick={() => onOpenStoryText(story)}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs hover:bg-white/20 active:scale-95 transition flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{t('common', 'readText')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
