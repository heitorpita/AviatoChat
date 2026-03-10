# 05 — Home e Amigos

## Requirements
- HomePage exibe usuários compatíveis por idioma (endpoint `GET /api/users/chat-users`)
- Cada card mostra: avatar, nome, idioma nativo, idioma que aprende, localização, bio
- Botão "Adicionar amigo" em cada card, desabilitado após envio
- Indicador de status online usando a store de socket (`onlineUsers`)
- FriendsPage lista amigos com opção de ir direto para o chat
- NotificationsPage lista solicitações pendentes com ações de aceitar/rejeitar

## Spec
A HomePage é a tela principal pós-login. Usa TanStack Query para buscar os usuários. O estado online vem da store de socket (atualizado em tempo real via `users:online` do Socket.IO). FriendsPage e NotificationsPage seguem o mesmo padrão de query + mutation.

**Visual:**
- Grid de cards de usuários (3 colunas desktop, 1 mobile)
- Sidebar: bg `#023047`, texto branco
- Cards: fundo branco, borda `rgba(33,158,188,0.2)`, hover com sombra teal
- Badge online: círculo verde `#10b981`
- Botão "Adicionar": `#219ebc` hover `#023047`
- NotificationsPage: badge contador de pendentes no ícone da sidebar

## Tasks
- [ ] Criar `src/pages/HomePage.jsx` — grid de usuários, query `getChatUsers`, botão de adicionar amigo com mutation
- [ ] Criar `src/pages/FriendsPage.jsx` — lista de amigos, query `getFriends`, link para `/chat/:friendId`
- [ ] Criar `src/pages/NotificationsPage.jsx` — lista de requests pendentes, aceitar/rejeitar com mutations
- [ ] Criar `src/components/ui/Avatar.jsx` — avatar com fallback de iniciais
- [ ] Adicionar indicador de online nos cards e lista de amigos usando `socket.store`
- [ ] Conectar Socket.IO ao montar o Layout (evento `users:online`)
