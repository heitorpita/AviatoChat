import { Router } from "express";
import { getMessages } from "../controllers/chat.controller.js";
import { autenticarToken } from "../../../middlewares/authentication.middleware.js";

const router = Router();

router.use(autenticarToken);

// GET /api/chat/messages/:friendId?limit=50&cursor=<messageId>
router.get("/messages/:friendId", getMessages);

export default router;
