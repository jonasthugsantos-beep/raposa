# 🦊 Clube das Raposinhas — Aplicativo PWA Encantado

Aplicativo web progressivo (PWA) 100% mobile-first do **Clube das Raposinhas**: clube de assinatura mensal de contos de fadas, narrativas medievais e histórias encantadas com leitura confortável e áudio completo narrado por Claudia.

---

## 🏰 Visão Geral da Arquitetura

- **Frontend & PWA**: React 19 + TypeScript + Tailwind CSS v4 + Motion
- **Identidade Visual**: Medieval encantado / conto de fadas / princesa
  - Dourado Real: `#D4AF37`
  - Rosa Suave / Pêssego: `#F8C8DC` e `#FFB6C1`
  - Lilás Profundo / Roxo Real: `#6B4C9A` e `#4A2C6A`
  - Pergaminho / Marfim: `#FDF6E3`
  - Verde Floresta: `#2F4F4F`
  - Preto Carvão: `#1A1A1A`
- **Banco de Dados & Autenticação**: Firebase Firestore & Firebase Auth (Totalmente isolado em um **NOVO** projeto)
- **Armazenamento de Arquivos (Capas e Áudios)**: Vercel Blob com suporte a fallback local resiliente
- **Pagamentos**: InfinitePay (Pix Instantâneo + Cartão de Crédito) com webhook `/api/webhooks/infinitepay`
- **Áudio**: Player completo com controle de velocidade (0.75x a 1.5x), timer para dormir e Sintetizador Mágico de Harpa Medieval via Web Audio API.

---

## ⚡ Credenciais Padrão de Acesso

### Administradora (Acesso Total ao Painel de Gestão e Chat):
- **E-mail:** `claudia@x.com`
- **Senha:** `claudia4321`

*(No app, há também botões de atalho de "Acesso Rápido" na tela de login para alternar instantaneamente entre a Admin Claudia e a Assinante Princesa Sofia)*.

---

## 🛠️ Passo a Passo: Criação do NOVO Projeto Firebase (Isolado)

> ⚠️ **IMPORTANTE:** Nunca reutilize projetos Firebase já existentes para evitar conflitos de dados e regras de segurança. Crie um projeto novo e exclusivo para o Clube das Raposinhas.

### 1. Criar o Projeto no Firebase Console
1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Clique em **"Adicionar projeto"** (ou "Add project").
3. Digite o nome do projeto sugerido: `clube-das-raposinhas` (ou similar).
4. O Google Analytics é opcional (pode desativar para maior rapidez).
5. Aguarde a criação e clique em **Continuar**.

### 2. Registrar o Aplicativo Web
1. No painel principal do seu novo projeto, clique no ícone **Web** (`</>`).
2. Digite o apelido do app: `Raposinhas Web PWA`.
3. Não precisa marcar o Firebase Hosting no momento.
4. Clique em **Registrar app**.
5. Copie os valores do objeto `firebaseConfig`:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### 3. Ativar a Autenticação (Firebase Auth)
1. No menu lateral esquerdo, vá em **Construção (Build)** > **Authentication**.
2. Clique em **Vamos começar** (Get Started).
3. Na aba **Sign-in method**, selecione **E-mail/senha**.
4. Ative a primeira opção (**Permitir que os usuários façam login com e-mail e senha**).
5. Clique em **Salvar**.
6. *(Opcional)* Na aba **Users**, você pode clicar em **Adicionar usuário** e criar manualmente a conta de Claudia:
   - E-mail: `claudia@x.com`
   - Senha: `claudia4321`

### 4. Criar o Banco de Dados Cloud Firestore
1. No menu lateral esquerdo, vá em **Construção (Build)** > **Firestore Database**.
2. Clique em **Criar banco de dados**.
3. Selecione o local do servidor (ex: `southamerica-east1` em São Paulo, ou `us-east1`).
4. Escolha **Modo de produção** e clique em **Criar**.

