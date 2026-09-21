import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { apiFetch } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

export default function ChatWindow({
  conversationId,
  conversation,
}) {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

 

  const participants = Array.isArray(
    conversation?.participants
  )
    ? conversation.participants
    : [];

  const otherUser = participants.find(
    (participant) =>
      participant?._id?.toString() !==
      user?._id?.toString()
  );

  const otherUserId = otherUser?._id;

 

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setError("");
      return;
    }

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch(
          `/conversations/${conversationId}/messages`
        );

        
        setMessages(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Unable to load messages:",
          err
        );

        setMessages([]);
        setError(
          err.message ||
            "Unable to load messages"
        );
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

 

  useEffect(() => {
    if (!socket || !conversationId) {
      return;
    }

    const handleNewMessage = ({
      conversationId: incomingId,
      message,
    }) => {
      if (!incomingId || !message) {
        return;
      }

      if (
        incomingId.toString() !==
        conversationId.toString()
      ) {
        return;
      }

      setMessages((prev) => {
        const currentMessages = Array.isArray(
          prev
        )
          ? prev
          : [];

        const alreadyExists =
          currentMessages.some(
            (item) =>
              item?._id?.toString() ===
              message?._id?.toString()
          );

        if (alreadyExists) {
          return currentMessages;
        }

        return [
          ...currentMessages,
          message,
        ];
      });
    };

    const handleTyping = ({
      conversationId: incomingId,
      userId,
    }) => {
      if (!incomingId) {
        return;
      }

      if (
        incomingId.toString() !==
        conversationId.toString()
      ) {
        return;
      }

      // Ignore our own typing event
      if (
        userId?.toString() ===
        user?._id?.toString()
      ) {
        return;
      }

      setOtherTyping(true);

      clearTimeout(
        typingTimeoutRef.current
      );

      typingTimeoutRef.current =
        setTimeout(() => {
          setOtherTyping(false);
        }, 2000);
    };

    socket.on(
      "newMessage",
      handleNewMessage
    );

    socket.on(
      "typing",
      handleTyping
    );

    return () => {
      socket.off(
        "newMessage",
        handleNewMessage
      );

      socket.off(
        "typing",
        handleTyping
      );

      clearTimeout(
        typingTimeoutRef.current
      );
    };
  }, [
    socket,
    conversationId,
    user?._id,
  ]);

 

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    messages,
    otherTyping,
  ]);

  

  const sendMessage = (e) => {
    e.preventDefault();

    const trimmedText = text.trim();

    if (
      !trimmedText ||
      !conversationId ||
      sending
    ) {
      return;
    }

    if (!socket?.connected) {
      console.error(
        "Socket is not connected"
      );

      setError(
        "Connection unavailable. Please try again."
      );

      return;
    }

    setSending(true);
    setError("");

    socket.emit(
      "sendMessage",
      {
        conversationId,
        text: trimmedText,
      },
      (response) => {
        setSending(false);

        if (!response?.success) {
          console.error(
            response?.error ||
              "Message failed"
          );

          setError(
            response?.error ||
              "Message could not be sent"
          );

          return;
        }

        setText("");
      }
    );
  };

 

  const handleTypingInput = (value) => {
    setText(value);
    setError("");

    if (!conversationId) {
      return;
    }

    if (!otherUserId) {
      return;
    }

    if (!socket?.connected) {
      return;
    }

    socket.emit("typing", {
      conversationId,
      receiverId: otherUserId,
    });
  };

 

  if (!conversationId) {
    return (
      <section className="chat-window empty">
        <div>
          <h3>Your Messages</h3>

          <p>
            Select a conversation to
            start chatting.
          </p>
        </div>
      </section>
    );
  }

 

  return (
    <section className="chat-window">

      

      <div className="chat-header">
        <div className="chat-header-avatar">
          {otherUser?.avatar ? (
            <img
              src={otherUser.avatar}
              alt={
                otherUser.username ||
                "User"
              }
            />
          ) : (
            <span>
              {otherUser?.username
                ?.charAt(0)
                .toUpperCase() || "?"}
            </span>
          )}
        </div>

        <div>
          <strong>
            {otherUser?.username ||
              "Conversation"}
          </strong>
        </div>
      </div>

     

      <div className="chat-messages">

        {loading ? (
          <p className="conv-loading">
            Loading messages...
          </p>
        ) : error ? (
          <div className="chat-empty">
            <h3>
              Unable to load messages
            </h3>

            <p>{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <h3>
              No messages yet 💬
            </h3>

            <p>
              Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine =
              message?.sender?._id?.toString() ===
              user?._id?.toString();

            return (
              <div
                key={message?._id}
                className={`chat-bubble ${
                  isMine
                    ? "mine"
                    : "theirs"
                }`}
              >
                <p>
                  {message?.text}
                </p>

                <small>
                  {message?.createdAt
                    ? new Date(
                        message.createdAt
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )
                    : ""}
                </small>
              </div>
            );
          })
        )}

        {otherTyping && (
          <p className="typing-indicator">
            Typing...
          </p>
        )}

        <div ref={bottomRef} />

      </div>

    

      <form
        className="chat-input"
        onSubmit={sendMessage}
      >
        <input
          type="text"
          value={text}
          onChange={(e) =>
            handleTypingInput(
              e.target.value
            )
          }
          placeholder="Type a message..."
          disabled={sending}
        />

        <button
          type="submit"
          disabled={
            sending ||
            !text.trim()
          }
        >
          {sending
            ? "Sending..."
            : "Send"}
        </button>
      </form>

    </section>
  );
}
