export type UserRole = 'user' | 'admin';
export type SubscriptionStatus = 'active' | 'inactive' | 'pending' | 'canceled';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  avatarUrl?: string;
  avatarBadge?: 'fox' | 'crown' | 'wand' | 'star' | 'rose';
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl: string;
  audioUrl?: string;
  audioDurationSec: number;
  contentHtml: string;
  category: StoryCategory;
  tags: string[];
  readingTimeMinutes: number;
  isPublished: boolean;
  isFeatured?: boolean;
  views: number;
  listens: number;
  createdAt: string;
  updatedAt: string;
}

export type StoryCategory = 
  | 'contos-de-fadas'
  | 'princesas-e-castelos'
  | 'floresta-encantada'
  | 'lendas-medievais'
  | 'historias-para-dormir';

export interface CategoryInfo {
  id: StoryCategory;
  name: string;
  icon: string;
  description: string;
  accentColor: string;
}

export interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: SubscriptionStatus;
  plan: string;
  amount: number;
  paymentId: string;
  paymentMethod: 'pix' | 'credit_card';
  startDate: string;
  endDate: string;
}

export interface AppSettings {
  monthlyPrice: number; // e.g. 29.90
  planName: string; // e.g. "Assinatura Mensal Encantada"
  isSubscriptionActive: boolean;
  bannerNotice: string;
  landingHeroTitle: string;
  landingHeroSubtitle: string;
  storiesCountText: string;
  perksList: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string; // 'admin' or user uid
  text: string;
  timestamp: string;
  read: boolean;
}

export type ActiveTab = 'home' | 'library' | 'favorites' | 'subscription' | 'chat' | 'profile' | 'admin' | 'login';