### 5. Configurar as Regras de Segurança (Firestore Security Rules)
No Firestore, acesse a aba **Regras (Rules)** e cole a configuração abaixo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Função auxiliar para verificar se o usuário é a Administradora Claudia
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.email == 'claudia@x.com' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }

    // Função para verificar se o usuário é assinante com status ativo
    function isSubscriber() {
      return request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.subscriptionStatus == 'active' ||
        isAdmin()
      );
    }

    // Configurações gerais (settings)
    match /settings/{docId} {
      allow read: if true; // Aberto para a landing page ler o preço dinâmico
      allow write: if isAdmin();
    }

    // Histórias e contos
    match /stories/{storyId} {
      // Visitantes podem ler metadados básicos; assinantes leem o conteúdo completo
      allow read: if isSubscriber() || resource.data.isFeatured == true;
      allow write: if isAdmin();
    }

    // Usuários e perfis
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && (request.auth.uid == userId || isAdmin());
    }

    // Assinaturas InfinitePay
    match /subscriptions/{subId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || isAdmin());
      allow write: if isAdmin();
    }

    // Chat em tempo real
    match /messages/{messageId} {
      allow read: if request.auth != null && (
        resource.data.senderId == request.auth.uid || 
        resource.data.recipientId == request.auth.uid || 
        isAdmin()
      );
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }
  }
}
```

---

## ☁️ Como Configurar o Vercel Blob (Armazenamento de Capas e Áudios)

O Vercel Blob permite hospedar arquivos de imagem e faixas completas de áudio em alta velocidade.

1. Acesse o seu painel na [Vercel](https://vercel.com).
2. Vá até a aba **Storage** e clique em **Create Database** > **Blob**.
3. Dê um nome ao repositório (ex: `raposinhas-blob-storage`).
4. Após criado, vá na aba **Settings** > **Tokens** e copie a variável `BLOB_READ_WRITE_TOKEN`.
5. Cole o valor no arquivo `.env`:
   ```bash
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
   ```

*Nota:* O aplicativo possui um fallback inteligente que permite carregar imagens e áudios mesmo sem o token da Vercel configurado durante o desenvolvimento.

---

## 💳 Como Configurar a InfinitePay e o Webhook

1. Acesse sua conta na [InfinitePay](https://infinitepay.io).
2. Obtenha sua chave de API e segredo de webhook no painel de desenvolvedor.
3. Configure a URL do webhook no painel da InfinitePay apontando para:
   ```
   https://seu-dominio.vercel.app/api/webhooks/infinitepay
   ```
4. Eventos a escutar:
   - `charge.paid`
   - `pix.received`
   - `transaction.approved`
5. No painel de administração da Claudia dentro do app, o preço da mensalidade (ex: `R$ 29,90`) pode ser alterado a qualquer momento, atualizando o valor cobrado via Pix e Cartão instantaneamente.

---

## 💻 Como Rodar o Projeto Localmente

1. Clone o repositório ou acesse a pasta do projeto.
2. Copie o arquivo de exemplo para suas variáveis locais:
   ```bash
   cp .env.example .env
   ```
3. Preencha suas chaves do **NOVO projeto Firebase** no arquivo `.env`.
4. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acesse `http://localhost:3000` no seu navegador ou dispositivo móvel!

---

## 📂 Estrutura de Pastas

```
clube-das-raposinhas/
├── public/                     # Ícones PWA, favicon, manifest
│   ├── icon.svg
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── apple-touch-icon.png
├── src/
│   ├── components/
│   │   ├── admin/             # Dashboard, Histórias, Usuários, Configurações
│   │   ├── audio/             # Player encantado, sintetizador e sleep timer
│   │   ├── auth/              # Modal de login, cadastro e atalhos rápidos
│   │   ├── chat/              # Chat em tempo real com Claudia
│   │   ├── checkout/          # Modal InfinitePay (Pix + Cartão de Crédito)
│   │   ├── landing/           # Landing page de conversão
│   │   ├── layout/            # AppShell (moldura mobile) e BottomNavigation
│   │   ├── pwa/               # Botão de instalação PWA e indicador offline
│   │   ├── splash/            # Splash screen animada
│   │   ├── story/             # Leitor de contos com modo noturno
│   │   └── subscriber/        # Home do assinante, biblioteca, favoritos, perfil
│   ├── data/
│   │   └── initialData.ts     # Contos, categorias e configurações iniciais
│   ├── hooks/
│   │   └── usePWAInstall.ts   # Hook de instalação PWA e status online
│   ├── lib/
│   │   ├── audioService.ts    # Motor de áudio com sintetizador de harpa
│   │   ├── blobStorage.ts     # Cliente de upload Vercel Blob
│   │   └── firebase.ts        # Configuração do NOVO Firebase e store reativo
│   ├── types/
│   │   └── index.ts           # Definições TypeScript
│   ├── App.tsx                # Gerenciador de navegação e estados do app
│   ├── index.css              # Estilos Tailwind e tipografia medieval
│   └── main.tsx               # Entrypoint React
├── server.ts                  # Servidor Express com rotas de API e webhook
├── .env.example               # Exemplo de configuração do NOVO Firebase
├── vite.config.ts             # Configuração do Vite e plugin VitePWA
└── package.json
```

---

Desenvolvido com carinho para o **Clube das Raposinhas** 🦊✨
