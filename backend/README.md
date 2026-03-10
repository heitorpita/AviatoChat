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
| multer | Upload de imagens (fotos de perfil e chat) |

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
| GET | `/chat-users` | JWT | Todos os usuários onboarded que não são amigos |
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

### Upload — `/api/upload`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/` | JWT | Upload de imagem (form-data, campo `file`) |

**Resposta:** `{ url: "/uploads/filename.jpg" }` — servido em `GET /uploads/filename.jpg`

**Limites:** 5MB por arquivo. Formatos: JPEG, PNG, GIF, WebP.

---

## WebSocket (Socket.IO)

Conexão no cliente:

```js
const socket = io("http://localhost:5001", {
  auth: { token: "seu_jwt_aqui" }
});
```

### Eventos de chat

| Evento | Direção | Payload | Descrição |
|--------|---------|---------|-----------|
| `chat:join` | emit | `{ friendId }` | Entrar na sala |
| `chat:message` | emit | `{ friendId, text?, imageUrl? }` | Enviar mensagem (texto ou imagem) |
| `chat:message` | listen | `{ id, senderId, text, imageUrl, readAt, createdAt }` | Mensagem recebida |
| `chat:typing` | emit | `{ friendId, isTyping }` | Indicador de digitação |
| `chat:read` | emit | `{ friendId }` | Marcar mensagens como lidas |

Ver [src/lib/README.md](src/lib/README.md) para documentação completa dos eventos e fluxo de videochamada WebRTC.

---

## Estrutura

```
backend/
├── index.js                          # Entry point: Express + Socket.IO
├── uploads/                          # Arquivos de upload (imagens)
├── prisma/
│   └── schema.prisma                 # Modelos: User, FriendRequest, Message
└── src/
    ├── config/
    │   └── prisma.js                 # Cliente Prisma (singleton)
    ├── lib/
    │   └── socket.js                 # Servidor Socket.IO + sinalização WebRTC
    ├── middlewares/
    │   ├── authentication.middleware.js
    │   ├── autorization.middleware.js
    │   └── upload.middleware.js      # multer (5MB, somente imagens)
    └── modules/
        ├── user/
        ├── friends/
        ├── chat/
        └── upload/
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
| text | String? | Conteúdo de texto (opcional se imageUrl presente) |
| imageUrl | String? | URL da imagem enviada (opcional) |
| readAt | DateTime? | Quando foi lida (null = não lida) |
| createdAt | DateTime | Data de envio |

---

## Deploy (Coolify / Produção)

Após deploy, aplique as mudanças de schema no container do backend:

```bash
npx prisma db push
```

> Não é necessário `prisma migrate dev` em produção se estiver usando `db push`.
> O `postinstall` já executa `prisma generate` automaticamente.
