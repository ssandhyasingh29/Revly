import React, { useEffect, useState } from "react";
import { Heart, CheckCircle } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../config/api";

export default function TopReview() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/reviews/top")
      .then(setReview)
      .catch(() => setReview(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLike = async () => {
    if (!user) {
      showToast("Log in to mark a review helpful");
      return;
    }
    try {
      const result = await apiFetch(`/reviews/${review._id}/like`, { method: "POST" });
      // Update just the count locally instead of re-fetching the whole
      // review — cheaper, and the UI updates instantly.
      setReview((r) => ({ ...r, likesCount: result.likesCount }));
      showToast(result.liked ? "Marked as helpful!" : "Removed your helpful vote");
    } catch (err) {
      showToast(err.message);
    }
  };

  if (loading) return <section className="review-card loading-text">Loading top review...</section>;
  if (!review) return null; // no reviews exist yet — nothing to show

  return (
    <section className="review-card">
      <div className="review-author">
        {review.user.avatar ? (
        <img
        src={review.user.avatar}
        alt={review.user.username}
        />
         ) : (
       <span className="avatar-placeholder">
       {review.user.username?.charAt(0).toUpperCase()}
       </span>
       )}
        <div>
          <strong>@{review.user.username}</strong>
          {review.user.badge && <span>{review.user.badge}</span>}
          <small>{new Date(review.createdAt).toLocaleDateString()}</small>
        </div>
      </div>
      <h3>{review.title}</h3>
      <p>{review.text}</p>
      <div className="review-body">
        <div className="review-bars">
          {Object.entries(review.ratings).map(([label, value]) => (
            <div key={label}>
              <span>{label === "valueForMoney" ? "Value for Money" : label[0].toUpperCase() + label.slice(1)}</span>
              <b>{"★".repeat(value)}{"☆".repeat(5 - value)}</b>
            </div>
          ))}
        </div>
        {review.images?.[0] && <img src={review.images[0]} alt={review.title}/>}
      </div>
      <div className="review-footer">
        <button onClick={handleLike}>
          <Heart size={14} fill={review.likesCount ? "currentColor" : "none"} /> {review.likesCount}
        </button>
        {review.verifiedPurchase && <small><CheckCircle size={13}/> Verified Purchase</small>}
      </div>
    </section>
  );
}
