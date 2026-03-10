# AviatoChat — Frontend

Interface web para o AviatoChat, plataforma de troca de idiomas com chat em tempo real e videochamada.

## Stack

| Tecnologia | Uso |
|-----------|-----|
| React 18 + Vite | SPA com HMR |
| Tailwind CSS v4 | Estilização (tokens via `@theme {}`) |
| shadcn/ui | Componentes base (Button, Input, Select...) |
| TanStack Query | Cache e sincronização de dados HTTP |
| Zustand | Estado global (auth + socket) |
| Socket.IO Client | Chat em tempo real |
| React Router v6 | Roteamento SPA |

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente (`.env`)

```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

---

## Páginas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | LandingPage | Página pública de entrada |
| `/login` | LoginPage | Autenticação |
| `/signup` | SignupPage | Cadastro |
| `/onboarding` | OnboardingPage | Configuração inicial de perfil + upload de foto |
| `/home` | HomePage | Parceiros sugeridos (todos os onboarded não-amigos) |
| `/chat/:friendId?` | ChatPage | Chat em tempo real + envio de imagens |
| `/friends` | FriendsPage | Lista de amigos |
| `/notifications` | NotificationsPage | Solicitações de amizade |
| `/profile` | ProfilePage | Editar perfil + foto |
| `/call/:userId` | CallPage | Videochamada WebRTC |
| `/admin` | AdminPage | Painel admin (somente ADMIN) |

## Funcionalidades

- **Chat em tempo real** — Socket.IO com histórico persistido no banco
- **Envio de imagens no chat** — Upload via `/api/upload`, exibição inline
- **Foto de perfil por upload** — Substituiu o campo de URL
- **Parceiros sugeridos** — Todos os usuários onboarded que ainda não são amigos
- **Videochamada P2P** — WebRTC via Socket.IO como servidor de sinalização
- **Layout responsivo** — Desktop: sidebar lateral | Mobile: bottom tab bar + painéis alternados no chat

## Estrutura

```
frontend/src/
├── api/              # Funções de chamada HTTP (auth, users, friends, chat, upload)
├── components/
│   ├── layout/       # Layout, Sidebar (desktop + mobile bottom nav)
│   └── ui/           # shadcn components
├── hooks/
│   └── useSocket.js  # Hook para chat via Socket.IO
├── lib/
│   ├── axios.js      # Instância Axios com interceptor JWT
│   └── socket.js     # Criação do socket cliente
├── pages/            # Todas as páginas da aplicação
└── store/
    ├── auth.store.js # Zustand (persiste no localStorage)
    └── socket.store.js
```
