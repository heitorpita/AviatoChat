# 07 — Chamadas de Vídeo (WebRTC)

## Requirements
- Botão de chamada de vídeo na ChatPage e FriendsPage
- Modal de chamada recebida com opções de aceitar/rejeitar
- CallPage com vídeo local e vídeo remoto
- Suporte a encerramento de chamada por qualquer lado
- Sinalização via Socket.IO (o backend é relay puro)

## Spec
WebRTC peer-to-peer com sinalização via Socket.IO. O backend apenas retransmite os eventos sem interpretar. O fluxo é: caller emite `call:request` → callee recebe `call:incoming` e aceita → troca de offer/answer/ICE via socket → conexão P2P estabelecida.

**Fluxo de chamada:**
1. Caller: emit `call:request { targetUserId }`
2. Callee: recebe `call:incoming { callerId }` → mostra `IncomingCallModal`
3. Callee aceita: emit `call:accept { callerId }` → ambos navegam para `/call/:friendId`
4. Caller: cria RTCPeerConnection, gera offer, emit `webrtc:offer { targetUserId, sdp }`
5. Callee: recebe offer, gera answer, emit `webrtc:answer { targetUserId, sdp }`
6. Ambos trocam ICE candidates via `webrtc:ice-candidate`
7. Conexão estabelecida — streams de vídeo ativos

**Eventos Socket.IO:**
- Emit/Listen: `call:request`, `call:incoming`, `call:accept`, `call:accepted`, `call:reject`, `call:rejected`, `call:end`, `call:ended`
- Emit/Listen: `webrtc:offer`, `webrtc:answer`, `webrtc:ice-candidate`

**Visual:**
- CallPage: fundo escuro `#011a27`, vídeo remoto grande, vídeo local pequeno (canto inferior direito)
- Controles: mute, câmera on/off, encerrar chamada (botão vermelho)
- IncomingCallModal: overlay com avatar do caller, nome, botões aceitar (verde) e rejeitar (vermelho)

## Tasks
- [ ] Criar `src/hooks/useWebRTC.js` — lógica completa de WebRTC + signaling via socket
- [ ] Criar `src/pages/CallPage.jsx` — interface de chamada com dois vídeos e controles
- [ ] Criar `src/components/IncomingCallModal.jsx` — modal de chamada recebida
- [ ] Integrar `IncomingCallModal` no Layout (sempre presente quando autenticado)
- [ ] Adicionar botão de chamada na ChatPage
- [ ] Tratar encerramento de chamada por ambos os lados (`call:end` / `call:ended`)
- [ ] Tratar rejeição e timeout de chamada
