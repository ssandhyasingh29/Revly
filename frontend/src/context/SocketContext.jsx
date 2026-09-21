import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5001";

export function SocketProvider({ children }) {
  const { user } = useAuth();

  const socketRef = useRef(null);
  const activeConversationRef = useRef(null);

  const [connected, setConnected] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const setActiveConversation = (
    conversationId
  ) => {
    activeConversationRef.current =
      conversationId;
  };

  const resetUnread = () => {
    setUnreadCount(0);
  };

  useEffect(() => {
    if (!user?.token) {
      socketRef.current?.disconnect();
      socketRef.current = null;

      setConnected(false);
      setUnreadCount(0);

      return;
    }

    const socket = io(SOCKET_URL, {
      auth: {
        token: user.token,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(
        "Socket connected:",
        socket.id
      );

      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");

      setConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error(
        "Socket connection error:",
        error.message
      );
    });

    socket.on(
      "newMessage",
      ({ conversationId, message }) => {
        const senderId =
          message?.sender?._id?.toString();

        const currentUserId =
          user?._id?.toString();

        // Own message is not unread.
        if (
          senderId === currentUserId
        ) {
          return;
        }

        // Currently open conversation
        // is not unread.
        if (
          conversationId ===
          activeConversationRef.current
        ) {
          return;
        }

        setUnreadCount(
          (count) => count + 1
        );
      }
    );

    return () => {
      socket.removeAllListeners();
      socket.disconnect();

      socketRef.current = null;
      setConnected(false);
    };
  }, [user?.token, user?._id]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        unreadCount,
        resetUnread,
        activeConversationId:
          activeConversationRef.current,
        setActiveConversation,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}