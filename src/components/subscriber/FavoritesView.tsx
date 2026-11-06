import React from 'react';
import { Story } from '../../types';
import { Heart, Headphones, BookOpen, Clock, Sparkles } from 'lucide-react';

interface FavoritesViewProps {
  stories: Story[];
  favoriteIds: string[];
  onOpenStoryText: (story: Story) => void;
  onListenStory: (story: Story) => void;
  onToggleFavorite: (storyId: string) => void;
  onExploreLibrary: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  stories,
  favoriteIds,
  onOpenStoryText,
  onListenStory,
  onToggleFavorite,
  onExploreLibrary,
}) => {
  const favoriteStories = stories.filter(s => favoriteIds.includes(s.id));

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
          <Heart className="w-4 h-4 fill-current" />
          <span>Seu Tesouro Particular</span>
        </div>
        <h1 className="font-serif-royal text-2xl font-bold text-[#FDF6E3]">
          Histórias Favoritas
        </h1>
        <p className="text-xs text-white/70">
          Contos que você guardou no coração para ouvir e ler sempre que quiser.
        </p>
      </div>

      {favoriteStories.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#24133A] border-2 border-dashed border-white/20 text-white/60">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-3 text-2xl">
            💖
          </div>
          <h3 className="font-serif-royal text-base font-bold text-[#FDF6E3] mb-1">
            Nenhuma história favoritada ainda
          </h3>
          <p className="text-xs max-w-xs mx-auto mb-5">
            Ao ler ou ouvir qualquer história, toque no ícone de coração para salvá-la aqui.
          </p>
          <button
            onClick={onExploreLibrary}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-gold hover:brightness-110 active:scale-95 transition inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explorar Histórias Encantadas</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favoriteStories.map((story) => (
            <div
              key={story.id}
              className="rounded-3xl bg-[#24133A] border border-[#D4AF37]/40 overflow-hidden shadow-lg flex flex-col justify-between"
            >
              <div className="relative h-40 w-full">
                <img
                  src={story.coverUrl}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => onToggleFavorite(story.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-rose-500 hover:scale-110 active:scale-90 transition"
                  title="Remover dos favoritos"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase">
                    {story.category.replace(/-/g, ' ')}
                  </span>
                  <h3 className="font-serif-royal text-sm font-bold text-[#FDF6E3] mt-0.5">
                    {story.title}
                  </h3>
                  <p className="text-xs text-white/70 line-clamp-2 mt-1">
                    {story.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={() => onListenStory(story)}
                    className="flex-1 py-2 rounded-xl bg-[#D4AF37] text-[#1A1A1A] font-bold text-xs shadow-md flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Ouvir</span>
                  </button>
                  <button
                    onClick={() => onOpenStoryText(story)}
                    className="flex-1 py-2 rounded-xl border border-white/20 text-white font-bold text-xs hover:bg-white/10 flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ler</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
