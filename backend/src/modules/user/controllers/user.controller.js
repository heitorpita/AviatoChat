import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../../config/prisma.js";

const gerarToken = (user) => {
  return jwt.sign(
    { id: user.id, perfil: user.role.toLowerCase() },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );
};

const camposSegurosSeletor = {
  id: true,
  fullName: true,
  email: true,
  bio: true,
  profilePic: true,
  nativeLanguage: true,
  learningLanguage: true,
  location: true,
  isOnboarded: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export const signup = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ erro: "Senha deve ter no mínimo 6 caracteres" });
    }

    const usuarioExistente = await prisma.user.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({ erro: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(password, 12);

    const usuario = await prisma.user.create({
      data: { fullName, email, password: senhaHash },
      select: camposSegurosSeletor,
    });

    const token = gerarToken(usuario);

    res.status(201).json({ sucesso: true, usuario, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" });
    }

    const usuario = await prisma.user.findUnique({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const senhaValida = await bcrypt.compare(password, usuario.password);
    if (!senhaValida) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const token = gerarToken(usuario);

    const { password: _pw, ...usuarioSeguro } = usuario;
    res.status(200).json({ sucesso: true, usuario: usuarioSeguro, token });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/logout  [autenticarToken]
export const logout = async (_req, res) => {
  // JWT é stateless — o client descarta o token
  // Aqui pode-se adicionar blacklist de token se necessário
  res.status(200).json({ sucesso: true, mensagem: "Logout realizado com sucesso" });
};

// PUT /api/users/onboard  [autenticarToken]
export const onboard = async (req, res, next) => {
  try {
    const { nativeLanguage, learningLanguage, bio, profilePic, location } = req.body;

    if (!nativeLanguage || !learningLanguage) {
      return res.status(400).json({ erro: "Idioma nativo e idioma em aprendizado são obrigatórios" });
    }

    const usuario = await prisma.user.update({
      where: { id: req.usuario.id },
      data: {
        nativeLanguage,
        learningLanguage,
        isOnboarded: true,
        ...(bio !== undefined && { bio }),
        ...(profilePic !== undefined && { profilePic }),
        ...(location !== undefined && { location }),
      },
      select: camposSegurosSeletor,
    });

    res.status(200).json({ sucesso: true, usuario });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/me  [autenticarToken]
export const getMe = async (req, res, next) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.usuario.id },
      select: camposSegurosSeletor,
    });

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.status(200).json({ sucesso: true, usuario });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/chat-users  [autenticarToken]
// Retorna todos os usuários onboarded que ainda não são amigos
export const getUsersToChat = async (req, res, next) => {
  try {
    const eu = await prisma.user.findUnique({
      where: { id: req.usuario.id },
      select: { friends: { select: { id: true } } },
    });

    const amigosIds = eu.friends.map((f) => f.id);

    const usuarios = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: req.usuario.id } },
          { id: { notIn: amigosIds } },
          { isOnboarded: true },
        ],
      },
      select: {
        id: true,
        fullName: true,
        profilePic: true,
        nativeLanguage: true,
        learningLanguage: true,
        location: true,
        bio: true,
      },
    });

    res.status(200).json({ sucesso: true, usuarios });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/friends  [autenticarToken]
export const getFriends = async (req, res, next) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.usuario.id },
      select: {
        friends: {
          select: {
            id: true,
            fullName: true,
            profilePic: true,
            nativeLanguage: true,
            learningLanguage: true,
            location: true,
            bio: true,
          },
        },
      },
    });

    res.status(200).json({ sucesso: true, amigos: usuario.friends });
  } catch (error) {
    next(error);
  }
};

// GET /api/users  [autenticarToken + admin]
export const getAllUsers = async (_req, res, next) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: camposSegurosSeletor,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ sucesso: true, total: usuarios.length, usuarios });
  } catch (error) {
    next(error);
  }
};
