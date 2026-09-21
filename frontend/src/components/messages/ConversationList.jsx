import React, { useEffect, useState } from "react";
import { apiFetch } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

export default function ConversationList({ activeId, onSelect }) {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadConversations = async () => {
      if (!user) {
        setConversations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await apiFetch("/conversations");

        
        setConversations(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error("Conversation loading error:", err);

        setError(
          err.message || "Unable to load conversations"
        );

        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user]);

  if (!user) {
    return (
      <aside className="conversation-list">
        <p className="conv-empty">
          Log in to view your messages.
        </p>
      </aside>
    );
  }

  if (loading) {
    return (
      <aside className="conversation-list">
        <p className="conv-loading">
          Loading conversations...
        </p>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="conversation-list">
        <p className="conv-empty">
          {error}
        </p>
      </aside>
    );
  }

  if (!conversations.length) {
    return (
      <aside className="conversation-list">
        <p className="conv-empty">
          No conversations yet — message someone from their profile.
        </p>
      </aside>
    );
  }

  return (
    <aside className="conversation-list">
      {conversations.map((conversation) => {
        const other = conversation.participants?.find(
          (participant) =>
            participant._id?.toString() !==
            user._id?.toString()
        );

        return (
          <button
            key={conversation._id}
            className={`conversation-row ${
              activeId === conversation._id ? "active" : ""
            }`}
            onClick={() => onSelect(conversation)}
          >
            <div className="conversation-avatar">
              {other?.avatar ? (
                <img
                  src={other.avatar}
                  alt={other.username}
                />
              ) : (
                <span>
                  {other?.username
                    ?.charAt(0)
                    .toUpperCase() || "?"}
                </span>
              )}
            </div>

            <div className="conversation-info">
              <strong>
                {other?.username || "Unknown User"}
              </strong>

              <span>
                {conversation.lastMessage?.text ||
                  "Say hello 👋"}
              </span>
            </div>
          </button>
        );
      })}
    </aside>
  );
}
