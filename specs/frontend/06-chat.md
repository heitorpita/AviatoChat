# 06 — Chat em Tempo Real

## Requirements
- ChatPage com lista de amigos à esquerda e conversa à direita
- Mensagens carregadas via HTTP (cursor-based pagination)
- Novas mensagens recebidas em tempo real via Socket.IO
- Indicador de "digitando" (typing indicator) efêmero
- Marcar mensagens como lidas ao visualizar a conversa
- Scroll automático para a última mensagem
- Layout responsivo (mobile: apenas um painel por vez)

## Spec
A ChatPage combina HTTP para o histórico e Socket.IO para tempo real. Ao entrar em uma conversa, emite `chat:join`. Mensagens novas chegam via `chat:message`. O typing indicator é gerenciado com debounce no input e o evento `chat:typing`. Ao abrir a conversa, emite `chat:read` para marcar como lidas.

**Eventos Socket.IO usados:**
- Emit: `chat:join` `{ friendId }`
- Emit: `chat:message` `{ friendId, text }`
- Emit: `chat:typing` `{ friendId, isTyping }`
- Emit: `chat:read` `{ friendId }`
- Listen: `chat:message` — nova mensagem
- Listen: `chat:typing` — `{ senderId, isTyping }`
- Listen: `chat:read` — `{ readerId, readAt }`

**Visual:**
- Sidebar de conversas: bg `#023047`
- Área de chat: fundo `#f0f9ff` (azul muito claro)
- Balão do remetente: bg `#219ebc` texto branco, alinhado à direita
- Balão do receptor: bg branco borda `rgba(33,158,188,0.2)`, alinhado à esquerda
- Indicador de lido: ícone de check duplo em `#ffb703`
- Input de mensagem: borda `#219ebc` focus

## Tasks
- [ ] Criar `src/hooks/useSocket.js` — setup de eventos de chat + cleanup
- [ ] Criar `src/pages/ChatPage.jsx` — layout dois painéis, lista de amigos, área de mensagens
- [ ] Implementar carregamento de histórico com `getMessages` (TanStack Query)
- [ ] Implementar scroll automático para última mensagem
- [ ] Implementar envio de mensagem via socket com `chat:message`
- [ ] Implementar typing indicator com debounce (500ms)
- [ ] Implementar `chat:read` ao focar a conversa
- [ ] Exibir timestamp nas mensagens (ex: "14:32")
- [ ] Indicar mensagens não lidas na lista de conversas
