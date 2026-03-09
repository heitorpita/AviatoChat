# src/lib — Socket.IO + Sinalização WebRTC

## socket.js

Inicializa e configura o servidor Socket.IO, gerencia usuários online e faz relay dos eventos de WebRTC para videochamadas P2P.

### Autenticação

Toda conexão Socket.IO deve enviar o JWT no handshake:

```js
const socket = io("http://localhost:5001", {
  auth: { token: localStorage.getItem("token") }
});
```

O servidor valida o token e rejeita conexões inválidas com `Error("Token inválido ou expirado")`.

---

## Usuários Online

O servidor mantém um registry em memória `Map<userId, Set<socketId>>`.

- Suporta múltiplas abas/dispositivos por usuário
- A cada conexão/desconexão, o evento `users:online` é emitido para **todos** com a lista atualizada de userIds online

---

## Eventos de Chat

### Client → Server

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `chat:join` | `{ friendId: string }` | Entra na sala de chat com um amigo |
| `chat:message` | `{ friendId: string, text: string }` | Envia uma mensagem (persiste no DB) |
| `chat:typing` | `{ friendId: string, isTyping: boolean }` | Indicador de digitação (efêmero) |
| `chat:read` | `{ friendId: string }` | Marca mensagens do amigo como lidas |

### Server → Client

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `users:online` | `string[]` | Lista atualizada de userIds online |
| `chat:joined` | `{ roomId: string }` | Confirmação de entrada na sala |
| `chat:message` | `{ id, roomId, senderId, text, readAt, createdAt }` | Nova mensagem na sala |
| `chat:typing` | `{ senderId: string, isTyping: boolean }` | Status de digitação do amigo |
| `chat:read` | `{ readerId: string, readAt: Date }` | Amigo leu as mensagens |
| `chat:error` | `{ message: string }` | Erro ao processar mensagem |

### roomId

O `roomId` é gerado deterministicamente a partir dos dois userIds:

```js
function getRoomId(userIdA, userIdB) {
  return [userIdA, userIdB].sort().join("_");
}
```

Isso garante que `getRoomId(A, B) === getRoomId(B, A)` — a mesma sala, independente de quem abre o chat primeiro.

---

## Eventos de Videochamada (WebRTC)

O servidor funciona apenas como **relay de sinalização**. Toda a mídia (vídeo/áudio) trafega diretamente entre os browsers via WebRTC P2P — o servidor sai do caminho após o ICE negotiation.

### Fluxo completo

```
Caller                    Servidor                    Callee
  |                          |                           |
  |── call:request ─────────>|                           |
  |                          |── call:incoming ─────────>|
  |                          |<── call:accept ────────────|
  |<── call:accepted ────────|                           |
  |                          |                           |
  | [ambos criam RTCPeerConnection e capturam mídia]     |
  |                          |                           |
  |── webrtc:offer ─────────>|                           |
  |                          |── webrtc:offer ──────────>|
  |                          |<── webrtc:answer ──────────|
  |<── webrtc:answer ────────|                           |
  |                          |                           |
  |── webrtc:ice-candidate ─>|                           |
  |                          |── webrtc:ice-candidate ──>|
  |                          |<── webrtc:ice-candidate ───|
  |<── webrtc:ice-candidate ─|                           |
  |                          |                           |
  | [conexão P2P estabelecida — mídia flui diretamente]  |
  |                          |                           |
  |── call:end ─────────────>|                           |
  |                          |── call:ended ────────────>|
```

### Client → Server (sinalização)

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `call:request` | `{ targetUserId: string }` | Iniciar chamada |
| `call:accept` | `{ callerId: string }` | Aceitar chamada |
| `call:reject` | `{ callerId: string }` | Rejeitar chamada |
| `call:end` | `{ targetUserId: string }` | Encerrar chamada |
| `webrtc:offer` | `{ targetUserId: string, sdp: RTCSessionDescription }` | Enviar oferta SDP |
| `webrtc:answer` | `{ targetUserId: string, sdp: RTCSessionDescription }` | Enviar resposta SDP |
| `webrtc:ice-candidate` | `{ targetUserId: string, candidate: RTCIceCandidate }` | Enviar candidato ICE |

### Server → Client (sinalização)

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `call:incoming` | `{ callerId: string }` | Chamada recebida |
| `call:accepted` | `{ calleeId: string }` | Chamada aceita pelo destinatário |
| `call:rejected` | `{ calleeId: string }` | Chamada rejeitada |
| `call:ended` | `{ by: string }` | Chamada encerrada pelo outro lado |
| `webrtc:offer` | `{ from: string, sdp: RTCSessionDescription }` | Oferta SDP recebida |
| `webrtc:answer` | `{ from: string, sdp: RTCSessionDescription }` | Resposta SDP recebida |
| `webrtc:ice-candidate` | `{ from: string, candidate: RTCIceCandidate }` | Candidato ICE recebido |

### Implementação no frontend (exemplo mínimo)

```js
// Caller: iniciar chamada
socket.emit("call:request", { targetUserId: friendId });

// Caller: quando aceito, criar RTCPeerConnection e enviar oferta
socket.on("call:accepted", async ({ calleeId }) => {
  const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

  pc.onicecandidate = ({ candidate }) => {
    if (candidate) socket.emit("webrtc:ice-candidate", { targetUserId: calleeId, candidate });
  };

  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  stream.getTracks().forEach(track => pc.addTrack(track, stream));

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit("webrtc:offer", { targetUserId: calleeId, sdp: pc.localDescription });
});

// Callee: receber oferta e responder
socket.on("webrtc:offer", async ({ from, sdp }) => {
  const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
  await pc.setRemoteDescription(sdp);

  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  stream.getTracks().forEach(track => pc.addTrack(track, stream));

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit("webrtc:answer", { targetUserId: from, sdp: pc.localDescription });
});

// Ambos: ICE candidates
socket.on("webrtc:ice-candidate", async ({ candidate }) => {
  await pc.addIceCandidate(candidate);
});
```

> **STUN server:** o Google disponibiliza `stun:stun.l.google.com:19302` gratuitamente. Para conexões em redes corporativas com NAT restritivo, pode ser necessário um servidor TURN (ex: coturn auto-hospedado).
