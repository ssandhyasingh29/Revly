import React, { useEffect, useState } from "react";
import { MessageCircle, MoreVertical, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../config/api";

export default function UserCard({ user }) {
  const { showToast } = useToast();
  const { user: loggedInUser } = useAuth();
  const navigate = useNavigate();

  const [following, setFollowing] = useState(
    loggedInUser
      ? user.followers?.some(
          (id) =>
            id.toString() ===
            loggedInUser._id.toString()
        )
      : false
  );

  const [showUnfollowModal, setShowUnfollowModal] =
    useState(false);

  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!loggedInUser) {
      setFollowing(false);
      return;
    }

    const isFollowing =
      user.followers?.some(
        (id) =>
          id.toString() ===
          loggedInUser._id.toString()
      ) || false;

    setFollowing(isFollowing);
  }, [user.followers, loggedInUser]);

  // FOLLOW / UNFOLLOW
  const toggleFollow = async (e) => {
    e.stopPropagation();

    if (!loggedInUser) {
      showToast("Log in to follow people");
      return;
    }

    if (following) {
      setShowUnfollowModal(true);
      return;
    }

    try {
      await apiFetch(`/users/${user._id}/follow`, {
        method: "POST",
      });

      setFollowing(true);

      showToast(`Following ${user.username}`);
    } catch (err) {
      showToast(err.message);
    }
  };

  // CONFIRMED UNFOLLOW
  const confirmUnfollow = async () => {
    try {
      await apiFetch(`/users/${user._id}/follow`, {
        method: "DELETE",
      });

      setFollowing(false);
      setShowUnfollowModal(false);

      showToast(`Unfollowed ${user.username}`);
    } catch (err) {
      showToast(err.message);
    }
  };

  // MESSAGE
  const openConversation = async (e) => {
    e.stopPropagation();

    if (!loggedInUser) {
      showToast("Log in to send a message");
      return;
    }

    try {
      const conversation = await apiFetch(
        "/conversations",
        {
          method: "POST",
          body: JSON.stringify({
            userId: user._id,
          }),
        }
      );

      navigate("/messages", {
        state: {
          conversationId: conversation._id,
        },
      });
    } catch (err) {
      showToast(err.message);
    }
  };

  const followersCount =
    user.followersCount ??
    user.followers?.length ??
    0;

  const followingCount =
    user.followingCount ??
    user.following?.length ??
    0;

  return (
    <>
      {/* USER CARD */}
      <article
        className="user-card"
        onClick={() =>
          navigate(`/profile/${user._id}`)
        }
      >
        {/* MORE BUTTON + MENU */}
        <div className="user-more-wrapper">
          <button
            className="more"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            aria-label="More options"
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <div
              className="user-more-menu"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  navigate(`/profile/${user._id}`);
                }}
              >
                View Profile
              </button>
            </div>
          )}
        </div>

        {/* AVATAR */}
        <div className="user-avatar">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
            />
          ) : (
            <div className="avatar-placeholder">
              {user.username
                ?.charAt(0)
                .toUpperCase()}
            </div>
          )}

          <span className="online" />
        </div>

        {/* BADGE */}
        {user.badge && (
          <div className="badge">
            {user.badge}
          </div>
        )}

        {/* USERNAME */}
        <h3>@{user.username}</h3>

        {/* SKIN DETAILS */}
        <p>
          {user.skinType || "Beauty Lover"}

          {user.skinConcern
            ? ` • ${user.skinConcern}`
            : ""}
        </p>

        {/* STATS */}
        <div className="user-stats">
          <span>
            <b>{followersCount}</b>
            <small>Followers</small>
          </span>

          <span>
            <b>{followingCount}</b>
            <small>Following</small>
          </span>
        </div>

        {/* ACTIONS */}
        <div className="user-actions">
          <button
            className={following ? "following" : ""}
            onClick={toggleFollow}
          >
            {following ? "Following" : "Follow"}
          </button>

          <button
            onClick={openConversation}
            aria-label="Message"
          >
            <MessageCircle size={16} />
          </button>
        </div>
      </article>

      {/* UNFOLLOW CONFIRMATION MODAL */}
      {showUnfollowModal && (
        <div
          className="unfollow-modal-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setShowUnfollowModal(false);
          }}
        >
          <div
            className="unfollow-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              className="unfollow-modal-close"
              onClick={() =>
                setShowUnfollowModal(false)
              }
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* ICON */}
            <div className="unfollow-modal-icon">
              ♡
            </div>

            {/* TITLE */}
            <h2>
              Unfollow @{user.username}?
            </h2>

            {/* DESCRIPTION */}
            <p>
              You won't see their updates in your
              community feed anymore.
              <br />
              You can follow them again anytime.
            </p>

            {/* BUTTONS */}
            <div className="unfollow-modal-actions">
              <button
                className="unfollow-cancel-btn"
                onClick={() =>
                  setShowUnfollowModal(false)
                }
              >
                Cancel
              </button>

              <button
                className="unfollow-confirm-btn"
                onClick={confirmUnfollow}
              >
                Unfollow
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}