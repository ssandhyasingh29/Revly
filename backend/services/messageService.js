import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const sendMessage = async ({
  io,
  senderId,
  conversationId,
  text,
}) => {
  // -----------------------------
  // VALIDATE INPUT
  // -----------------------------

  if (
    !mongoose.Types.ObjectId.isValid(
      conversationId
    )
  ) {
    throw new Error(
      "Invalid conversation ID"
    );
  }

  if (!senderId) {
    throw new Error(
      "Sender ID is missing"
    );
  }

  if (!text || !text.trim()) {
    throw new Error(
      "Message text is required"
    );
  }

  // -----------------------------
  // FIND CONVERSATION
  // -----------------------------

  const conversation =
    await Conversation.findById(
      conversationId
    );

  if (!conversation) {
    throw new Error(
      "Conversation not found"
    );
  }

  // -----------------------------
  // CHECK PARTICIPANTS
  // -----------------------------

  const participants =
    Array.isArray(
      conversation.participants
    )
      ? conversation.participants
      : [];

  if (participants.length !== 2) {
    throw new Error(
      "Conversation must have exactly 2 participants"
    );
  }

  const isParticipant =
    participants.some(
      (participantId) =>
        participantId.toString() ===
        senderId.toString()
    );

  if (!isParticipant) {
    throw new Error(
      "You are not part of this conversation"
    );
  }

  // -----------------------------
  // CREATE MESSAGE
  // -----------------------------

  const message =
    await Message.create({
      conversation: conversationId,
      sender: senderId,
      text: text.trim(),
      readBy: [senderId],
    });

  // -----------------------------
  // UPDATE LAST MESSAGE
  // -----------------------------

  conversation.lastMessage = {
    text: text.trim(),
    sender: senderId,
    createdAt: message.createdAt,
  };

  await conversation.save();

  // -----------------------------
  // POPULATE SENDER
  // -----------------------------

  const populated =
    await message.populate(
      "sender",
      "username avatar"
    );

  // -----------------------------
  // REAL-TIME MESSAGE
  // -----------------------------

  if (io) {
    participants.forEach(
      (participantId) => {
        io.to(
          participantId.toString()
        ).emit("newMessage", {
          conversationId:
            conversationId.toString(),

          message: populated,
        });
      }
    );
  }

  return populated;
};

// ========================================
// GET OR CREATE CONVERSATION
// ========================================

export const getOrCreateConversation = async (
  userAId,
  userBId
) => {
  if (
    userAId.toString() ===
    userBId.toString()
  ) {
    throw new Error(
      "You can't message yourself"
    );
  }

  // Find existing conversation
  let conversation =
    await Conversation.findOne({
      participants: {
        $all: [
          userAId,
          userBId,
        ],
        $size: 2,
      },
    });

  // Return existing
  if (conversation) {
    return conversation;
  }

  // Create new conversation
  conversation =
    await Conversation.create({
      participants: [
        userAId,
        userBId,
      ],
    });

  return conversation;
};