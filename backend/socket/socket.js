import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendMessage } from "../services/messageService.js";

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      credentials: true,
    },
  });


  // SOCKET AUTHENTICATION
  

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(
          new Error("No token provided")
        );
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      //  JWT may contain userId or id
      const userId =
        decoded.userId || decoded.id;

      if (!userId) {
        return next(
          new Error("Invalid token")
        );
      }

      const user = await User.findById(
        userId
      ).select("-password");

      if (!user) {
        return next(
          new Error("User no longer exists")
        );
      }

      // Store logged-in user on socket
      socket.user = user;

      next();
   } catch (err) {
  console.error(
    "Socket authentication error:",
    err.name,
    err.message
  );

  next(
    new Error(
      "Socket authentication failed"
    )
  );
} 
  });

  // CONNECTION
  

  io.on("connection", (socket) => {
    const userId =
      socket.user._id.toString();

    console.log(
      `Socket connected: ${socket.user.username} (${socket.id})`
    );

    // Put user into their personal room
    socket.join(userId);

  
    // SEND MESSAGE
    
    socket.on(
      "sendMessage",
      async (
        { conversationId, text },
        callback
      ) => {
        try {
          if (!conversationId) {
            throw new Error(
              "Conversation ID is required"
            );
          }

          if (!text?.trim()) {
            throw new Error(
              "Message text is required"
            );
          }

          const message =
            await sendMessage({
              io,
              senderId: socket.user._id,
              conversationId,
              text: text.trim(),
            });

          // Tell sender that message was successfully saved
          callback?.({
            success: true,
            message,
          });
        } catch (err) {
          console.error(
            "Socket send message error:",
            err
          );

          callback?.({
            success: false,
            error:
              err.message ||
              "Message could not be sent",
          });
        }
      }
    );

    
    socket.on(
      "typing",
      ({
        conversationId,
        receiverId,
      }) => {
        try {
          if (
            !conversationId ||
            !receiverId
          ) {
            return;
          }

          io.to(
            receiverId.toString()
          ).emit("typing", {
            conversationId:
              conversationId.toString(),

            userId:
              socket.user._id.toString(),
          });
        } catch (err) {
          console.error(
            "Typing event error:",
            err.message
          );
        }
      }
    );

  

    socket.on(
      "disconnect",
      (reason) => {
        console.log(
          `Socket disconnected: ${socket.user.username} (${reason})`
        );
      }
    );
  });

  return io;
};

export default initSocket;
