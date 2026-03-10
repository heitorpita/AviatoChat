# 11 — Upload de Fotos (Perfil + Chat)
**Data:** 2026-03-10

## Requirements
- Foto de perfil: upload de arquivo real (substituir campo de URL)
- Preview da foto antes de salvar
- Chat: enviar imagens nas mensagens
- Armazenamento: servidor local via `multer` (pasta `backend/uploads/`)
- Limite de 5MB por arquivo
- Formatos aceitos: jpg, jpeg, png, gif, webp

## Spec

### Backend

#### 1. Instalar dependência
```bash
cd backend && npm install multer
```

#### 2. Criar middleware — `backend/src/middleware/upload.js`
```js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Tipo de arquivo não permitido"), false);
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
```

#### 3. Criar rota — `backend/src/routes/upload.routes.js`
```js
import { Router } from "express";
import { protegerRota } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/", protegerRota, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ erro: "Nenhum arquivo enviado" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

export default router;
```

#### 4. Registrar rota e servir static — `backend/index.js`
```js
import uploadRoutes from "./src/routes/upload.routes.js";
import path from "path";

// Servir arquivos de upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rota de upload
app.use("/api/upload", uploadRoutes);
```

#### 5. Criar pasta `backend/uploads/` e adicionar ao `.gitignore`
```
/backend/uploads/*
!/backend/uploads/.gitkeep
```

#### 6. Atualizar Prisma schema — adicionar `imageUrl` às mensagens
```prisma
model Message {
  id        String   @id @default(cuid())
  roomId    String
  senderId  String
  text      String?          // tornar opcional (pode ser só imagem)
  imageUrl  String?          // ← novo campo
  readAt    DateTime?
  createdAt DateTime @default(now())
  sender    User     @relation(fields: [senderId], references: [id])

  @@index([roomId, createdAt])
}
```
```bash
npx prisma migrate dev --name add-message-image
```

#### 7. Atualizar socket — `backend/src/lib/socket.js`
```js
// Ao salvar mensagem, incluir imageUrl
const message = await prisma.message.create({
  data: { roomId, senderId: socket.userId, text, imageUrl },
});
io.to(roomId).emit("chat:message", message);
```

---

### Frontend

#### Upload helper — `frontend/src/lib/api.js`
```js
export const uploadFile = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await axiosInstance.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.url; // "/uploads/timestamp-random.jpg"
};
```

#### Foto de Perfil — `OnboardingPage.jsx` e `ProfilePage.jsx`
- Trocar `<input type="url">` por `<input type="file" accept="image/*">`
- Ao selecionar arquivo: mostrar preview com `URL.createObjectURL(file)`
- Ao submeter: fazer `uploadFile(file)` → usar URL retornada como `profilePic`

```jsx
const [preview, setPreview] = useState(user?.profilePic || null);

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setPreview(URL.createObjectURL(file));
  setSelectedFile(file);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  let profilePic = formData.profilePic;
  if (selectedFile) {
    profilePic = await uploadFile(selectedFile);
  }
  // submeter com profilePic
};
```

**Visual:**
```jsx
<div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-brand-teal mx-auto">
  {preview
    ? <img src={preview} alt="foto" className="w-full h-full object-cover" />
    : <div className="w-full h-full bg-brand-sky flex items-center justify-center text-2xl">
        {initials}
      </div>
  }
  <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
    <CameraIcon className="text-white w-6 h-6" />
    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
  </label>
</div>
```

#### Fotos no Chat — `ChatPage.jsx`

**Botão de anexo:**
```jsx
<label className="cursor-pointer text-brand-teal hover:text-brand-navy transition-colors">
  <ImageIcon className="w-5 h-5" />
  <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
</label>
```

**Enviar imagem:**
```js
const handleImageSelect = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const imageUrl = await uploadFile(file);
  socket.emit("chat:message", { friendId, text: "", imageUrl });
};
```

**Renderizar imagem no balão:**
```jsx
{msg.imageUrl && (
  <img
    src={msg.imageUrl}
    alt="imagem"
    className="max-w-xs rounded-lg cursor-pointer"
    onClick={() => window.open(msg.imageUrl, "_blank")}
  />
)}
{msg.text && <p>{msg.text}</p>}
```

## Arquivos a Modificar/Criar
| Arquivo | Ação |
|---------|------|
| `backend/src/middleware/upload.js` | Criar |
| `backend/src/routes/upload.routes.js` | Criar |
| `backend/uploads/.gitkeep` | Criar |
| `backend/index.js` | Adicionar static + rota |
| `backend/prisma/schema.prisma` | `text` opcional + `imageUrl` |
| `backend/src/lib/socket.js` | Salvar `imageUrl` na mensagem |
| `frontend/src/lib/api.js` | Função `uploadFile` |
| `frontend/src/pages/OnboardingPage.jsx` | File input + preview |
| `frontend/src/pages/ProfilePage.jsx` | File input + preview |
| `frontend/src/pages/ChatPage.jsx` | Botão imagem + render |

## Verificação
1. Upload de foto de perfil: selecionar arquivo → ver preview → salvar → foto aparece no perfil
2. Foto de perfil persiste após logout/login
3. Chat: clicar no ícone de imagem → selecionar foto → foto aparece no chat de ambos os lados
4. Arquivo > 5MB: exibir mensagem de erro
5. Arquivo não-imagem: recusado silenciosamente ou com erro amigável
6. URL `/uploads/arquivo.jpg` acessível no browser
