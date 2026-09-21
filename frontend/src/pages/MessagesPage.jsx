import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import ConversationList from "../components/messages/ConversationList";
import ChatWindow from "../components/messages/ChatWindow";

import { useSocket } from "../context/SocketContext";
import { apiFetch } from "../config/api";

export default function MessagesPage() {
  const location = useLocation();

  const [activeConversation, setActiveConversation] =
    useState(null);

  const [loadingConversation, setLoadingConversation] =
    useState(false);

  const {
    resetUnread,
    setActiveConversation: setSocketActiveConversation,
  } = useSocket();

  const activeId = activeConversation?._id || null;

  // When we arrive here from someone's profile
  useEffect(() => {
    const conversationId =
      location.state?.conversationId;

    if (!conversationId) {
      return;
    }

    const loadConversation = async () => {
      try {
        setLoadingConversation(true);

        const conversations =
          await apiFetch("/conversations");

        const conversation = Array.isArray(conversations)
          ? conversations.find(
              (item) =>
                item._id?.toString() ===
                conversationId?.toString()
            )
          : null;

        if (conversation) {
          setActiveConversation(conversation);
          resetUnread();
          setSocketActiveConversation(
            conversation._id
          );
        }
      } catch (err) {
        console.error(
          "Unable to load conversation:",
          err
        );
      } finally {
        setLoadingConversation(false);
      }
    };

    loadConversation();
  }, [location.state?.conversationId]);

  const handleSelect = (conversation) => {
    setActiveConversation(conversation);

    resetUnread();

    setSocketActiveConversation(
      conversation._id
    );
  };

  // Clear active conversation when leaving page
  useEffect(() => {
    return () => {
      setSocketActiveConversation(null);
    };
  }, []);

  return (
    <div className="messages-page">
      <ConversationList
        activeId={activeId}
        onSelect={handleSelect}
      />

      {loadingConversation ? (
        <main className="chat-window">
          <div className="chat-empty">
            Loading conversation...
          </div>
        </main>
      ) : (
        <ChatWindow
          conversationId={activeId}
          conversation={activeConversation}
        />
      )}
    </div>
  );
}