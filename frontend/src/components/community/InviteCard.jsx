import React, { useState } from "react";
import { Copy, Share2, MessageCircle, X, Check } from "lucide-react";
import { useToast } from "../../context/ToastContext";

export default function InviteCard() {
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/register?ref=invite`;

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      showToast("Invite link copied!");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy invite link:", error);
      showToast("Couldn't copy the link");
    }
  };

  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(
      `Hey! 💕 I found this beauty community called Revly where you can discover honest product reviews and connect with beauty lovers. Join me! ${inviteLink}`
    );

    window.open(
      `https://wa.me/?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      showToast("Sharing isn't supported on this browser");
      return;
    }

    try {
      await navigator.share({
        title: "Join me on Revly 💕",
        text: "Discover honest beauty reviews and connect with beauty lovers on Revly!",
        url: inviteLink,
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  };

  return (
    <>
      <div className="invite-card">
        <div className="invite-card-content">
          <span className="invite-eyebrow">💕 SPREAD THE GLOW</span>
          <h2>Invite Your Friends</h2>
          <p>
            Know someone who loves beauty? Invite your beauty besties to
            discover honest reviews and join the Revly community.
          </p>

          <button
            type="button"
            className="btn primary invite-now-btn"
            onClick={() => setShowModal(true)}
          >
            Invite Friends <Share2 size={16} />
          </button>
        </div>

        <div className="gift">
          <span>🎁</span>
          <span>💕</span>
        </div>
      </div>

      {showModal && (
        <div
          className="invite-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="invite-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="invite-modal-close"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="invite-modal-icon">💕</div>

            <h2>Invite your beauty besties</h2>
            <p>
              Share Revly with your friends and discover beauty together.
            </p>

            <div className="invite-link-box">
              <span>{inviteLink}</span>

              <button
                type="button"
                onClick={copyInviteLink}
                aria-label="Copy invite link"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>

            <div className="invite-share-options">
              <button
                type="button"
                className="invite-share-btn"
                onClick={copyInviteLink}
              >
                <span className="invite-share-icon">
                  {copied ? <Check size={19} /> : <Copy size={19} />}
                </span>
                <span>
                  <strong>{copied ? "Copied!" : "Copy Invite Link"}</strong>
                  <small>Share it anywhere</small>
                </span>
              </button>

              <button
                type="button"
                className="invite-share-btn"
                onClick={shareOnWhatsApp}
              >
                <span className="invite-share-icon">
                  <MessageCircle size={19} />
                </span>
                <span>
                  <strong>WhatsApp</strong>
                  <small>Invite a friend directly</small>
                </span>
              </button>

              {navigator.share && (
                <button
                  type="button"
                  className="invite-share-btn"
                  onClick={nativeShare}
                >
                  <span className="invite-share-icon">
                    <Share2 size={19} />
                  </span>
                  <span>
                    <strong>More Sharing Options</strong>
                    <small>Use your device's share menu</small>
                  </span>
                </button>
              )}
            </div>

            <button
              type="button"
              className="invite-later-btn"
              onClick={() => setShowModal(false)}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </>
  );
}