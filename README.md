# AviatoChat

Plataforma de troca de idiomas com chat em tempo real, videochamadas P2P e sessões rápidas com desconhecidos — diretamente no navegador.

> **Visão de produto:** conectar pessoas de idiomas diferentes de forma simples e viral.
> Três modos de praticar: **chat com amigos**, **⚡ Speed Exchange** (5 min com desconhecido) e **Language Rooms** (salas públicas por idioma, estilo Discord).

![Stack](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![Stack](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Stack](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Stack](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io)
![Stack](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma)

---

## Funcionalidades

### Implementadas
- **Descoberta de parceiros** — mostra todos os usuários onboarded que ainda não são amigos (sem restrição de idioma)
- **Chat em tempo real** — mensagens instantâneas com indicador de digitação e confirmação de leitura (Socket.IO)
- **Envio de imagens no chat** — envie fotos diretamente na conversa
- **Foto de perfil por upload** — faça upload da sua foto (JPEG/PNG/GIF/WebP, até 5MB)
- **Videochamada P2P** — chamadas de vídeo direto no navegador via WebRTC, sem servidor de mídia
- **Solicitações de amizade** — enviar, aceitar e rejeitar pedidos de amizade
- **Notificações em tempo real** — chamadas recebidas com modal de aceitar/rejeitar
- **Perfil personalizável** — foto, bio, idiomas, localização
- **Painel admin** — estatísticas e listagem de usuários (role ADMIN)
- **Autenticação JWT** — tokens com 7 dias de validade, armazenados no localStorage
- **Layout responsivo** — sidebar no desktop, bottom tab bar no mobile

### Em desenvolvimento

#### ⚡ Speed Language Exchange (spec 19)
Sessões de **5 minutos com desconhecidos** para praticar idiomas — sem precisar de amigos cadastrados.

- 1 clique → entra na fila → match automático com outro usuário
- Vídeo/áudio via WebRTC + chat de texto efêmero durante a sessão
- Ao terminar: opção de adicionar como amigo ou iniciar nova sessão
- Sem câmera? Modo texto-only como fallback
- Inspiração: **Omegle + Tandem**

#### 🌍 Language Rooms (spec 20)
Salas públicas permanentes por idioma, estilo Discord:

```
🇺🇸 English Room      — 12 online
🇪🇸 Spanish Room      — 8 online
🇧🇷 Portuguese Room   — 5 online
🇫🇷 French Room       — 3 online
```

- Entrar e sair a qualquer momento, sem convite
- Chat de texto em grupo (últimas 50 mensagens)
- Video group call com WebRTC mesh (até 6–8 participantes)
- Contador de usuários online por sala em tempo real

### Roadmap futuro
| # | Feature | Descrição |
|---|---------|-----------|
| 13 | Badges de não lidas | Contador de mensagens não lidas na sidebar |
| 14 | Reações com emoji | 👍❤️😂 em balões de mensagem |
| 15 | Mensagens de voz | Gravar e enviar áudios no chat |
| 16 | Busca de usuários | Encontrar parceiros por nome ou idioma |
| 17 | Tradução inline | Botão "Traduzir" em cada mensagem recebida |
| 18 | Notificações push | Alertas de nova mensagem fora do app |

---

## Stack

### Backend
| Tecnologia | Uso |
|-----------|-----|
| Node.js + Express | Servidor HTTP e API REST |
| Socket.IO | WebSockets para chat e sinalização WebRTC |
| Prisma + PostgreSQL | ORM e banco de dados |
| JWT + bcrypt | Autenticação e hash de senha |
| multer | Upload de imagens (perfil + chat) |
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

---

## Estrutura do projeto

```
AviatoChat/
├── backend/
│   ├── index.js                    # Entry point (HTTP + Socket.IO)
│   ├── uploads/                    # Imagens enviadas pelos usuários
│   ├── prisma/
│   │   └── schema.prisma           # Modelos: User, FriendRequest, Message
│   └── src/
│       ├── config/prisma.js        # Cliente Prisma singleton
│       ├── lib/socket.js           # Socket.IO (chat + WebRTC + Speed + Rooms)
│       ├── middlewares/
│       │   ├── authentication.middleware.js
│       │   ├── autorization.middleware.js
│       │   └── upload.middleware.js  # multer (5MB, somente imagens)
│       └── modules/
│           ├── user/               # Signup, login, onboarding, perfil
│           ├── friends/            # Solicitações e lista de amigos
│           ├── chat/               # Histórico de mensagens
│           ├── upload/             # Upload de imagens
│           └── rooms/              # Language Rooms (em desenvolvimento)
└── frontend/
    └── src/
        ├── pages/                  # LandingPage, Login, Signup, Home,
        │                           # Chat, Call, Friends, Notifications,
        │                           # Profile, Onboarding, Admin,
        │                           # SpeedExchange, Rooms, Room (em desenvolvimento)
        ├── components/
        │   ├── layout/             # Sidebar (desktop + mobile bottom nav), Layout
        │   └── ui/                 # Button, Input, Avatar
        ├── store/                  # auth.store, socket.store (Zustand)
        ├── api/                    # Chamadas axios por módulo (+ upload.api.js)
        └── lib/socket.js           # Cliente Socket.IO
```

---

## Modelos do banco

```prisma
User            # id, fullName, email, password, bio, profilePic,
                # nativeLanguage, learningLanguage, location,
                # isOnboarded, role (USER | ADMIN)

FriendRequest   # senderId, receiverId, status (PENDING | ACCEPTED | REJECTED)

Message         # roomId, senderId, text?, imageUrl?, readAt, createdAt

RoomMessage     # roomSlug, senderId, text, createdAt  ← em desenvolvimento (Language Rooms)
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

Crie `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Aplicar o schema no banco

```bash
cd backend
npx prisma db push
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

Para testar as funcionalidades em tempo real você precisa de **duas contas**:

**Fluxo completo:**
1. Crie a Conta A em uma aba normal
2. Crie a Conta B em uma aba anônima (ou outro navegador)
3. Na Conta A → Home → clique em "Adicionar" no perfil da Conta B
4. Na Conta B → Notifications → aceite a solicitação
5. Agora ambos aparecem em Friends → clique para abrir o chat
6. No chat, clique no ícone de vídeo para iniciar uma chamada
7. Para enviar imagem: clique no ícone de foto ao lado do campo de texto

> Não é mais necessário que os idiomas sejam complementares para aparecer como sugestão.

---

## API — Principais endpoints

```
POST   /api/users/signup           Cadastro
POST   /api/users/login            Login
POST   /api/users/logout           Logout
PUT    /api/users/onboard          Completar perfil
GET    /api/users/me               Dados do usuário atual
GET    /api/users/chat-users       Todos os usuários onboarded não-amigos
GET    /api/users/friends          Lista de amigos

POST   /api/friends/request/:id    Enviar solicitação
PUT    /api/friends/accept/:id     Aceitar solicitação
PUT    /api/friends/reject/:id     Rejeitar solicitação
GET    /api/friends/pending        Solicitações pendentes

GET    /api/chat/messages/:id      Histórico de mensagens (cursor pagination)

POST   /api/upload                 Upload de imagem (form-data, campo "file")
GET    /uploads/:filename          Servir imagem enviada
```

---

## Eventos Socket.IO

**Chat (amigos)**
- `chat:join` / `chat:message` / `chat:typing` / `chat:read`
- `chat:message` suporta `{ text?, imageUrl? }` — texto ou imagem

**Videochamada (sinalização WebRTC)**
- `call:incoming` / `call:accept` / `call:reject` / `call:ended`
- `webrtc:offer` / `webrtc:answer` / `webrtc:ice-candidate`

**Speed Exchange** *(em desenvolvimento)*
- `speed:queue-join` / `speed:queue-leave` / `speed:matched` / `speed:session-end`
- `speed:message` — chat efêmero da sessão
- `speed:add-friend` — solicitar amizade ao parceiro após a sessão

**Language Rooms** *(em desenvolvimento)*
- `room:join` / `room:leave` / `room:message`
- `room:participants` — lista de quem está na sala
- `room:online-counts` — contagem de online por sala (broadcast global)

---

## Deploy (Coolify)

O `postinstall` do backend executa automaticamente:
```bash
prisma generate && prisma db push
```
Não é necessário acesso manual ao container para aplicar mudanças de schema.

---

## Licença

MIT
