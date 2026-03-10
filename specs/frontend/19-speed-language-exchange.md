# 19 — Speed Language Exchange
**Data:** 2026-03-10

## Conceito
Sessões rápidas de 5 minutos entre dois desconhecidos para praticar idiomas.
Inspiração: **Omegle + Tandem** — a ideia é simples o suficiente para viralizar.

Fluxo:
1. Usuário clica em "Quick Match"
2. Sistema encontra outro usuário aguardando (compatível por idioma ou qualquer par)
3. Sessão de vídeo/chat começa com um countdown de 5 min
4. Ao finalizar: opção de adicionar como amigo, estender sessão, ou sair

## Requirements
- Matching entre desconhecidos via fila Socket.IO (sem necessidade de amizade prévia)
- Sessão com contador de 5 minutos visível em tempo real
- Vídeo/áudio via WebRTC (reutiliza sinalização existente)
- Chat de texto opcional durante a sessão (sem persistência no banco)
- Ao terminar: tela de "o que fazer agora?" (adicionar amigo / nova sessão / sair)
- Cancelar fila a qualquer momento antes do match

## Spec

### Backend

**Novos eventos Socket.IO:**

| Evento | Direção | Payload | Descrição |
|--------|---------|---------|-----------|
| `speed:queue-join` | emit (cliente) | `{ targetLanguage? }` | Entrar na fila de matching |
| `speed:queue-leave` | emit (cliente) | — | Sair da fila |
| `speed:matched` | listen (cliente) | `{ sessionId, partnerId, partnerName, partnerPic, timeoutAt }` | Parceiro encontrado |
| `speed:session-end` | listen (cliente) | `{ reason: 'timeout' \| 'partner-left' \| 'manual' }` | Sessão encerrada |
| `speed:message` | emit/listen | `{ sessionId, text }` | Chat efêmero da sessão |
| `speed:add-friend` | emit (cliente) | `{ partnerId }` | Solicitar amizade ao parceiro |

**Lógica de matching (socket.js ou speed.socket.js):**
```js
// Fila em memória (Map por idioma ou pool geral)
const speedQueue = new Map() // userId → { socket, targetLanguage, joinedAt }

socket.on('speed:queue-join', ({ targetLanguage } = {}) => {
  // Procurar par na fila
  for (const [candidateId, candidate] of speedQueue) {
    if (candidateId === userId) continue
    // Match: targetLanguage compatível OU sem filtro
    if (!targetLanguage || candidate.targetLanguage === user.nativeLanguage) {
      speedQueue.delete(candidateId)
      const sessionId = `speed:${[userId, candidateId].sort().join(':')}`
      const timeoutAt = Date.now() + 5 * 60 * 1000
      socket.join(sessionId)
      candidate.socket.join(sessionId)
      io.to(sessionId).emit('speed:matched', { sessionId, timeoutAt, /* dados dos parceiros */ })
      // Timer: encerrar sessão após 5 min
      setTimeout(() => io.to(sessionId).emit('speed:session-end', { reason: 'timeout' }), 5 * 60 * 1000)
      return
    }
  }
  // Nenhum par: entrar na fila
  speedQueue.set(userId, { socket, targetLanguage, joinedAt: Date.now() })
})

socket.on('speed:queue-leave', () => speedQueue.delete(userId))
socket.on('disconnect', () => speedQueue.delete(userId))
```

**Sinalização WebRTC:** reutiliza `webrtc:offer / webrtc:answer / webrtc:ice-candidate` já existentes, usando `sessionId` como roomId.

**Sem persistência no banco** — sessões são efêmeras. Apenas a solicitação de amizade (se aceita) usa o modelo `FriendRequest` existente.

### Frontend

**Nova página:** `frontend/src/pages/SpeedExchangePage.jsx`

**Estados da tela:**
1. **Idle** — botão "⚡ Quick Match" + seletor de idioma alvo
2. **Queuing** — spinner "Procurando parceiro..." + botão Cancelar + tempo na fila
3. **Session** — split view: vídeo do parceiro (grande) + vídeo próprio (PiP) + chat lateral + countdown "4:32"
4. **End** — tela pós-sessão: foto/nome do parceiro + botões "Adicionar como amigo" / "Nova sessão" / "Voltar"

**Componentes:**
- `SpeedCountdown` — timer regressivo com barra de progresso
- `SpeedChat` — chat efêmero (mensagens só em memória, limpas ao encerrar)
- `SpeedVideoGrid` — similar ao CallPage, reutilizar lógica WebRTC

**Rota nova:** `/speed`

**Navegação:** adicionar item "⚡ Speed" no Sidebar (desktop) e bottom nav (mobile)

### Considerações de produto
- Filtro de idioma opcional: sem filtro = mais matches rápidos; com filtro = prática mais direcionada
- Extensão de sessão ("+5 min"): ambos os usuários devem concordar (emit `speed:extend-request` / `speed:extend-accept`)
- Moderação: botão de reportar parceiro durante a sessão
- Sem câmera: modo texto-only (fallback para usuários sem câmera)

## Arquivos a Criar/Modificar
- `backend/src/lib/socket.js` — adicionar lógica da fila Speed
- `frontend/src/pages/SpeedExchangePage.jsx` — nova página
- `frontend/src/components/layout/Sidebar.jsx` — novo item de navegação
- `frontend/src/App.jsx` — nova rota `/speed`

## Potencial Viral
- Simplicidade extrema: 1 clique → começa a praticar com alguém
- Timer cria urgência e quebra o gelo ("só 5 minutos mesmo")
- Pós-sessão: adicionar amigo → converte descoberta em relacionamento duradouro no app
- Diferencial: foco em idiomas (não aleatório como Omegle, mas direcionado como Tandem)
