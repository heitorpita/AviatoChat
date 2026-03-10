# 20 — Language Rooms (Salas de Conversação)
**Data:** 2026-03-10

## Conceito
Salas públicas permanentes organizadas por idioma, onde qualquer usuário pode entrar para:
- **Chat de texto** em grupo (mensagens recentes, estilo lobby)
- **Video group call** (até 6–8 participantes simultâneos)

Inspiração: **Discord** — mas cada "servidor" é um idioma.

```
🇺🇸 English Room      — 12 online
🇪🇸 Spanish Room      — 8 online
🇧🇷 Portuguese Room   — 5 online
🇫🇷 French Room       — 3 online
🇩🇪 German Room       — 2 online
🇯🇵 Japanese Room     — 1 online
```

## Requirements
- Lista de salas fixas por idioma (configurable no backend)
- Contador de usuários online por sala em tempo real
- Chat de texto: mensagens visíveis para todos na sala, últimas 50 exibidas (sem scroll infinito no MVP)
- Mensagens de sala NÃO precisam ser persistidas além das últimas 50 (cache em memória ou tabela separada)
- Video group call: WebRTC mesh para até 6 pessoas simultâneas na sala de vídeo
- Entrar/sair de sala a qualquer momento
- Mostrar lista de participantes ativos na sala

## Spec

### Backend

**Novo modelo Prisma (opcional — para persistir histórico recente):**
```prisma
model RoomMessage {
  id        String   @id @default(cuid())
  roomSlug  String   // "en", "es", "pt", etc.
  senderId  String
  text      String
  createdAt DateTime @default(now())
  sender    User     @relation(fields: [senderId], references: [id], onDelete: Cascade)
  @@index([roomSlug, createdAt])
}
```

**Novo endpoint REST:**
```
GET  /api/rooms              → lista de salas com contagem de online
GET  /api/rooms/:slug/messages  → últimas 50 mensagens da sala
```

**Salas pré-definidas (constante no backend):**
```js
export const LANGUAGE_ROOMS = [
  { slug: 'en', name: 'English Room', flag: '🇺🇸', language: 'English' },
  { slug: 'es', name: 'Spanish Room', flag: '🇪🇸', language: 'Spanish' },
  { slug: 'pt', name: 'Portuguese Room', flag: '🇧🇷', language: 'Portuguese' },
  { slug: 'fr', name: 'French Room', flag: '🇫🇷', language: 'French' },
  { slug: 'de', name: 'German Room', flag: '🇩🇪', language: 'German' },
  { slug: 'ja', name: 'Japanese Room', flag: '🇯🇵', language: 'Japanese' },
]
```

**Novos eventos Socket.IO:**

| Evento | Direção | Payload | Descrição |
|--------|---------|---------|-----------|
| `room:join` | emit | `{ slug }` | Entrar na sala |
| `room:leave` | emit | `{ slug }` | Sair da sala |
| `room:message` | emit | `{ slug, text }` | Enviar mensagem na sala |
| `room:message` | listen | `{ id, slug, sender: {id,name,pic}, text, createdAt }` | Nova mensagem na sala |
| `room:participants` | listen | `{ slug, participants: [{id,name,pic}] }` | Lista atualizada de participantes |
| `room:online-counts` | listen | `{ counts: { en: 3, es: 1, ... } }` | Contagem global de online por sala |

**Lógica de sala (socket.js):**
```js
// Mapa de sala → Set de userId
const roomParticipants = new Map() // slug → Set<userId>

socket.on('room:join', async ({ slug }) => {
  const socketRoom = `room:${slug}`
  socket.join(socketRoom)
  if (!roomParticipants.has(slug)) roomParticipants.set(slug, new Set())
  roomParticipants.get(slug).add(userId)
  // Buscar últimas 50 mensagens e emitir para o usuário que entrou
  // Notificar todos da sala: lista atualizada de participantes
  io.to(socketRoom).emit('room:participants', { slug, participants: [...] })
  // Notificar todos os conectados: contagens atualizadas
  io.emit('room:online-counts', { counts: buildCounts() })
})
```

**Video em sala — WebRTC Mesh (MVP):**
- Reutilizar sinalização WebRTC existente (`webrtc:offer/answer/ice-candidate`)
- roomId = `room-video:${slug}` para as salas de vídeo
- Cada novo participante recebe lista de peerIds na sala de vídeo → cria conexão com cada um
- Limite: 6–8 participantes para manter qualidade (mesh = N*(N-1)/2 conexões)

**Para escalar além de 6–8 (roadmap):**
- Migrar para SFU: LiveKit (self-hosted ou cloud free tier) ou mediasoup
- LiveKit Cloud free: até 100k mins/mês gratuitos

### Frontend

**Nova página de lista:** `frontend/src/pages/RoomsPage.jsx`
- Grid de cards de sala: flag, nome, contagem de online
- Botão "Entrar" em cada card
- Badge com número de participantes em tempo real (via socket `room:online-counts`)

**Nova página de sala:** `frontend/src/pages/RoomPage.jsx`
- **Layout:** 3 colunas no desktop (participantes | chat | vídeo), empilhado no mobile
- **Participantes:** lista de avatares com nome
- **Chat:** histórico das últimas 50 msgs + input de envio
- **Vídeo:** toggle para entrar/sair do video group call
  - Grid de vídeos 2x2 ou 3x3 adaptativo
  - Botões: mute mic, câmera on/off, sair do vídeo
- Botão "Sair da sala" (volta para lista)

**Rotas novas:**
- `/rooms` — lista de salas
- `/rooms/:slug` — sala específica

**Navegação:** adicionar item "Salas" no Sidebar e bottom nav

**Componentes novos:**
- `RoomCard` — card de sala com flag, nome, online count
- `RoomChatPanel` — chat de grupo em tempo real
- `RoomVideoGrid` — grid de vídeos dos participantes
- `RoomParticipantsList` — lista de quem está na sala

## Considerações de Produto
- **Sem cadastro de sala** — salas são fixas e sempre existem (mesmo sem ninguém)
- **Persistência de mensagens** — últimas 50 por sala (auto-delete mensagens antigas)
- **Moderação** — flag de mensagem + banir usuário da sala (role ADMIN)
- **Texto do chat bilíngue** — cada mensagem pode ter botão "Traduzir" (spec 17)
- **Badge de sala no perfil** — "fluente em English Room" baseado em tempo online (gamificação futura)

## Diferencial vs. Spec 19
| Speed Exchange | Language Rooms |
|----------------|----------------|
| 1-to-1 | Muitos-para-muitos |
| 5 min (efêmero) | Permanente (sempre ativo) |
| Alta energia / engajamento | Ambiente contínuo / comunidade |
| Viral por simplicidade | Viral por pertencimento |

## Arquivos a Criar/Modificar
- `backend/prisma/schema.prisma` — novo model `RoomMessage`
- `backend/src/lib/socket.js` — lógica de salas
- `backend/src/modules/rooms/` — controller + routes (novo módulo)
- `frontend/src/pages/RoomsPage.jsx` — nova página (lista)
- `frontend/src/pages/RoomPage.jsx` — nova página (sala)
- `frontend/src/components/layout/Sidebar.jsx` — novo item de navegação
- `frontend/src/App.jsx` — novas rotas
