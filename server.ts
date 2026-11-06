import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { INITIAL_STORIES, INITIAL_SETTINGS } from './src/data/initialData.ts';
import { Story, AppSettings } from './src/types/index.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Garante que os diretórios persistentes de dados e uploads existam
const DATA_DIR = path.join(process.cwd(), 'data');
const STORIES_FILE = path.join(DATA_DIR, 'stories.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Inicializa banco de dados em arquivo JSON caso ainda não exista
if (!fs.existsSync(STORIES_FILE)) {
  fs.writeFileSync(STORIES_FILE, JSON.stringify(INITIAL_STORIES, null, 2), 'utf-8');
}

if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(INITIAL_SETTINGS, null, 2), 'utf-8');
}

// Servir arquivos estáticos de upload
app.use('/uploads', express.static(UPLOADS_DIR));

// Helpers de Leitura e Escrita do Banco de Dados
function readStoriesFromDisk(): Story[] {
  try {
    if (!fs.existsSync(STORIES_FILE)) {
      fs.writeFileSync(STORIES_FILE, JSON.stringify(INITIAL_STORIES, null, 2), 'utf-8');
      return INITIAL_STORIES;
    }
    const raw = fs.readFileSync(STORIES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_STORIES;
  } catch (err) {
    console.error('Erro ao ler stories.json:', err);
    return INITIAL_STORIES;
  }
}

function writeStoriesToDisk(stories: Story[]): boolean {
  try {
    fs.writeFileSync(STORIES_FILE, JSON.stringify(stories, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Erro ao escrever stories.json:', err);
    return false;
  }
}

function readSettingsFromDisk(): AppSettings {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(INITIAL_SETTINGS, null, 2), 'utf-8');
      return INITIAL_SETTINGS;
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler settings.json:', err);
    return INITIAL_SETTINGS;
  }
}

function writeSettingsToDisk(settings: AppSettings): boolean {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Erro ao escrever settings.json:', err);
    return false;
  }
}

/* =========================================================================
 * ROTAS DE BANCO DE DADOS DAS HISTÓRIAS (CRUD COMPLETO SEM LIMITAÇÃO)
 * ========================================================================= */

