import React, { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../config/api";

export default function NotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await apiFetch("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
  try {
    await apiFetch(`/notifications/${id}/read`, {
      method: "PUT",
    });

    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === id
          ? { ...notification, read: true }
          : notification
      )
    );

    window.dispatchEvent(new Event("notificationsUpdated"));
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
  }
};

  const markAllAsRead = async () => {
  try {
    await apiFetch("/notifications/read-all", {
      method: "PUT",
    });

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );

    window.dispatchEvent(new Event("notificationsUpdated"));
  } catch (err) {
    console.error("Failed to mark all notifications as read:", err);
  }
};

  const getNotificationIcon = (type) => {
    if (type === "follow") return "👤";
    if (type === "like") return "❤️";
    if (type === "review") return "⭐";
    if (type === "message") return "💬";

    return "🔔";
  };

  const formatTime = (date) => {
    const diff =
      Date.now() - new Date(date).getTime();

    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60)
      return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);

    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <p className="loading-text">
          Loading notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="notifications-page">

      <div className="notifications-header">

        <div>
          <h1>Notifications</h1>

          <p>
            Stay updated with your Revly community
          </p>
        </div>

        {notifications.some(
          (notification) => !notification.read
        ) && (
          <button
            className="mark-all-btn"
            onClick={markAllAsRead}
          >
            <CheckCheck size={17} />
            Mark all as read
          </button>
        )}

      </div>

      <div className="notifications-list">

        {notifications.length === 0 ? (
          <div className="notifications-empty">

            <Bell size={40} />

            <h2>No notifications yet</h2>

            <p>
              When someone follows you, likes your
              review, or interacts with you, you'll
              see it here.
            </p>

          </div>
        ) : (
          notifications.map((notification) => (

            <div
              key={notification._id}
              className={`notification-card ${
                !notification.read
                  ? "unread"
                  : ""
              }`}
              onClick={() =>
                !notification.read &&
                markAsRead(notification._id)
              }
            >

              <div className="notification-icon">
                {getNotificationIcon(
                  notification.type
                )}
              </div>

              <div className="notification-content">

                <p>
                  <strong>
                    {notification.sender?.username ||
                      "Someone"}
                  </strong>{" "}
                  {notification.text
                    ?.replace(
                      `${notification.sender?.username} `,
                      ""
                    )}
                </p>

                <span>
                  {formatTime(
                    notification.createdAt
                  )}
                </span>

              </div>

              {!notification.read && (
                <span className="notification-dot" />
              )}

            </div>

          ))
        )}

      </div>

    </div>
  );
}