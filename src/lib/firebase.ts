import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  Auth,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot as firestoreOnSnapshot,
  Firestore 
} from 'firebase/firestore';
import { User, Story, AppSettings, Subscription, ChatMessage } from '../types';
import { INITIAL_STORIES, INITIAL_SETTINGS } from '../data/initialData';

// Configuração lendo estritamente do NOVO projeto Firebase configurado via variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || import.meta.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Verifica se as chaves do Firebase real foram preenchidas no novo projeto
export const isRealFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes('MY_') &&
  !firebaseConfig.apiKey.includes('AIzaSyD_PLACEHOLDER') &&
  firebaseConfig.apiKey.length > 15 &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes('MY_')
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isRealFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✨ [Clube das Raposinhas] Conectado ao NOVO projeto Firebase:', firebaseConfig.projectId);
  } catch (error) {
    console.warn('⚠️ Falha ao inicializar SDK Firebase com as chaves fornecidas. Usando motor local seguro:', error);
  }
} else {
  console.info('🏰 [Clube das Raposinhas] Modo Local Seguro ativado. Conecte seu NOVO projeto Firebase no .env quando desejar persistência em nuvem.');
}

export { app, auth, db };

/* =========================================================================
 * MOTOR PERSISTENTE LOCAL (Armazenamento reativo para demonstração e dev)
 * Mantém os dados no localStorage com reatividade instantânea
 * ========================================================================= */

const STORAGE_KEYS = {
  CURRENT_USER: 'raposinhas_current_user',
  USERS: 'raposinhas_users_db',
  STORIES: 'raposinhas_stories_db',
  SETTINGS: 'raposinhas_settings_db',
  SUBSCRIPTIONS: 'raposinhas_subs_db',
  CHATS: 'raposinhas_chats_db',
  FAVORITES: 'raposinhas_favorites_db',
};

// Inicialização padrão do banco
const DEFAULT_USERS: Record<string, User> = {
  'admin-claudia-uid': {
    uid: 'admin-claudia-uid',
    email: 'claudia@x.com',
    name: 'Claudia (Administradora)',
    role: 'admin',
    subscriptionStatus: 'active',
    subscriptionStart: '2026-01-01T00:00:00Z',
    subscriptionEnd: '2030-12-31T23:59:59Z',
    avatarBadge: 'crown',
    createdAt: '2026-01-01T00:00:00Z',
  },
  'user-sofia-uid': {
    uid: 'user-sofia-uid',
    email: 'princesa.sofia@reino.com',
    name: 'Princesa Sofia',
    role: 'user',
    subscriptionStatus: 'active',
    subscriptionStart: new Date().toISOString(),
    subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    avatarBadge: 'fox',
    createdAt: '2026-10-01T00:00:00Z',
  },
};

const DEFAULT_CHATS: ChatMessage[] = [
  {
    id: 'msg-welcome-1',
    senderId: 'admin-claudia-uid',
    senderName: 'Claudia (Tia das Histórias)',
    senderRole: 'admin',
    recipientId: 'user-sofia-uid',
    text: 'Seja muito bem-vinda ao Clube das Raposinhas, querida! Já conferiu a história nova "A Raposinha e o Castelo de Ouro"? O áudio está encantador!',
    timestamp: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    read: true,
  },
  {
    id: 'msg-welcome-2',
    senderId: 'user-sofia-uid',
    senderName: 'Princesa Sofia',
    senderRole: 'user',
    recipientId: 'admin-claudia-uid',
    text: 'Oi Tia Claudia! Ouvi antes de dormir e amei o som da harpa. Minha irmãzinha dormiu feito um anjinho!',
    timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    read: true,
  },
  {
    id: 'msg-welcome-3',
    senderId: 'admin-claudia-uid',
    senderName: 'Claudia (Tia das Histórias)',
    senderRole: 'admin',
    recipientId: 'user-sofia-uid',
    text: 'Que alegria no coração saber disso! Qualquer história que você quiser pedir, é só me mandar aqui. Um beijo cheio de pó de pirlimpimpim! 🦊✨',
    timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
    read: true,
  },
];

// Carregar ou salvar dados padrão
function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('raposinhas_storage_change', { detail: { key } }));
  } catch (e) {
    console.error('Erro ao salvar no storage local:', e);
  }
}

