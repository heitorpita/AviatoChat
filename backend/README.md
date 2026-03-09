# AviatoChat — Backend

API REST + WebSocket para o AviatoChat, plataforma de chat e videochamada entre pessoas de idiomas diferentes.

## Stack

| Tecnologia | Uso |
|-----------|-----|
| Node.js (ESM) + Express 5 | Servidor HTTP e API REST |
| Socket.IO | Chat em tempo real e sinalização WebRTC |
| WebRTC (nativo do browser) | Chamadas de vídeo P2P (gratuito, sem serviço externo) |
| Prisma 7 ORM + PostgreSQL | Banco de dados relacional |
| JWT | Autenticação stateless |
| bcryptjs | Hash de senhas |

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

```env
PORT=5001
DATABASE_URL=postgresql://user:password@host:5432/aviatochat
JWT_SECRET_KEY=sua_chave_jwt_secreta
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

> `STREAM_API_KEY` e `STREAM_API_SECRET` foram removidas — o chat agora usa Socket.IO nativo.

### 3. Criar tabelas no banco

```bash
npx prisma db push
```

### 4. Iniciar servidor

```bash
# Desenvolvimento (hot reload)
npm run dev

# Produção
npm start
```

---

## API REST

### Usuários — `/api/users`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/signup` | — | Cadastro |
| POST | `/login` | — | Login |
| POST | `/logout` | JWT | Logout |
| PUT | `/onboard` | JWT | Configurar perfil e idiomas |
| GET | `/me` | JWT | Dados do usuário logado |
| GET | `/chat-users` | JWT | Usuários com idiomas compatíveis |
| GET | `/friends` | JWT | Lista de amigos |
| GET | `/` | JWT + Admin | Todos os usuários |

### Amizades — `/api/friends`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/request/:userId` | JWT | Enviar solicitação |
| PUT | `/request/:requestId/accept` | JWT | Aceitar solicitação |
| PUT | `/request/:requestId/reject` | JWT | Recusar solicitação |
| GET | `/requests` | JWT | Solicitações pendentes recebidas |

### Chat — `/api/chat`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/messages/:friendId` | JWT | Histórico de mensagens (paginado por cursor) |

**Paginação:** `?limit=50&cursor=<id da mensagem mais antiga já carregada>`

---

## WebSocket (Socket.IO)

Conexão no cliente:

```js
const socket = io("http://localhost:5001", {
  auth: { token: "seu_jwt_aqui" }
});
```

Ver [src/lib/README.md](src/lib/README.md) para documentação completa dos eventos e fluxo de videochamada WebRTC.

---

## Estrutura

```
backend/
├── index.js                          # Entry point: Express + Socket.IO
├── prisma/
│   └── schema.prisma                 # Modelos: User, FriendRequest, Message
└── src/
    ├── config/
    │   └── prisma.js                 # Cliente Prisma (singleton)
    ├── lib/
    │   └── socket.js                 # Servidor Socket.IO + sinalização WebRTC
    ├── middlewares/
    │   ├── authentication.middleware.js
    │   └── autorization.middleware.js
    └── modules/
        ├── user/
        ├── friends/
        └── chat/
```

---

## Modelos do banco

### User
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (cuid) | Identificador único |
| fullName | String | Nome completo |
| email | String (unique) | Email |
| password | String | Senha (hash bcrypt) |
| nativeLanguage | String | Idioma nativo |
| learningLanguage | String | Idioma em aprendizado |
| location | String | Localização |
| bio | String | Biografia |
| profilePic | String | URL da foto de perfil |
| isOnboarded | Boolean | Perfil configurado |
| role | Enum (USER/ADMIN) | Perfil de acesso |

### FriendRequest
| Campo | Tipo | Descrição |
|-------|------|-----------|
| senderId | String | Quem enviou |
| receiverId | String | Quem recebeu |
| status | Enum | PENDING / ACCEPTED / REJECTED |

### Message
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String (cuid) | Identificador único |
| roomId | String | ID da sala (gerado a partir dos dois userId) |
| senderId | String | Remetente |
| text | String | Conteúdo da mensagem |
| readAt | DateTime? | Quando foi lida (null = não lida) |
| createdAt | DateTime | Data de envio |
