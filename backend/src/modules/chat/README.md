# Módulo Chat

Fornece acesso ao histórico de mensagens via REST. O envio em tempo real é feito pelo Socket.IO (ver [src/lib/README.md](../../lib/README.md)).

## Endpoints

### `GET /api/chat/messages/:friendId`

Retorna o histórico de mensagens entre o usuário autenticado e um amigo.

**Auth:** JWT obrigatório (`Authorization: Bearer <token>`)

**Query params:**

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `limit` | number | 50 | Quantidade de mensagens (máx. 100) |
| `cursor` | string | — | ID da mensagem mais antiga já carregada (para paginação) |

**Resposta:**

```json
{
  "sucesso": true,
  "messages": [
    {
      "id": "cuid...",
      "senderId": "cuid...",
      "text": "Olá!",
      "readAt": null,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "nextCursor": "cuid..."
}
```

- `messages` vem ordenado do mais antigo para o mais recente
- `nextCursor` é o `id` da mensagem mais antiga retornada — passe como `?cursor=` para carregar mensagens anteriores
- `nextCursor` é `null` quando não há mais mensagens

**Exemplo de paginação:**

```js
// Primeira carga (50 mais recentes)
const res = await fetch("/api/chat/messages/friendId123", { headers });
const { messages, nextCursor } = await res.json();

// Carregar mais antigas (scroll infinito para cima)
const res2 = await fetch(`/api/chat/messages/friendId123?cursor=${nextCursor}`, { headers });
```

## roomId

As mensagens são armazenadas em salas identificadas por `roomId`:

```
roomId = [userId, friendId].sort().join("_")
```

Essa lógica é compartilhada entre o controller REST e o handler Socket.IO via a função `getRoomId` exportada de `src/lib/socket.js`.