// Inicializar banco local
export function initializeLocalDatabase(): void {
  getStoredItem(STORAGE_KEYS.USERS, DEFAULT_USERS);
  getStoredItem(STORAGE_KEYS.STORIES, INITIAL_STORIES);
  getStoredItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  getStoredItem(STORAGE_KEYS.CHATS, DEFAULT_CHATS);
}

// Inicializar imediatamente
initializeLocalDatabase();

/* =========================================================================
 * AUTENTICAÇÃO E PERFIL DE USUÁRIO
 * ========================================================================= */

export async function loginUser(email: string, pass: string): Promise<User> {
  const normalizedEmail = email.toLowerCase().trim();

  if (isRealFirebaseConfigured && auth && db) {
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
    const fbUser = userCredential.user;
    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
    
    if (userDoc.exists()) {
      return userDoc.data() as User;
    } else {
      // Cria perfil inicial caso não exista
      const newUser: User = {
        uid: fbUser.uid,
        email: normalizedEmail,
        name: fbUser.displayName || (normalizedEmail === 'claudia@x.com' ? 'Claudia (Admin)' : 'Assinante Real'),
        role: normalizedEmail === 'claudia@x.com' ? 'admin' : 'user',
        subscriptionStatus: normalizedEmail === 'claudia@x.com' ? 'active' : 'inactive',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', fbUser.uid), newUser);
      return newUser;
    }
  }

  // Fallback Local
  const users = getStoredItem<Record<string, User>>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  
  // Login padrão para Claudia
  if (normalizedEmail === 'claudia@x.com') {
    if (pass !== 'claudia4321') {
      throw new Error('Senha incorreta para a administradora Claudia.');
    }
    const admin = users['admin-claudia-uid'] || DEFAULT_USERS['admin-claudia-uid'];
    setStoredItem(STORAGE_KEYS.CURRENT_USER, admin);
    return admin;
  }

  // Procura por email existente
  let foundUser = Object.values(users).find(u => u.email.toLowerCase() === normalizedEmail);
  if (!foundUser) {
    // Se o usuário não existir na simulação local, cria automaticamente com assinatura ativa de teste
    const newUid = 'user-' + Math.random().toString(36).substring(2, 9);
    foundUser = {
      uid: newUid,
      email: normalizedEmail,
      name: normalizedEmail.split('@')[0],
      role: 'user',
      subscriptionStatus: 'active',
      subscriptionStart: new Date().toISOString(),
      subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      avatarBadge: 'fox',
      createdAt: new Date().toISOString(),
    };
    users[newUid] = foundUser;
    setStoredItem(STORAGE_KEYS.USERS, users);
  }

  setStoredItem(STORAGE_KEYS.CURRENT_USER, foundUser);
  return foundUser;
}

export async function signUpUser(name: string, email: string, pass: string): Promise<User> {
  const normalizedEmail = email.toLowerCase().trim();

  if (isRealFirebaseConfigured && auth && db) {
    const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
    const fbUser = userCredential.user;
    const role = normalizedEmail === 'claudia@x.com' ? 'admin' : 'user';
    const newUser: User = {
      uid: fbUser.uid,
      email: normalizedEmail,
      name: name.trim(),
      role,
      subscriptionStatus: role === 'admin' ? 'active' : 'inactive',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', fbUser.uid), newUser);
    return newUser;
  }

  // Fallback Local
  const users = getStoredItem<Record<string, User>>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const newUid = 'user-' + Math.random().toString(36).substring(2, 9);
  const role = normalizedEmail === 'claudia@x.com' ? 'admin' : 'user';

  const newUser: User = {
    uid: newUid,
    email: normalizedEmail,
    name: name.trim(),
    role,
    subscriptionStatus: role === 'admin' ? 'active' : 'inactive',
    avatarBadge: 'crown',
    createdAt: new Date().toISOString(),
  };

  users[newUid] = newUser;
  setStoredItem(STORAGE_KEYS.USERS, users);
  setStoredItem(STORAGE_KEYS.CURRENT_USER, newUser);
  return newUser;
}

export async function logoutUser(): Promise<void> {
  if (isRealFirebaseConfigured && auth) {
    await signOut(auth);
  }
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.dispatchEvent(new CustomEvent('raposinhas_storage_change', { detail: { key: STORAGE_KEYS.CURRENT_USER } }));
}

export function getCurrentUser(): User | null {
  return getStoredItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  if (isRealFirebaseConfigured && auth && db) {
    return firebaseOnAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db!, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setStoredItem(STORAGE_KEYS.CURRENT_USER, userData);
            callback(userData);
            return;
          }
        } catch (e) {
          console.error('Erro ao ler perfil do Firestore:', e);
        }
      }
      callback(getCurrentUser());
    });
  }

  // Listener local
  const handler = () => {
    callback(getCurrentUser());
  };
  window.addEventListener('raposinhas_storage_change', handler);
  callback(getCurrentUser());
  return () => window.removeEventListener('raposinhas_storage_change', handler);
}

