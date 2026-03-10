# 14 — Reações com Emoji nas Mensagens
**Data:** 2026-03-10

## Requirements
- Hover sobre mensagem mostra picker com 5 emojis rápidos
- Reações aparecem agrupadas abaixo do balão com contagem
- Suporte a desfazer reação (clicar no mesmo emoji remove)
- Sincronização em tempo real via Socket.IO

## Spec

### Backend — Prisma
```prisma
model Reaction {
  id        String   @id @default(cuid())
  messageId String
  userId    String
  emoji     String   // ex: "👍"
  createdAt DateTime @default(now())
  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])

  @@unique([messageId, userId, emoji])
}
```

### Backend — Socket.IO
```js
// Emit: chat:reaction { messageId, emoji }
// Toggle: cria se não existe, deleta se já existe
socket.on("chat:reaction", async ({ messageId, emoji }) => {
  const existing = await prisma.reaction.findUnique({
    where: { messageId_userId_emoji: { messageId, userId: socket.userId, emoji } }
  });
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({ data: { messageId, userId: socket.userId, emoji } });
  }
  io.to(roomId).emit("chat:reaction-update", { messageId });
});
```

### Frontend
**Emojis disponíveis:** `["👍", "❤️", "😂", "😮", "😢"]`

**Picker (hover):**
```jsx
<div className="absolute -top-8 right-0 hidden group-hover:flex bg-white rounded-full shadow-lg border p-1 gap-1">
  {EMOJIS.map(e => <button key={e} onClick={() => reactTo(msg.id, e)}>{e}</button>)}
</div>
```

**Display abaixo do balão:**
```jsx
{Object.entries(groupedReactions).map(([emoji, users]) => (
  <button key={emoji} className="flex items-center gap-1 text-sm bg-gray-100 rounded-full px-2 py-0.5">
    {emoji} <span>{users.length}</span>
  </button>
))}
```

## Arquivos a Modificar
- `backend/prisma/schema.prisma` — model Reaction
- `backend/src/lib/socket.js` — handler chat:reaction
- `frontend/src/pages/ChatPage.jsx` — picker + display de reações
