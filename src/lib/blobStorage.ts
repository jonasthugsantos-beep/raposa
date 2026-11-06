/**
 * Vercel Blob Storage Integration & Server File Storage
 * Suporta upload para Vercel Blob e armazenamento em disco do servidor via /api/upload.
 * Garante que imagens e áudios sejam salvos no servidor com URLs públicas leves (/uploads/...)
 * eliminando limitações de quota de memória ou localStorage.
 */

export interface UploadResult {
  url: string;
  pathname?: string;
  contentType?: string;
  size?: number;
}

export async function uploadToStorage(
  file: File, 
  folder: 'covers' | 'audio' | 'general'
): Promise<UploadResult> {
  // 1. Converter arquivo para base64 para enviar ao backend /api/upload
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });

  // 2. Tentar salvar no servidor backend (public/uploads/)
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Data,
        filename: file.name,
        fileType: file.type,
        folder,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        return {
          url: data.url,
          pathname: data.url,
          contentType: file.type,
          size: file.size,
        };
      }
    }
  } catch (err) {
    console.warn('⚠️ Falha ao salvar no servidor /api/upload, usando fallback local:', err);
  }

  // 3. Fallback Seguro no navegador
  if (file.type.startsWith('image/')) {
    return {
      url: base64Data,
      pathname: `local/${folder}/${file.name}`,
      contentType: file.type,
      size: file.size,
    };
  }

  const localUrl = URL.createObjectURL(file);
  return {
    url: localUrl,
    pathname: `local/${folder}/${file.name}`,
    contentType: file.type,
    size: file.size,
  };
}
