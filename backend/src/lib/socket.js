import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

// Registry de usuários online: userId → Set de socketIds
// Suporta múltiplas abas abertas pelo mesmo usuário
const onlineUsers = new Map();

/**
 * Gera o roomId determinístico entre dois usuários.
 * Ordenação lexicográfica garante que getRoomId(A,B) === getRoomId(B,A).
 */
export function getRoomId(userIdA, userIdB) {
  return [userIdA, userIdB].sort().join("_");
}

/**
 * Inicializa o servidor Socket.IO e registra todos os handlers.
 * Deve ser chamado uma única vez no index.js.
 */
export function initSocket(httpServer, clientOrigin) {
  const io = new Server(httpServer, {
    cors: {
      origin: clientOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ─── Middleware de autenticação ─────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Token ausente"));
    }
    try {
      const usuario = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.data.usuario = usuario; // { id, perfil }
      next();
    } catch {
      next(new Error("Token inválido ou expirado"));
    }
  });

  // ─── Conexão ────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const userId = socket.data.usuario.id;

    // Registra socket no registry de online
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast da lista de usuários online
    io.emit("users:online", Array.from(onlineUsers.keys()));

    console.log(`[Socket] Conectado: ${userId} (${socket.id})`);

    // ── Helper: envia evento para todos os sockets de um usuário ──
    const emitToUser = (targetUserId, event, data) => {
      const targetSockets = onlineUsers.get(targetUserId);
      if (targetSockets) {
        targetSockets.forEach((sid) => io.to(sid).emit(event, data));
      }
    };

    // ──────────────────────────────────────────────────────────────
    // CHAT
    // ──────────────────────────────────────────────────────────────

    // Entrar na sala de chat com um amigo
    socket.on("chat:join", ({ friendId }) => {
      const roomId = getRoomId(userId, friendId);
      socket.join(roomId);
      socket.emit("chat:joined", { roomId });
    });

    // Enviar mensagem (persiste no banco e retransmite para a sala)
    socket.on("chat:message", async ({ friendId, text, imageUrl }) => {
      const trimmedText = text?.trim() || null;
      if ((!trimmedText && !imageUrl) || !friendId) return;

      const roomId = getRoomId(userId, friendId);

      try {
        const message = await prisma.message.create({
          data: { roomId, senderId: userId, text: trimmedText, imageUrl: imageUrl || null },
          select: {
            id: true,
            roomId: true,
            senderId: true,
            text: true,
            imageUrl: true,
            readAt: true,
            createdAt: true,
          },
        });

        io.to(roomId).emit("chat:message", message);
      } catch (err) {
        console.error("[Socket] chat:message erro:", err.message);
        socket.emit("chat:error", { message: "Erro ao salvar mensagem" });
      }
    });

    // Indicador de digitação (efêmero, não persiste)
    socket.on("chat:typing", ({ friendId, isTyping }) => {
      const roomId = getRoomId(userId, friendId);
      socket.to(roomId).emit("chat:typing", { senderId: userId, isTyping });
    });

    // Confirmação de leitura das mensagens
    socket.on("chat:read", async ({ friendId }) => {
      const roomId = getRoomId(userId, friendId);
      const now = new Date();

      try {
        await prisma.message.updateMany({
          where: { roomId, senderId: friendId, readAt: null },
          data: { readAt: now },
        });

        socket.to(roomId).emit("chat:read", { readerId: userId, readAt: now });
      } catch (err) {
        console.error("[Socket] chat:read erro:", err.message);
      }
    });

    // ──────────────────────────────────────────────────────────────
    // SINALIZAÇÃO WebRTC (o servidor apenas retransmite, nunca interpreta SDP/ICE)
    //
    // Fluxo de chamada:
    //   Caller → call:request → Server → call:incoming → Callee
    //   Callee → call:accept  → Server → call:accepted → Caller
    //   Caller → webrtc:offer → Server → webrtc:offer  → Callee
    //   Callee → webrtc:answer→ Server → webrtc:answer → Caller
    //   Ambos  → webrtc:ice-candidate (bidirecional)
    //   [Conexão P2P estabelecida — servidor sai do caminho de mídia]
    // ──────────────────────────────────────────────────────────────

    socket.on("call:request", ({ targetUserId }) => {
      emitToUser(targetUserId, "call:incoming", { callerId: userId });
    });

    socket.on("call:accept", ({ callerId }) => {
      emitToUser(callerId, "call:accepted", { calleeId: userId });
    });

    socket.on("call:reject", ({ callerId }) => {
      emitToUser(callerId, "call:rejected", { calleeId: userId });
    });

    socket.on("call:end", ({ targetUserId }) => {
      emitToUser(targetUserId, "call:ended", { by: userId });
    });

    socket.on("webrtc:offer", ({ targetUserId, sdp }) => {
      emitToUser(targetUserId, "webrtc:offer", { from: userId, sdp });
    });

    socket.on("webrtc:answer", ({ targetUserId, sdp }) => {
      emitToUser(targetUserId, "webrtc:answer", { from: userId, sdp });
    });

    socket.on("webrtc:ice-candidate", ({ targetUserId, candidate }) => {
      emitToUser(targetUserId, "webrtc:ice-candidate", { from: userId, candidate });
    });

    // ─── Desconexão ─────────────────────────────────────────────────
    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
      io.emit("users:online", Array.from(onlineUsers.keys()));
      console.log(`[Socket] Desconectado: ${userId} (${socket.id})`);
    });
  });

  return io;
}
