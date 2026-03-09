import { Router } from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests,
} from "../controllers/friends.controller.js";
import { autenticarToken } from "../../../middlewares/authentication.middleware.js";

const router = Router();

// Todas as rotas de amizade requerem autenticação
router.use(autenticarToken);

router.post("/request/:userId", sendFriendRequest);
router.put("/request/:requestId/accept", acceptFriendRequest);
router.put("/request/:requestId/reject", rejectFriendRequest);
router.get("/requests", getPendingRequests);

export default router;
