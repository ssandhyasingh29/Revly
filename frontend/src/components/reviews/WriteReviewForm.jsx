import React, { useState } from "react";
import StarInput from "./StarInput";
import { apiFetch } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function WriteReviewForm({ productId, onReviewAdded }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [ratings, setRatings] = useState({ effectiveness: 0, packaging: 0, valueForMoney: 0 });
  const [verifiedPurchase, setVerifiedPurchase] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const setRating = (key, value) => setRatings((r) => ({ ...r, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !text.trim()) {
      setError("Please add a title and a review.");
      return;
    }
    // Every category needs a star rating — the backend's Review model
    
    if (!ratings.effectiveness || !ratings.packaging || !ratings.valueForMoney) {
      setError("Please rate all three categories.");
      return;
    }

    try {
      setSubmitting(true);
      const review = await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({ product: productId, title, text, ratings, verifiedPurchase }),
      });

      showToast("Review posted!");
      setTitle("");
      setText("");
      setRatings({ effectiveness: 0, packaging: 0, valueForMoney: 0 });
      setVerifiedPurchase(false);

      // Let the parent page (ProductPage.jsx) add this review to the list immediately instead of re-fetching the whole list from the server 
      onReviewAdded?.(review);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <p className="login-to-review">Log in to write a review.</p>;
  }

  return (
    <form className="write-review-form" onSubmit={handleSubmit}>
      <h3>Write a Review</h3>

      {error && <p className="auth-error">{error}</p>}

      <input
        type="text"
        placeholder="Review title (e.g. 'Great for oily skin!')"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
      />

      <textarea
        placeholder="Share your honest experience with this product..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={2000}
        rows={4}
      />

      <StarInput label="Effectiveness" value={ratings.effectiveness} onChange={(v) => setRating("effectiveness", v)} />
      <StarInput label="Packaging" value={ratings.packaging} onChange={(v) => setRating("packaging", v)} />
      <StarInput label="Value for Money" value={ratings.valueForMoney} onChange={(v) => setRating("valueForMoney", v)} />

      <label className="verified-checkbox">
        <input
          type="checkbox"
          checked={verifiedPurchase}
          onChange={(e) => setVerifiedPurchase(e.target.checked)}
        />
        I purchased this product
      </label>

      <button type="submit" className="btn primary" disabled={submitting}>
        {submitting ? "Posting..." : "Post Review"}
      </button>
    </form>
  );
}
