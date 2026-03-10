# 09 — Fix: Histórico de Mensagens no Chat
**Data:** 2026-03-10

## Requirements
- Ao navegar entre conversas (trocar de amigo), o histórico de mensagens deve recarregar corretamente
- Histórico deve persistir entre navegações (sair da ChatPage e voltar)
- Scroll automático para a mensagem mais recente ao carregar e ao receber nova mensagem
- Socket deve se reconectar ao room correto ao trocar de amigo

## Problema Identificado
O endpoint `GET /api/chat/messages/:friendId` já funciona e persiste no banco. O problema está no frontend:

1. **Query key incorreta ou sem `friendId`** — TanStack Query não distingue conversas diferentes, ou não reexecuta ao trocar de amigo
2. **`staleTime` muito alto** — dados em cache não são refrescados ao retornar à página
3. **`chat:join` emitido só no mount** — ao trocar de amigo dentro da mesma ChatPage, o socket não entra no novo room

## Spec

### Backend
Nenhuma alteração necessária. O endpoint de histórico já está correto:
- `GET /api/chat/messages/:friendId?limit=50&cursor=<id>` — retorna mensagens paginadas com `nextCursor`

### Frontend — `ChatPage.jsx`

**Query key:**
```js
// ERRADO: query sem friendId → cache compartilhado entre conversas
useQuery({ queryKey: ["messages"], queryFn: () => getMessages(friendId) })

// CORRETO: friendId na key → cache separado por conversa
useQuery({ queryKey: ["messages", friendId], queryFn: () => getMessages(friendId), staleTime: 0 })
```

**Socket join ao trocar de amigo:**
```js
useEffect(() => {
  if (!friendId) return;
  socket.emit("chat:join", { friendId });
  return () => {/* leave anterior se necessário */};
}, [friendId]); // dep: friendId, não só no mount
```

**Scroll automático:**
```js
const bottomRef = useRef(null);

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]); // re-executa a cada nova mensagem
```

**Limpeza de estado ao trocar de amigo:**
```js
useEffect(() => {
  setMessages([]); // limpa estado local antes de carregar novo histórico
}, [friendId]);
```

### Frontend — `lib/api.js` (ou equivalente)
```js
export const getMessages = (friendId, cursor) =>
  axiosInstance.get(`/chat/messages/${friendId}`, { params: { limit: 50, cursor } });
```

## Arquivos a Modificar
- `frontend/src/pages/ChatPage.jsx` — query key, socket join, scroll, limpeza de estado
- `frontend/src/lib/api.js` — confirmar assinatura de `getMessages`

## Verificação
1. Abrir chat com Amigo A → ver histórico
2. Clicar em Amigo B → histórico de B carrega (sem mensagens de A)
3. Voltar para Amigo A → histórico de A reaparece
4. Sair da ChatPage e voltar → histórico mantido (TanStack Query cache)
5. Enviar mensagem → scroll automático para o final