/* =========================================================================
 * CONFIGURAÇÕES GERAIS (Settings)
 * ========================================================================= */

export async function getAppSettings(): Promise<AppSettings> {
  // 1. Tentar ler do Servidor Backend
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const serverSettings: AppSettings = await res.json();
      setStoredItem(STORAGE_KEYS.SETTINGS, serverSettings);
      return serverSettings;
    }
  } catch {
    // continua para Firestore ou local
  }

  if (isRealFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'appSettings'));
      if (snap.exists()) {
        const remoteSettings = snap.data() as AppSettings;
        setStoredItem(STORAGE_KEYS.SETTINGS, remoteSettings);
        return remoteSettings;
      }
    } catch (e) {
      console.warn('Erro ao buscar settings do Firestore, usando fallback:', e);
    }
  }
  return getStoredItem<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export async function updateAppSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getAppSettings();
  const updated: AppSettings = { ...current, ...settings };

  // 1. Gravar no Servidor Backend
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  } catch (err) {
    console.warn('Falha ao gravar settings no servidor:', err);
  }

  // 2. Gravar no Firestore se configurado
  if (isRealFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'settings', 'appSettings'), updated, { merge: true });
    } catch (e) {
      console.error('Erro ao salvar settings no Firestore:', e);
    }
  }

  setStoredItem(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

/* =========================================================================
 * GERENCIAMENTO DE HISTÓRIAS (CRUD COMPLETO SEM LIMITAÇÃO)
 * ========================================================================= */

export async function getStories(): Promise<Story[]> {
  // 1. Tentar carregar do Backend Server API (Banco de Dados Persistente)
  try {
    const res = await fetch('/api/stories');
    if (res.ok) {
      const serverStories: Story[] = await res.json();
      if (Array.isArray(serverStories)) {
        setStoredItem(STORAGE_KEYS.STORIES, serverStories);
        return serverStories;
      }
    }
  } catch (err) {
    console.warn('⚠️ Falha ao buscar histórias do servidor backend, tentando Firestore/local:', err);
  }

  // 2. Se configurado com Firebase real
  if (isRealFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'stories'));
      const list: Story[] = [];
      snap.forEach(d => list.push({ ...d.data(), id: d.id } as Story));
      setStoredItem(STORAGE_KEYS.STORIES, list);
      return list;
    } catch (e) {
      console.warn('Erro ao carregar histórias do Firestore:', e);
    }
  }

  // 3. Fallback do storage local
  return getStoredItem<Story[]>(STORAGE_KEYS.STORIES, INITIAL_STORIES);
}

export async function saveStory(story: Story): Promise<void> {
  // 1. Salvar no Backend Server API (Persistência real no banco de dados do servidor)
  try {
    const res = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(story),
    });
    if (!res.ok) {
      const errData = await res.json();
      console.error('Erro na resposta da API /api/stories:', errData);
    }
  } catch (err) {
    console.error('Falha de rede ao salvar história no backend:', err);
  }

  // 2. Salvar no Firestore se configurado
  if (isRealFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'stories', story.id), story, { merge: true });
    } catch (e) {
      console.error('Erro ao salvar história no Firestore:', e);
    }
  }

  // 3. Atualizar cache local
  const stories = getStoredItem<Story[]>(STORAGE_KEYS.STORIES, INITIAL_STORIES);
  const index = stories.findIndex(s => s.id === story.id);
  if (index >= 0) {
    stories[index] = story;
  } else {
    stories.unshift(story);
  }
  setStoredItem(STORAGE_KEYS.STORIES, stories);
}

