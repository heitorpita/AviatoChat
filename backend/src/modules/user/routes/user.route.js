import { Router } from "express";
import {
  signup,
  login,
  logout,
  onboard,
  getMe,
  getUsersToChat,
  getFriends,
  getAllUsers,
  getAiBot,
} from "../controllers/user.controller.js";
import { autenticarToken } from "../../../middlewares/authentication.middleware.js";
import autorization from "../../../middlewares/autorization.middleware.js";

const router = Router();

// ─── Rotas públicas ───────────────────────────────────────────────
router.post("/signup", signup);
router.post("/login", login);

// ─── Rotas protegidas (requer JWT válido) ─────────────────────────
router.post("/logout", autenticarToken, logout);
router.put("/onboard", autenticarToken, onboard);
router.get("/me", autenticarToken, getMe);
router.get("/chat-users", autenticarToken, getUsersToChat);
router.get("/friends", autenticarToken, getFriends);
router.get("/ai-bot", autenticarToken, getAiBot);

// ─── Rotas admin (requer JWT + perfil admin) ──────────────────────
router.get("/", autenticarToken, autorization.admin, getAllUsers);

export default router;
