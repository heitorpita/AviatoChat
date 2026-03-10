# 02 — Infraestrutura Base

## Requirements
- Instância Axios configurada com `baseURL` apontando para o backend (`/api`)
- Interceptor que injeta o token JWT em toda requisição autenticada
- Cliente Socket.IO configurado com auth token
- Store Zustand para autenticação com persistência no localStorage
- Store Zustand para socket (sem persistência)
- Funções de API organizadas por módulo

## Spec
Criar toda a camada de comunicação com o backend: HTTP via Axios e tempo real via Socket.IO. As stores Zustand centralizam o estado de autenticação (persistido) e de socket (efêmero). As funções de API são arquivos separados por domínio, todas usando a instância Axios configurada.

**Backend endpoints de referência:**
- `POST /api/users/signup` — `{ fullName, email, password }`
- `POST /api/users/login` — `{ email, password }` → `{ token, usuario }`
- `POST /api/users/logout`
- `PUT /api/users/onboard` — `{ nativeLanguage, learningLanguage, bio, profilePic, location }`
- `GET /api/users/me`
- `GET /api/users/chat-users`
- `GET /api/users/friends`
- `GET /api/chat/messages/:friendId?limit=50&cursor=<id>`
- `POST /api/friends/request/:userId`
- `PUT /api/friends/request/:requestId/accept`
- `PUT /api/friends/request/:requestId/reject`
- `GET /api/friends/requests`

**Socket.IO auth:** token em `socket.handshake.auth.token`

## Tasks
- [ ] Criar `src/lib/axios.js` — instância com `baseURL` e interceptor de Authorization header
- [ ] Criar `src/lib/socket.js` — singleton de Socket.IO com token da store
- [ ] Criar `src/store/auth.store.js` — `{ user, token, setAuth, clearAuth }` com Zustand persist
- [ ] Criar `src/store/socket.store.js` — `{ socket, onlineUsers, setSocket, setOnlineUsers }`
- [ ] Criar `src/api/auth.api.js` — signup, login, logout, me, onboard
- [ ] Criar `src/api/chat.api.js` — getMessages(friendId, params)
- [ ] Criar `src/api/friends.api.js` — sendRequest, acceptRequest, rejectRequest, getPendingRequests
- [ ] Criar `src/api/users.api.js` — getChatUsers, getFriends
