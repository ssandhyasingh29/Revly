import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import {
  sendMessage,
  getOrCreateConversation,
} from "../services/messageService.js";

// ============================================
// GET ALL CONVERSATIONS OF LOGGED-IN USER
// GET /api/conversations
// ============================================

export const getConversations = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401);
      throw new Error("User not authenticated");
    }

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate(
        "participants",
        "username avatar"
      )
      .sort({ updatedAt: -1 })
      .lean();

    // Always return an array
    res.json(
      Array.isArray(conversations)
        ? conversations
        : []
    );
  }
);

// ============================================
// START / GET EXISTING CONVERSATION
// POST /api/conversations
// ============================================

export const startConversation = asyncHandler(
  async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
      res.status(400);
      throw new Error("userId is required");
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      res.status(400);
      throw new Error("Invalid userId");
    }

    if (
      userId.toString() ===
      req.user._id.toString()
    ) {
      res.status(400);
      throw new Error(
        "You can't message yourself"
      );
    }

    const conversation =
      await getOrCreateConversation(
        req.user._id,
        userId
      );

    const populated =
      await Conversation.findById(
        conversation._id
      )
        .populate(
          "participants",
          "username avatar"
        )
        .lean();

    res.status(201).json(populated);
  }
);

// ============================================
// GET MESSAGES
// GET /api/conversations/:id/messages
// ============================================

export const getMessages = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400);
      throw new Error(
        "Invalid conversation ID"
      );
    }

    const conversation =
      await Conversation.findById(id);

    if (!conversation) {
      res.status(404);
      throw new Error(
        "Conversation not found"
      );
    }

    // Check whether current user belongs
    // to this conversation
    const isParticipant =
      Array.isArray(
        conversation.participants
      ) &&
      conversation.participants.some(
        (participantId) =>
          participantId.toString() ===
          req.user._id.toString()
      );

    if (!isParticipant) {
      res.status(403);
      throw new Error(
        "You are not part of this conversation"
      );
    }

    const messages =
      await Message.find({
        conversation: id,
      })
        .populate(
          "sender",
          "username avatar"
        )
        .sort({ createdAt: 1 })
        .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: id,
        readBy: {
          $ne: req.user._id,
        },
      },
      {
        $addToSet: {
          readBy: req.user._id,
        },
      }
    );

    res.json(
      Array.isArray(messages)
        ? messages
        : []
    );
  }
);

// ============================================
// SEND MESSAGE
// POST /api/conversations/:id/messages
// ============================================

export const postMessage = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400);
      throw new Error(
        "Invalid conversation ID"
      );
    }

    if (!text?.trim()) {
      res.status(400);
      throw new Error(
        "Message text is required"
      );
    }

    const io = req.app.get("io");

    const message = await sendMessage({
      io,
      senderId: req.user._id,
      conversationId: id,
      text: text.trim(),
    });

    res.status(201).json(message);
  }
);