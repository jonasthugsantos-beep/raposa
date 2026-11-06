import React, { useState, useEffect } from 'react';
import { Story, StoryCategory } from '../../types';
import { saveStory, deleteStory } from '../../lib/firebase';
import { uploadToStorage } from '../../lib/blobStorage';
import { INITIAL_CATEGORIES } from '../../data/initialData';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Music, 
  Image as ImageIcon, 
  X, 
  Check, 
  Sparkles, 
  Clock, 
  Headphones,
  Eye,
  Loader2,
  FileText
} from 'lucide-react';

interface AdminStoriesManagerProps {
  stories: Story[];
  onRefresh: () => void;
  openCreateImmediately?: boolean;
}

export const AdminStoriesManager: React.FC<AdminStoriesManagerProps> = ({
  stories,
  onRefresh,
  openCreateImmediately = false,
}) => {
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(openCreateImmediately);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<StoryCategory>('floresta-encantada');
  const [tagsInput, setTagsInput] = useState('');
  const [readingTime, setReadingTime] = useState(5);
  const [audioDurationSec, setAudioDurationSec] = useState(300);
  const [coverUrl, setCoverUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const startCreate = () => {
    setTitle('');
    setDescription('');
    setCategory('floresta-encantada');
    setTagsInput('Raposinha, Conto de Fadas, Magia');
    setReadingTime(5);
    setAudioDurationSec(360);
    setCoverUrl('https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=800&q=80');
    setAudioUrl('');
    setContentHtml(`Era uma vez, no recanto mais silencioso da Floresta das Raposinhas, onde a magia brotava das flores e o luar acariciava as copas douradas das árvores...`);
    setIsFeatured(false);
    setEditingStory(null);
    setIsCreatingNew(true);
  };

  const startEdit = (story: Story) => {
    setTitle(story.title);
    setDescription(story.description);
    setCategory(story.category);
    setTagsInput(story.tags.join(', '));
    setReadingTime(story.readingTimeMinutes);
    setAudioDurationSec(story.audioDurationSec);
    setCoverUrl(story.coverUrl);
    setAudioUrl(story.audioUrl || '');
    setContentHtml(story.contentHtml);
    setIsFeatured(Boolean(story.isFeatured));
    setEditingStory(story);
    setIsCreatingNew(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setFormError(null);
    try {
      const result = await uploadToStorage(file, 'covers');
      setCoverUrl(result.url);
    } catch (err) {
      console.error('Erro no upload da capa:', err);
      setFormError('Falha ao enviar imagem da capa. Tente novamente.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    setFormError(null);
    try {
      const result = await uploadToStorage(file, 'audio');
      setAudioUrl(result.url);
      setAudioDurationSec(Math.max(180, Math.round(file.size / 24000)));
    } catch (err) {
      console.error('Erro no upload do áudio:', err);
      setFormError('Falha ao enviar arquivo de áudio. Tente novamente.');
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    setFormError(null);
    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const id = editingStory ? editingStory.id : 'story-' + Math.random().toString(36).substring(2, 9);
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Formata texto caso o usuário tenha escrito parágrafos normais sem tags HTML
      let formattedHtml = contentHtml.trim();
      if (!formattedHtml.includes('<p') && !formattedHtml.includes('<div')) {
        formattedHtml = formattedHtml
          .split('\n\n')
          .map(p => p.trim())
          .filter(Boolean)
          .map(p => `<p class="leading-relaxed mb-4">${p.replace(/\n/g, '<br/>')}</p>`)
          .join('\n');
      }

      const newStory: Story = {
        id,
        title: title.trim(),
        slug,
        description: description.trim(),
        category,
        tags,
        readingTimeMinutes: Number(readingTime) || 5,
        audioDurationSec: Number(audioDurationSec) || 300,
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=800&q=80',
        audioUrl: audioUrl.trim(),
        contentHtml: formattedHtml,
        isPublished: true,
        isFeatured,
        views: editingStory ? editingStory.views : 0,
        listens: editingStory ? editingStory.listens : 0,
        createdAt: editingStory ? editingStory.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveStory(newStory);
      setIsCreatingNew(false);
      setEditingStory(null);
      setToastMessage(
        editingStory 
          ? `✨ História "${newStory.title}" atualizada com sucesso no banco de dados e aplicativo!`
          : `🎉 Nova história "${newStory.title}" adicionada com sucesso no banco de dados e aplicativo!`
      );
      onRefresh();
    } catch (err) {
      console.error('Erro ao salvar história:', err);
      setFormError('Ocorreu um erro ao salvar a história.');
    } finally {
      setIsSaving(false);
    }
  };

  const [storyToDelete, setStoryToDelete] = useState<{ id: string; title: string } | null>(null);

  const confirmDelete = async () => {
    if (!storyToDelete) return;
    setIsSaving(true);
    try {
      await deleteStory(storyToDelete.id);
      const deletedTitle = storyToDelete.title;
      setStoryToDelete(null);
      setToastMessage(`🗑️ História "${deletedTitle}" excluída permanentemente de tudo (banco de dados e aplicativo)!`);
      onRefresh();
    } catch (err) {
      console.error('Erro ao deletar história:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-gold flex items-center justify-between animate-slide-down">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif-royal text-xl font-bold text-[#FDF6E3] flex items-center gap-2">
            <span>Gerenciador de Histórias</span>
            <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F9E79F] text-xs font-mono">
              {stories.length} no banco
            </span>
          </h2>
          <p className="text-xs text-white/70">
            Adicione, edite ou remova histórias com persistência direta e em tempo real.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-xs shadow-gold hover:brightness-110 active:scale-95 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Conto</span>
        </button>
      </div>

      {/* Lista de Histórias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stories.map((story) => (
          <div
            key={story.id}
            className="p-4 rounded-2xl bg-[#24133A] border border-[#D4AF37]/30 shadow-md flex gap-4 relative group"
          >
            <div className="relative w-20 h-24 rounded-xl overflow-hidden shrink-0 border border-white/20">
              <img
                src={story.coverUrl}
                alt={story.title}
                className="w-full h-full object-cover"
              />
              {story.isFeatured && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#D4AF37] text-[#1A1A1A] text-[9px] font-bold">
                  Destaque
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#D4AF37] font-semibold uppercase">
                  <span>{story.category.replace(/-/g, ' ')}</span>
                </div>
                <h3 className="font-serif-royal text-sm font-bold text-[#FDF6E3] truncate mt-0.5">
                  {story.title}
                </h3>
                <p className="text-[11px] text-white/60 line-clamp-2 mt-1">
                  {story.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
                <div className="flex items-center gap-3 text-[10px] text-white/70">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#D4AF37]" />
                    {story.readingTimeMinutes}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Headphones className="w-3 h-3 text-rose-400" />
                    {Math.round(story.audioDurationSec / 60)}m
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(story)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
                    title="Editar história"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setStoryToDelete({ id: story.id, title: story.title })}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                    title="Excluir história"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Painel de Criação e Edição */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-[#24133A] border-2 border-[#D4AF37] shadow-2xl text-[#FDF6E3] p-6 max-h-[90vh] overflow-y-auto no-scrollbar relative my-auto">
            <button
              onClick={() => setIsCreatingNew(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-2xl shadow-md">
                ✍️
              </div>
              <div>
                <h3 className="font-serif-royal text-xl font-bold text-[#FDF6E3]">
                  {editingStory ? 'Editar Conto Encantado' : 'Escrever Nova História Mágica'}
                </h3>
                <p className="text-xs text-white/70">
                  Preencha o texto e anexe o arquivo de áudio e imagem de capa.
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
                  {formError}
                </div>
              )}

              {/* Título */}
              <div>
                <label className="block text-white/75 font-semibold mb-1">Título da História</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: A Chave Dourada da Princesa Aurora"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#190C29] border border-white/15 text-white outline-none focus:border-[#D4AF37] text-sm font-serif-royal"
                />
              </div>

              {/* Descrição Curta */}
              <div>
                <label className="block text-white/75 font-semibold mb-1">Sinopse Breve (Resumo)</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Um pequeno resumo mágico para a capa..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#190C29] border border-white/15 text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Categoria e Destaque */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/75 font-semibold mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as StoryCategory)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#190C29] border border-white/15 text-white outline-none focus:border-[#D4AF37]"
                  >
                    {INITIAL_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/75 font-semibold mb-1">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Raposinha, Castelo, Amizade"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#190C29] border border-white/15 text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Tempos de Leitura e Áudio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/75 font-semibold mb-1">Tempo de Leitura (minutos)</label>
                  <input
                    type="number"
                    min={1}
                    value={readingTime}
                    onChange={(e) => setReadingTime(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#190C29] border border-white/15 text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-white/75 font-semibold mb-1">Duração do Áudio (segundos)</label>
                  <input
                    type="number"
                    min={30}
                    value={audioDurationSec}
                    onChange={(e) => setAudioDurationSec(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#190C29] border border-white/15 text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Upload de Capa */}
              <div className="p-4 rounded-2xl bg-[#190C29] border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-white/80 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                    <span>Imagem da Capa (Vercel Blob / Upload)</span>
                  </label>
                  {isUploadingCover && (
                    <span className="text-[11px] text-[#D4AF37] flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Enviando...</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {coverUrl && (
                    <img
                      src={coverUrl}
                      alt="Preview Capa"
                      className="w-16 h-20 rounded-xl object-cover border border-[#D4AF37]/50 shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="text-xs text-white/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37] file:text-[#1A1A1A] hover:file:brightness-110 cursor-pointer"
                    />
                    <input
                      type="url"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="Ou cole a URL direta da imagem..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#24133A] border border-white/10 text-white text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Upload de Áudio Narração */}
              <div className="p-4 rounded-2xl bg-[#190C29] border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-white/80 flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-rose-400" />
                    <span>Arquivo de Áudio Completo (MP3 / WAV via Vercel Blob)</span>
                  </label>
                  {isUploadingAudio && (
                    <span className="text-[11px] text-rose-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Processando Áudio...</span>
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="text-xs text-white/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gradient-to-r file:from-rose-500 file:to-pink-600 file:text-white hover:file:brightness-110 cursor-pointer"
                  />
                  <input
                    type="url"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="Ou cole a URL direta do arquivo de áudio (se vazio, usa sintetizador encantado)"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#24133A] border border-white/10 text-white text-xs outline-none"
                  />
                  <p className="text-[11px] text-[#D4AF37]">
                    ✨ Se você deixar o campo de áudio vazio, o aplicativo utilizará automaticamente a Trilha Encantada de Harpa & Flauta Medieval em tempo real!
                  </p>
                </div>
              </div>

              {/* Editor de Texto do Conto (HTML/Markdown) */}
              <div>
                <label className="block text-white/75 font-semibold mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Texto Completo do Conto (Parágrafos e Diálogos)</span>
                </label>
                <textarea
                  rows={8}
                  required
                  value={contentHtml}
                  onChange={(e) => setContentHtml(e.target.value)}
                  placeholder="<p>Era uma vez...</p>"
                  className="w-full p-4 rounded-xl bg-[#190C29] border border-white/15 text-white font-mono text-xs outline-none focus:border-[#D4AF37] leading-relaxed"
                />
                <span className="text-[10px] text-white/50 block mt-1">
                  Dica: use tags simples como &lt;p class="leading-relaxed mb-4"&gt; para parágrafos perfeitos.
                </span>
              </div>

              {/* Destaque na Home */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#D4AF37] rounded"
                />
                <span className="text-white/80 font-medium">Exibir como Destaque Real na Tela Inicial</span>
              </label>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 font-bold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#1A1A1A] font-bold text-sm shadow-gold hover:brightness-110 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando no Reino...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingStory ? 'Salvar Alterações' : 'Publicar História'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {storyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#24133A] border-2 border-rose-500/50 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif-royal text-base font-bold text-[#FDF6E3]">
              Apagar Conto do Reino?
            </h3>
            <p className="text-xs text-white/70">
              Tem certeza que deseja apagar permanentemente o conto "{storyToDelete.title}"?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStoryToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-xs font-bold text-white hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 shadow-md"
              >
                Sim, Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
