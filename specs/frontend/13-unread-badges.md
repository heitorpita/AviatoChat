# 13 — Badges de Mensagens Não Lidas
**Data:** 2026-03-10

## Requirements
- Mostrar contagem de mensagens não lidas por conversa na sidebar de amigos
- Badge no ícone de chat na navbar quando há mensagens não lidas no total
- Atualizar em tempo real via Socket.IO
- Zerar badge ao abrir a conversa

## Spec

### Backend
**Novo endpoint:** `GET /api/chat/unread-counts`
```js
// Retorna contagem por conversa
const counts = await prisma.message.groupBy({
  by: ["roomId"],
  where: { readAt: null, senderId: { not: userId } },
  _count: { id: true },
});
// Mapear roomId → friendId → count
```

Ou via socket: ao conectar, emitir `chat:unread-counts` com as contagens.

### Frontend
- `useQuery({ queryKey: ["unread-counts"] })` — busca contagens
- Invalidar query ao marcar como lido (`chat:read`)
- Badge vermelha no avatar do amigo: `<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{count}</span>`
- Badge na navbar: somar todas as contagens

## Arquivos a Modificar
- `backend/src/modules/chat/controllers/chat.controller.js` — novo endpoint
- `frontend/src/pages/ChatPage.jsx` — badges nos avatares
- `frontend/src/components/Navbar.jsx` — badge total no ícone
