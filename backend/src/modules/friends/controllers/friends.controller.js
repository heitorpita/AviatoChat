import prisma from "../../../config/prisma.js";

// POST /api/friends/request/:userId  [autenticarToken]
// Envia solicitação de amizade para outro usuário
export const sendFriendRequest = async (req, res, next) => {
  try {
    const senderId = req.usuario.id;
    const receiverId = req.params.userId;

    if (senderId === receiverId) {
      return res.status(400).json({ erro: "Você não pode se adicionar como amigo" });
    }

    // Verifica se o destinatário existe
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    // Verifica se já são amigos
    const jaAmigo = await prisma.user.findFirst({
      where: { id: senderId, friends: { some: { id: receiverId } } },
    });
    if (jaAmigo) {
      return res.status(409).json({ erro: "Vocês já são amigos" });
    }

    // Verifica se já existe solicitação pendente
    const solicitacaoExistente = await prisma.friendRequest.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } },
    });
    if (solicitacaoExistente) {
      return res.status(409).json({ erro: "Solicitação já enviada" });
    }

    const solicitacao = await prisma.friendRequest.create({
      data: { senderId, receiverId },
      include: {
        receiver: { select: { id: true, fullName: true, profilePic: true } },
      },
    });

    res.status(201).json({ sucesso: true, solicitacao });
  } catch (error) {
    next(error);
  }
};

// PUT /api/friends/request/:requestId/accept  [autenticarToken]
// Aceita solicitação — adiciona os dois como amigos mutuamente
export const acceptFriendRequest = async (req, res, next) => {
  try {
    const solicitacao = await prisma.friendRequest.findUnique({
      where: { id: req.params.requestId },
    });

    if (!solicitacao) {
      return res.status(404).json({ erro: "Solicitação não encontrada" });
    }

    if (solicitacao.receiverId !== req.usuario.id) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    if (solicitacao.status !== "PENDING") {
      return res.status(400).json({ erro: "Solicitação já foi processada" });
    }

    // Atualiza status + adiciona amizade mútua em uma transaction
    await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: solicitacao.id },
        data: { status: "ACCEPTED" },
      }),
      prisma.user.update({
        where: { id: solicitacao.senderId },
        data: { friends: { connect: { id: solicitacao.receiverId } } },
      }),
      prisma.user.update({
        where: { id: solicitacao.receiverId },
        data: { friends: { connect: { id: solicitacao.senderId } } },
      }),
    ]);

    res.status(200).json({ sucesso: true, mensagem: "Solicitação aceita" });
  } catch (error) {
    next(error);
  }
};

// PUT /api/friends/request/:requestId/reject  [autenticarToken]
// Recusa a solicitação
export const rejectFriendRequest = async (req, res, next) => {
  try {
    const solicitacao = await prisma.friendRequest.findUnique({
      where: { id: req.params.requestId },
    });

    if (!solicitacao) {
      return res.status(404).json({ erro: "Solicitação não encontrada" });
    }

    if (solicitacao.receiverId !== req.usuario.id) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    if (solicitacao.status !== "PENDING") {
      return res.status(400).json({ erro: "Solicitação já foi processada" });
    }

    await prisma.friendRequest.update({
      where: { id: solicitacao.id },
      data: { status: "REJECTED" },
    });

    res.status(200).json({ sucesso: true, mensagem: "Solicitação recusada" });
  } catch (error) {
    next(error);
  }
};

// GET /api/friends/requests  [autenticarToken]
// Lista solicitações recebidas pendentes
export const getPendingRequests = async (req, res, next) => {
  try {
    const solicitacoes = await prisma.friendRequest.findMany({
      where: { receiverId: req.usuario.id, status: "PENDING" },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            profilePic: true,
            nativeLanguage: true,
            learningLanguage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ sucesso: true, solicitacoes });
  } catch (error) {
    next(error);
  }
};
