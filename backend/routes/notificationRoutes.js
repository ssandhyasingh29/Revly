import express from "express";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getNotifications);

router.get("/unread-count", protect, getUnreadNotificationCount);

router.put("/read-all", protect, markAllNotificationsAsRead);

router.put("/:id/read", protect, markNotificationAsRead);
export default router;