import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const sendMessage = async ({
  io,
  senderId,
  conversationId,
  text,
}) => {
 

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

  

  const conversation =
    await Conversation.findById(
      conversationId
    );

  if (!conversation) {
    throw new Error(
      "Conversation not found"
    );
  }

  
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


  const message =
    await Message.create({
      conversation: conversationId,
      sender: senderId,
      text: text.trim(),
      readBy: [senderId],
    });

 

  conversation.lastMessage = {
    text: text.trim(),
    sender: senderId,
    createdAt: message.createdAt,
  };

  await conversation.save();



  const populated =
    await message.populate(
      "sender",
      "username avatar"
    );

 

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

 
  if (conversation) {
    return conversation;
  }

  
  conversation =
    await Conversation.create({
      participants: [
        userAId,
        userBId,
      ],
    });

  return conversation;
};
