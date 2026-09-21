import asyncHandler from "../middleware/asyncHandler.js";
import Notification from "../models/Notification.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user._id,
  })
    .populate("sender", "username avatar")
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(notifications);
});

export const getUnreadNotificationCount = asyncHandler(
  async (req, res) => {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({ count });
  }
);

export const markNotificationAsRead = asyncHandler(
  async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user._id,
      },
      {
        read: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    res.json(notification);
  }
);

export const markAllNotificationsAsRead = asyncHandler(
  async (req, res) => {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        read: false,
      },
      {
        read: true,
      }
    );

    res.json({
      message: "All notifications marked as read",
    });
  }
);