export async function deleteStory(storyId: string): Promise<void> {
  // 1. Deletar no Backend Server API (Exclusão definitiva de tudo no banco de dados)
  try {
    const res = await fetch(`/api/stories/${storyId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      console.warn('Falha na resposta do servidor ao deletar história:', await res.json());
    }
  } catch (err) {
    console.error('Erro ao comunicar deleção ao servidor:', err);
  }

  // 2. Deletar no Firestore se configurado
  if (isRealFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'stories', storyId));
    } catch (e) {
      console.error('Erro ao deletar história no Firestore:', e);
    }
  }

  // 3. Atualizar cache local
  const stories = getStoredItem<Story[]>(STORAGE_KEYS.STORIES, INITIAL_STORIES);
  const filtered = stories.filter(s => s.id !== storyId);
  setStoredItem(STORAGE_KEYS.STORIES, filtered);

  // 4. Limpar dos favoritos para não deixar referências órfãs
  try {
    const favs = getStoredItem<Record<string, string[]>>(STORAGE_KEYS.FAVORITES, {});
    let changed = false;
    Object.keys(favs).forEach(uid => {
      if (favs[uid]?.includes(storyId)) {
        favs[uid] = favs[uid].filter(id => id !== storyId);
        changed = true;
      }
    });
    if (changed) {
      setStoredItem(STORAGE_KEYS.FAVORITES, favs);
    }
  } catch {
    // silencioso
  }
}

export async function incrementStoryStats(storyId: string, type: 'view' | 'listen'): Promise<void> {
  const stories = getStoredItem<Story[]>(STORAGE_KEYS.STORIES, INITIAL_STORIES);
  const index = stories.findIndex(s => s.id === storyId);
  if (index >= 0) {
    if (type === 'view') {
      stories[index].views = (stories[index].views || 0) + 1;
    } else {
      stories[index].listens = (stories[index].listens || 0) + 1;
    }
    setStoredItem(STORAGE_KEYS.STORIES, stories);

    // Enviar ao servidor
    fetch(`/api/stories/${storyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        views: stories[index].views,
        listens: stories[index].listens,
      }),
    }).catch(() => {});

    if (isRealFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'stories', storyId), {
          views: stories[index].views,
          listens: stories[index].listens,
        });
      } catch (e) {
        // silencioso
      }
    }
  }
}

/* =========================================================================
 * GERENCIAMENTO DE USUÁRIOS E ASSINATURAS
 * ========================================================================= */

export async function getAllUsers(): Promise<User[]> {
  if (isRealFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: User[] = [];
      snap.forEach(d => list.push(d.data() as User));
      return list;
    } catch (e) {
      console.warn('Erro ao carregar lista de usuários:', e);
    }
  }

  const usersMap = getStoredItem<Record<string, User>>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  return Object.values(usersMap);
}

export async function updateUserSubscriptionStatus(
  uid: string, 
  status: 'active' | 'inactive' | 'pending' | 'canceled',
  extendDays = 30
): Promise<void> {
  const now = new Date();
  const endDate = new Date(now.getTime() + extendDays * 24 * 60 * 60 * 1000).toISOString();

  if (isRealFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        subscriptionStatus: status,
        subscriptionStart: status === 'active' ? now.toISOString() : undefined,
        subscriptionEnd: status === 'active' ? endDate : undefined,
      });
    } catch (e) {
      console.error('Erro ao atualizar usuário no Firestore:', e);
    }
  }

  const users = getStoredItem<Record<string, User>>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  if (users[uid]) {
    users[uid].subscriptionStatus = status;
    if (status === 'active') {
      users[uid].subscriptionStart = now.toISOString();
      users[uid].subscriptionEnd = endDate;
    }
    setStoredItem(STORAGE_KEYS.USERS, users);
  }

  const current = getCurrentUser();
  if (current && current.uid === uid) {
    current.subscriptionStatus = status;
    if (status === 'active') {
      current.subscriptionStart = now.toISOString();
      current.subscriptionEnd = endDate;
    }
    setStoredItem(STORAGE_KEYS.CURRENT_USER, current);
  }
}

export async function recordInfinitePaySubscription(
  userId: string,
  paymentMethod: 'pix' | 'credit_card',
  amount: number,
  planName: string
): Promise<Subscription> {
  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const paymentId = 'inf_' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const current = getCurrentUser();
  const subscription: Subscription = {
    id: 'sub_' + Math.random().toString(36).substring(2, 9),
    userId,
    userEmail: current?.email || '',
    userName: current?.name || 'Assinante Real',
    status: 'active',
    plan: planName,
    amount,
    paymentId,
    paymentMethod,
    startDate: now.toISOString(),
    endDate,
  };

  // Salvar no Firestore
  if (isRealFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'subscriptions', subscription.id), subscription);
    } catch (e) {
      console.error('Erro ao registrar assinatura no Firestore:', e);
    }
  }

  // Salvar no storage local
  const subs = getStoredItem<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
  subs.unshift(subscription);
  setStoredItem(STORAGE_KEYS.SUBSCRIPTIONS, subs);

  // Ativa o status do usuário
  await updateUserSubscriptionStatus(userId, 'active', 30);

  return subscription;
}