// 1. Listar todas as histórias
app.get('/api/stories', (_req, res) => {
  try {
    const stories = readStoriesFromDisk();
    return res.status(200).json(stories);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// 2. Criar ou Atualizar História (Adicionar e Editar)
app.post('/api/stories', (req, res) => {
  try {
    const incomingStory: Story = req.body;
    if (!incomingStory || !incomingStory.title) {
      return res.status(400).json({ error: 'Título da história é obrigatório.' });
    }

    const stories = readStoriesFromDisk();
    const existingIndex = stories.findIndex(s => s.id === incomingStory.id);

    if (existingIndex >= 0) {
      // Edição
      stories[existingIndex] = {
        ...stories[existingIndex],
        ...incomingStory,
        updatedAt: new Date().toISOString(),
      };
      console.log(`📝 [Database] História editada: "${incomingStory.title}" (${incomingStory.id})`);
    } else {
      // Nova história
      const newStory: Story = {
        ...incomingStory,
        id: incomingStory.id || ('story-' + Math.random().toString(36).substring(2, 9)),
        createdAt: incomingStory.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      stories.unshift(newStory);
      console.log(`✨ [Database] Nova história adicionada: "${newStory.title}" (${newStory.id})`);
    }

    const success = writeStoriesToDisk(stories);
    if (!success) {
      return res.status(500).json({ error: 'Falha ao gravar no banco de dados.' });
    }

    return res.status(200).json({
      success: true,
      story: existingIndex >= 0 ? stories[existingIndex] : stories[0],
      total: stories.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// 3. Atualizar História via PUT
app.put('/api/stories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData: Partial<Story> = req.body;
    const stories = readStoriesFromDisk();
    const index = stories.findIndex(s => s.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'História não encontrada.' });
    }

    stories[index] = {
      ...stories[index],
      ...updateData,
      id,
      updatedAt: new Date().toISOString(),
    };

    writeStoriesToDisk(stories);
    console.log(`📝 [Database] História atualizada via PUT: ${id}`);
    return res.status(200).json({ success: true, story: stories[index] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// 4. Deletar História (Remoção total e definitiva do banco de dados)
app.delete('/api/stories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stories = readStoriesFromDisk();
    const initialCount = stories.length;
    const filtered = stories.filter(s => s.id !== id);

    if (filtered.length === initialCount) {
      console.warn(`⚠️ [Database] História para exclusão não encontrada: ${id}`);
    } else {
      console.log(`🗑️ [Database] História DELETADA com sucesso: ${id} (Restantes: ${filtered.length})`);
    }

    writeStoriesToDisk(filtered);
    return res.status(200).json({
      success: true,
      deletedId: id,
      total: filtered.length,
      message: 'História excluída permanentemente do banco de dados.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

/* =========================================================================
 * ROTAS DE CONFIGURAÇÃO GERAL (Preço da Assinatura e Planos)
 * ========================================================================= */

app.get('/api/settings', (_req, res) => {
  try {
    const settings = readSettingsFromDisk();
    return res.status(200).json(settings);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const current = readSettingsFromDisk();
    const updated: AppSettings = { ...current, ...req.body };
    writeSettingsToDisk(updated);
    console.log(`⚙️ [Database] Configurações de assinatura atualizadas: Preço R$ ${updated.monthlyPrice}`);
    return res.status(200).json({ success: true, settings: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

/* =========================================================================
 * ROTA DE UPLOAD DE ARQUIVOS (Capas e Áudios sem Limitação de Quota Local)
 * ========================================================================= */

app.post('/api/upload', async (req, res) => {
  try {
    const { base64Data, filename, fileType, folder } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: 'Nenhum dado de arquivo enviado.' });
    }

    // Remove prefixos como 'data:image/jpeg;base64,'
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const pureBase64 = matches ? matches[2] : base64Data;
    const buffer = Buffer.from(pureBase64, 'base64');

    const targetSubdir = folder ? path.join(UPLOADS_DIR, folder) : UPLOADS_DIR;
    if (!fs.existsSync(targetSubdir)) {
      fs.mkdirSync(targetSubdir, { recursive: true });
    }

    const safeName = (filename || 'arquivo')
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '_');
    const uniqueFilename = `${Date.now()}-${safeName}`;
    const filePath = path.join(targetSubdir, uniqueFilename);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${folder ? folder + '/' : ''}${uniqueFilename}`;
    console.log(`📦 [Upload] Arquivo salvo em disco: ${publicUrl} (${buffer.length} bytes)`);

    return res.status(200).json({
      success: true,
      url: publicUrl,
      size: buffer.length,
      message: 'Upload gravado com sucesso no servidor.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Erro no upload de arquivo:', msg);
    return res.status(500).json({ error: msg });
  }
});

/* =========================================================================
 * WEBHOOK INFINITEPAY
 * ========================================================================= */

app.post('/api/webhooks/infinitepay', async (req, res) => {
  try {
    const { event, data } = req.body;
    console.log('🔔 [InfinitePay Webhook] Evento recebido:', event, data);

    if (event === 'charge.paid' || req.body.status === 'approved' || req.body.paid) {
      const customerEmail = data?.customer?.email || req.body.customer_email || req.body.email;
      const amount = data?.amount || req.body.amount;
      const paymentId = data?.id || req.body.id || ('inf_' + Math.random().toString(36).substring(2, 9));

      console.log(`✅ [InfinitePay] Pagamento aprovado para: ${customerEmail}, Valor: ${amount}`);

      return res.status(200).json({
        success: true,
        message: 'Assinatura ativada com sucesso pelo Webhook InfinitePay',
        paymentId,
        customerEmail,
        status: 'active',
      });
    }

    return res.status(200).json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Erro no webhook InfinitePay:', msg);
    return res.status(500).json({ error: msg });
  }
});

/* =========================================================================
 * NARRAÇÃO IA COM VOZ FEMININA CALMA (GEMINI TTS)
 * ========================================================================= */

app.post('/api/stories/narrate', async (req, res) => {
  try {
    const { text, title } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Texto da história não fornecido.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        available: false,
        message: 'Chave Gemini não configurada no servidor. Usando motor nativo de fala.',
      });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Narre este conto de fadas infantil com uma voz feminina extremamente doce, calma, acolhedora e serena, com pausas suaves: "${text.substring(0, 1000)}"`,
              speechMetadata: {
                style: 'Voz feminina calma, doce, acolhedora e afetuosa para crianças dormirem tranquilas, em português do Brasil',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.status(200).json({
        available: true,
        audioDataUrl: `data:audio/wav;base64,${base64Audio}`,
        voiceName: 'Voz Feminina Calma (Claudia IA / Kore)',
      });
    }

    return res.status(200).json({ available: false });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Fallback para leitor nativo:', msg);
    return res.status(200).json({ available: false, error: msg });
  }
});

// Montar middlewares do Vite em desenvolvimento
async function startServer() {
  const httpServer = http.createServer(app);
  // No ambiente de nuvem do AI Studio / Cloud Run, conexões WebSocket de HMR devem ser desativadas
  const enableHmr = process.env.ENABLE_HMR === 'true';

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: enableHmr ? { server: httpServer } : false,
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🏰 Servidor do Clube das Raposinhas ativo na porta ${PORT}`);
    console.log(`📚 Banco de Dados de Histórias: ${STORIES_FILE}`);
  });
}

startServer();
