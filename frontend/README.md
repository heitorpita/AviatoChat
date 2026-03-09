# AviatoChat — Frontend

Interface web do AviatoChat, plataforma de troca de idiomas com chat e videochamada P2P.

## Stack

| Tecnologia | Uso |
|-----------|-----|
| React 19 + Vite | Base |
| React Router v6 | Roteamento |
| Tailwind CSS v4 | Estilos |
| Zustand | Estado global (auth, socket, online users) |
| TanStack Query | Cache e fetch da API REST |
| Axios | HTTP client |
| Socket.IO Client | Chat em tempo real e sinalização WebRTC |
| Lucide React | Ícones |
| react-hot-toast | Notificações toast |

## Paleta de cores da marca

| Token Tailwind | Nome | Hex |
|---------------|------|-----|
| `bg-brand-navy` | Deep Space Blue | `#023047` |
| `bg-brand-teal` | Blue Green | `#219ebc` |
| `bg-brand-sky` | Sky Blue | `#8ecae6` |
| `bg-brand-amber` | Amber Flame | `#ffb703` |
| `bg-brand-orange` | Tiger Orange | `#fb8500` |

## Como rodar

```bash
npm install
npm run dev   # http://localhost:5173
```

> O backend deve estar rodando em `http://localhost:5001`

## Estrutura

```
src/
├── api/              # Módulos Axios por domínio
│   ├── axios.js      # Instância base com interceptor JWT
│   ├── auth.api.js
│   ├── users.api.js
│   ├── friends.api.js
│   └── chat.api.js
├── components/
│   ├── layout/       # Layout.jsx + Sidebar.jsx (com logo avião)
│   ├── ui/           # Avatar (+ online indicator), Button, Input
│   └── IncomingCallModal.jsx  # Overlay global de chamada recebida
├── hooks/
│   ├── useSocket.js  # Conecta/desconecta Socket.IO conforme auth
│   └── useWebRTC.js  # RTCPeerConnection, offer/answer/ICE candidates
├── lib/
│   └── socket.js     # Singleton io()
├── pages/            # Uma página por rota
├── router/           # AppRouter, ProtectedRoute, AdminRoute
└── store/
    ├── auth.store.js  # { usuario, token, setAuth, logout } — localStorage
    └── socket.store.js # { socket, onlineUsers }
```

## Páginas e rotas

| Rota | Página | Auth |
|------|--------|------|
| `/` | Landing | — |
| `/login` | Login | — |
| `/signup` | Signup | — |
| `/onboarding` | Onboarding | ✅ sem isOnboarded |
| `/home` | Home | ✅ + onboarded |
| `/friends` | Friends | ✅ + onboarded |
| `/notifications` | Notifications | ✅ + onboarded |
| `/chat/:friendId` | Chat | ✅ + onboarded |
| `/call/:friendId` | Call (WebRTC) | ✅ + onboarded |
| `/profile` | Profile | ✅ + onboarded |
| `/admin` | Admin | ✅ + role ADMIN |
| `*` | 404 | — |

## Auth Flow

```
isAuthenticated? → Não → /login
isAuthenticated? → Sim → isOnboarded? → Não → /onboarding
isAuthenticated? → Sim → isOnboarded? → Sim → destino
```

## Videochamada WebRTC

Sinalização via Socket.IO (relay no servidor). Mídia trafega P2P entre browsers.
STUN: `stun:stun.l.google.com:19302` (gratuito).
