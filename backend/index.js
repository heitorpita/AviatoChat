import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";

import userRouter from "./src/modules/user/routes/user.route.js";
import friendsRouter from "./src/modules/friends/routes/friends.route.js";
import chatRouter from "./src/modules/chat/routes/chat.route.js";
import uploadRouter from "./src/modules/upload/routes/upload.route.js";
import { initSocket } from "./src/lib/socket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const isDev = process.env.NODE_ENV !== "production";

// ─── Middlewares globais ──────────────────────────────────────────
app.use(
  cors({
    origin: isDev
      ? (origin, cb) => cb(null, true) // aceita qualquer origem em dev
      : CLIENT_ORIGIN,
  })
);
app.use(express.json());

// ─── Arquivos estáticos (uploads) ─────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Rotas ───────────────────────────────────────────────────────
app.use("/api/users", userRouter);
app.use("/api/friends", friendsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/upload", uploadRouter);

// ─── Handler de erros global ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  console.error(`[Erro] ${status} - ${err.message}`);
  res.status(status).json({ erro: err.message || "Erro interno do servidor" });
});

// ─── Socket.IO ────────────────────────────────────────────────────
initSocket(httpServer, isDev ? "*" : CLIENT_ORIGIN);

httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} [${process.env.NODE_ENV}]`);
});
