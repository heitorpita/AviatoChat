# AviatoChat

Plataforma de troca de idiomas com chat em tempo real e videochamadas P2P diretamente no navegador.

![Stack](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![Stack](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Stack](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Stack](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io)
![Stack](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma)

---

## Funcionalidades

- **Troca de idiomas** — parceria automática entre usuários com idiomas complementares (ex: Português → Inglês com Inglês → Português)
- **Chat em tempo real** — mensagens instantâneas com indicador de digitação e confirmação de leitura (Socket.IO)
- **Videochamada P2P** — chamadas de vídeo direto no navegador via WebRTC, sem servidor de mídia
- **Solicitações de amizade** — enviar, aceitar e rejeitar pedidos de amizade
- **Notificações em tempo real** — chamadas recebidas com modal de aceitar/rejeitar
- **Perfil personalizável** — foto, bio, idiomas, localização
- **Painel admin** — estatísticas e listagem de usuários (role ADMIN)
- **Autenticação JWT** — tokens com 7 dias de validade, armazenados no localStorage

---

## Stack

### Backend
| Tecnologia | Uso |
|-----------|-----|
| Node.js + Express | Servidor HTTP e API REST |
| Socket.IO | WebSockets para chat e sinalização WebRTC |
| Prisma + PostgreSQL | ORM e banco de dados |
| JWT + bcrypt | Autenticação e hash de senha |
| `@prisma/adapter-pg` | Driver nativo do Prisma para PostgreSQL |

### Frontend
| Tecnologia | Uso |
|-----------|-----|
| React 19 + Vite | UI e bundler |
| Tailwind CSS v4 | Estilização utilitária |
| Zustand | Estado global (auth + socket) |
| TanStack Query | Cache e sincronização de dados do servidor |
| React Router v7 | Roteamento SPA |
| Lucide React | Ícones |
| React Hot Toast | Notificações |

---

## Estrutura do projeto

```
AviatoChat/
├── backend/
│   ├── index.js                    # Entry point (HTTP + Socket.IO)
│   ├── prisma/
│   │   └── schema.prisma           # Modelos: User, FriendRequest, Message
│   └── src/
│       ├── config/prisma.js        # Cliente Prisma singleton
│       ├── lib/socket.js           # Socket.IO (chat + WebRTC signaling)
│       ├── middlewares/
│       │   ├── authentication.middleware.js
│       │   └── autorization.middleware.js
│       └── modules/
│           ├── user/               # Signup, login, onboarding, perfil
│           ├── friends/            # Solicitações e lista de amigos
│           └── chat/               # Histórico de mensagens
└── frontend/
    └── src/
        ├── pages/                  # LandingPage, Login, Signup, Home,
        │                           # Chat, Call, Friends, Notifications,
        │                           # Profile, Onboarding, Admin
        ├── components/
        │   ├── layout/             # Sidebar, Layout
        │   └── ui/                 # Button, Input, Avatar
        ├── store/                  # auth.store, socket.store (Zustand)
        ├── api/                    # Chamadas axios organizadas por módulo
        └── lib/socket.js           # Cliente Socket.IO
```

---

## Modelos do banco

```prisma
User            # id, fullName, email, password, bio, profilePic,
                # nativeLanguage, learningLanguage, location,
                # isOnboarded, role (USER | ADMIN)

FriendRequest   # senderId, receiverId, status (PENDING | ACCEPTED | REJECTED)

Message         # roomId, senderId, text, readAt, createdAt
```

---

## Como rodar localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL rodando localmente

### 1. Clonar e instalar

```bash
git clone https://github.com/heitorpita/AviatoChat.git
cd AviatoChat
```

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurar variáveis de ambiente

Crie `backend/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/aviato_chat"
JWT_SECRET_KEY="sua_chave_secreta_aqui"
PORT=5001
```

### 3. Aplicar o schema no banco

```bash
cd backend
npx prisma migrate dev --name init
```

### 4. Iniciar os servidores

```bash
# Terminal 1 — Backend (porta 5001)
cd backend && npm run dev

# Terminal 2 — Frontend (porta 5173)
cd frontend && npm run dev
```

Acesse: **http://localhost:5173**

---

## Como testar o chat e a videochamada

Para testar as funcionalidades em tempo real você precisa de **duas contas com idiomas invertidos**:

| Conta | Nativo | Quer aprender |
|-------|--------|---------------|
| Usuário A | Português | Inglês |
| Usuário B | Inglês | Português |

> O algoritmo de sugestões conecta usuários com idiomas complementares entre si.

**Fluxo completo:**
1. Crie a Conta A em uma aba normal
2. Crie a Conta B em uma aba anônima (ou outro navegador)
3. Na Conta A → Home → clique em "Adicionar" no perfil da Conta B
4. Na Conta B → Notifications → aceite a solicitação
5. Agora ambos aparecem em Friends → clique para abrir o chat
6. No chat, clique no ícone de vídeo para iniciar uma chamada

---

## API — Principais endpoints

```
POST   /api/users/signup          Cadastro
POST   /api/users/login           Login
POST   /api/users/logout          Logout
PUT    /api/users/onboard         Completar perfil
GET    /api/users/me              Dados do usuário atual
GET    /api/users/chat-users      Sugestões de parceiros
GET    /api/users/friends         Lista de amigos

POST   /api/friends/request/:id   Enviar solicitação
PUT    /api/friends/accept/:id    Aceitar solicitação
PUT    /api/friends/reject/:id    Rejeitar solicitação
GET    /api/friends/pending       Solicitações pendentes

GET    /api/chat/:friendId        Histórico de mensagens
```

---

## Eventos Socket.IO

**Chat**
- `chat:join` / `chat:message` / `chat:typing` / `chat:read`

**Videochamada (sinalização WebRTC)**
- `call:incoming` / `call:accept` / `call:reject` / `call:ended`
- `webrtc:offer` / `webrtc:answer` / `webrtc:ice-candidate`

---

## Licença

MIT
