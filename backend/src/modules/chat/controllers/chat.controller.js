import prisma from "../../../config/prisma.js";
import { getRoomId } from "../../../lib/socket.js";

/**
 * GET /api/chat/messages/:friendId?limit=50&cursor=<messageId>
 * Retorna o histórico de mensagens entre o usuário autenticado e um amigo.
 * Paginação cursor-based: passar ?cursor=<id da mensagem mais antiga já carregada>
 * para carregar mensagens anteriores.
 */
export async function getMessages(req, res, next) {
  try {
    const userId = req.usuario.id;
    const { friendId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const cursor = req.query.cursor;

    const roomId = getRoomId(userId, friendId);

    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      select: {
        id: true,
        senderId: true,
        text: true,
        readAt: true,
        createdAt: true,
      },
    });

    // Retorna do mais antigo para o mais recente (ordem natural para o chat)
    res.status(200).json({
      sucesso: true,
      messages: messages.reverse(),
      nextCursor: messages.length === limit ? messages[0]?.id : null,
    });
  } catch (error) {
    next(error);
  }
}
