# Changelog

## [2026-03-08] — Migração Stream Chat → Socket.IO + WebRTC

### Motivação
O SDK `stream-chat` é um serviço pago com limites de uso gratuito. A plataforma foi migrada para uma solução 100% gratuita e open source usando Socket.IO para chat em tempo real e WebRTC nativo do browser para videochamadas P2P.

---

### Removido

- **`stream-chat`** (npm package) — dependência externa paga eliminada
- **`src/lib/stream.js`** — cliente Stream Chat e funções `upsertStreamUser` / `generateStreamToken`
- **`GET /api/chat/token`** — endpoint que retornava token do Stream Chat
- **Variáveis de ambiente** `STREAM_API_KEY` e `STREAM_API_SECRET` — não são mais necessárias

---

### Adicionado

#### `socket.io` (npm package)
Servidor WebSocket para comunicação em tempo real.

#### `src/lib/socket.js` (novo arquivo)
Servidor Socket.IO completo com:
- Autenticação via JWT no handshake (`socket.handshake.auth.token`)
- Registry de usuários online (`Map<userId, Set<socketId>>`) com suporte a múltiplas abas
- Eventos de chat: `chat:join`, `chat:message` (persiste no DB), `chat:typing`, `chat:read`
- Sinalização WebRTC: `call:request/accept/reject/end`, `webrtc:offer/answer/ice-candidate`
- Função `getRoomId(userIdA, userIdB)` exportada e compartilhada com o controller REST

#### `prisma/schema.prisma` — modelo `Message`
```prisma
model Message {
  id        String    @id @default(cuid())
  roomId    String
  senderId  String
  text      String
  readAt    DateTime?
  createdAt DateTime  @default(now())
  sender    User      @relation("SentMessages", ...)
  @@index([roomId, createdAt])
}
```

#### `GET /api/chat/messages/:friendId` (novo endpoint)
Histórico paginado de mensagens com paginação cursor-based.
Parâmetros: `?limit=50&cursor=<messageId>`

---

### Modificado

#### `index.js`
- `app.listen(PORT)` → `createServer(app)` + `httpServer.listen(PORT)`
- Socket.IO inicializado via `initSocket(httpServer, CLIENT_ORIGIN)`

#### `src/modules/chat/controllers/chat.controller.js`
- Substituído `getStreamToken` por `getMessages` (histórico paginado)

#### `src/modules/chat/routes/chat.route.js`
- Substituída rota `GET /token` por `GET /messages/:friendId`

#### `backend/README.md`
- Atualizada stack, variáveis de ambiente e tabela de endpoints

---

### Arquitetura de videochamada

```
Caller ──call:request──> Servidor ──call:incoming──> Callee
Callee ──call:accept───> Servidor ──call:accepted──> Caller
Caller ──webrtc:offer──> Servidor ──webrtc:offer───> Callee
Callee ──webrtc:answer─> Servidor ──webrtc:answer──> Caller
Ambos  ──webrtc:ice-candidate (bidirecional) ──>
[Conexão P2P estabelecida — servidor sai do caminho de mídia]
```

O servidor nunca interpreta SDP ou ICE — apenas faz relay. Toda a mídia trafega diretamente entre os browsers. Para redes com NAT restritivo, um servidor STUN (Google STUN gratuito: `stun:stun.l.google.com:19302`) ou TURN (coturn auto-hospedado) pode ser necessário.
