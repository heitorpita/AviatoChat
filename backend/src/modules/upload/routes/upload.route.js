import { Router } from "express";
import { autenticarToken } from "../../../middlewares/authentication.middleware.js";
import { upload } from "../../../middlewares/upload.middleware.js";

const router = Router();

// POST /api/upload — faz upload de uma imagem e retorna a URL
router.post(
  "/",
  autenticarToken,
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado" });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
  }
);

export default router;