export function getUserSubscriptions(userId: string): Subscription[] {
  const subs = getStoredItem<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
  return subs.filter(s => s.userId === userId);
}

/* =========================================================================
 * CHAT EM TEMPO REAL
 * ========================================================================= */

export function subscribeToChatMessages(
  userId: string, 
  callback: (messages: ChatMessage[]) => void
): () => void {
  // Se for usuário comum, filtra as conversas dele com o admin
  // Se for admin, pode ver mensagens gerais
  const filterChat = () => {
    const all = getStoredItem<ChatMessage[]>(STORAGE_KEYS.CHATS, DEFAULT_CHATS);
    const filtered = all.filter(
      m => m.senderId === userId || m.recipientId === userId || m.recipientId === 'admin'
    );
    callback(filtered);
  };

  const handler = () => filterChat();
  window.addEventListener('raposinhas_storage_change', handler);
  filterChat();

  return () => window.removeEventListener('raposinhas_storage_change', handler);
}

export function subscribeToAllChatsForAdmin(
  callback: (messages: ChatMessage[]) => void
): () => void {
  const filterChat = () => {
    const all = getStoredItem<ChatMessage[]>(STORAGE_KEYS.CHATS, DEFAULT_CHATS);
    callback(all);
  };

  const handler = () => filterChat();
  window.addEventListener('raposinhas_storage_change', handler);
  filterChat();

  return () => window.removeEventListener('raposinhas_storage_change', handler);
}

export async function sendChatMessage(
  sender: User,
  recipientId: string,
  text: string
): Promise<ChatMessage> {
  const newMsg: ChatMessage = {
    id: 'msg-' + Math.random().toString(36).substring(2, 9),
    senderId: sender.uid,
    senderName: sender.name,
    senderRole: sender.role,
    recipientId,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    read: false,
  };

  const all = getStoredItem<ChatMessage[]>(STORAGE_KEYS.CHATS, DEFAULT_CHATS);
  all.push(newMsg);
  setStoredItem(STORAGE_KEYS.CHATS, all);

  // Se tiver Firestore real
  if (isRealFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'messages', newMsg.id), newMsg);
    } catch (e) {
      console.warn('Erro ao enviar mensagem para o Firestore:', e);
    }
  }

  return newMsg;
}

/* =========================================================================
 * FAVORITOS
 * ========================================================================= */

export function getFavoriteStoryIds(userId: string): string[] {
  const map = getStoredItem<Record<string, string[]>>(STORAGE_KEYS.FAVORITES, {
    'user-sofia-uid': ['raposinha-e-o-castelo-de-ouro', 'a-cancao-de-ninar-da-lua-de-prata'],
  });
  return map[userId] || [];
}

export function toggleFavoriteStory(userId: string, storyId: string): boolean {
  const map = getStoredItem<Record<string, string[]>>(STORAGE_KEYS.FAVORITES, {});
  const currentFavs = map[userId] || [];
  const exists = currentFavs.includes(storyId);
  const updated = exists 
    ? currentFavs.filter(id => id !== storyId)
    : [...currentFavs, storyId];

  map[userId] = updated;
  setStoredItem(STORAGE_KEYS.FAVORITES, map);
  return !exists;
}

/* =========================================================================
 * SEED DE DADOS NO NOVO PROJETO FIREBASE (1-Click Setup)
 * ========================================================================= */

export async function seedNewFirebaseProject(): Promise<{ success: boolean; message: string }> {
  if (!isRealFirebaseConfigured || !db) {
    return {
      success: false,
      message: 'Configure as variáveis do seu NOVO projeto Firebase no .env antes de executar o seed.',
    };
  }

  try {
    // 1. Salvar configurações
    await setDoc(doc(db, 'settings', 'appSettings'), INITIAL_SETTINGS);

    // 2. Salvar histórias iniciais
    for (const story of INITIAL_STORIES) {
      await setDoc(doc(db, 'stories', story.id), story);
    }

    // 3. Salvar usuário admin padrão
    await setDoc(doc(db, 'users', 'admin-claudia-uid'), DEFAULT_USERS['admin-claudia-uid']);

    return {
      success: true,
      message: 'NOVO projeto Firebase populado com sucesso com histórias, settings e admin padrão!',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Erro ao popular Firebase: ${errorMsg}`,
    };
  }
}
