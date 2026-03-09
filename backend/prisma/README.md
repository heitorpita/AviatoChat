# Prisma — Schema e Migrations

## Comandos úteis

```bash
# Sincronizar schema com o banco (dev — sem migration history)
npx prisma db push

# Criar e aplicar migration (recomendado para produção)
npx prisma migrate dev --name nome_da_mudanca

# Regenerar o Prisma Client após alterar o schema
npx prisma generate

# Abrir o Prisma Studio (interface visual do banco)
npx prisma studio
```

## Modelos

### User

Usuário da plataforma.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (cuid) | Chave primária |
| fullName | String | Nome completo |
| email | String (unique) | Email de acesso |
| password | String | Senha (hash bcrypt) |
| nativeLanguage | String | Idioma nativo |
| learningLanguage | String | Idioma em aprendizado |
| location | String | Localização |
| bio | String | Biografia |
| profilePic | String | URL da foto de perfil |
| isOnboarded | Boolean | Onboarding concluído |
| role | Enum (USER/ADMIN) | Perfil de acesso |
| createdAt / updatedAt | DateTime | Timestamps |

**Relações:**
- `friends` / `friendsOf` — amizades bidirecionais (self-join many-to-many)
- `sentRequests` / `receivedRequests` — solicitações de amizade
- `sentMessages` — mensagens enviadas

---

### FriendRequest

Solicitação de amizade entre dois usuários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (cuid) | Chave primária |
| senderId | String | Usuário que enviou |
| receiverId | String | Usuário que recebeu |
| status | Enum | PENDING / ACCEPTED / REJECTED |
| createdAt / updatedAt | DateTime | Timestamps |

**Constraint:** par `(senderId, receiverId)` é único — um usuário não pode enviar mais de uma solicitação para o mesmo destino.

---

### Message

Mensagem de chat persistida entre dois usuários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (cuid) | Chave primária |
| roomId | String | ID da sala (`[userId, friendId].sort().join("_")`) |
| senderId | String | Remetente (FK → User) |
| text | String | Conteúdo |
| readAt | DateTime? | Quando foi lida (null = não lida) |
| createdAt | DateTime | Data de envio |

**Índice:** `(roomId, createdAt)` para busca eficiente do histórico.

---

## Enums

```prisma
enum Role {
  USER
  ADMIN
}

enum FriendRequestStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```
