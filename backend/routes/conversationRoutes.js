import express from "express";

import {
  getConversations,
  startConversation,
  getMessages,
  postMessage,
} from "../controllers/conversationController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get(
  "/",
  getConversations
);

router.post(
  "/",
  startConversation
);

router.get(
  "/:id/messages",
  getMessages
);

router.post(
  "/:id/messages",
  postMessage
);

export default router;