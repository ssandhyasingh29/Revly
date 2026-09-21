import React, { useEffect, useState } from "react";

import ReviewCard from "../components/reviews/ReviewCard";
import { apiFetch } from "../config/api";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch("/reviews");

        setReviews(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load reviews:",
          err
        );

        setError(
          err.message ||
            "Unable to load reviews"
        );
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  if (loading) {
    return (
      <main className="reviews-page">
        <div className="reviews-loading">
          Loading reviews...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="reviews-page">
        <div className="reviews-error">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="reviews-page">

      <section className="reviews-header">
        <p className="eyebrow">
          ♡ BEAUTY REVIEWS
        </p>

        <h1>
          Honest Reviews from
          <em> Beauty Lovers ♡</em>
        </h1>

        <p>
          Discover real experiences and
          honest opinions about beauty
          products from the Revly community.
        </p>
      </section>

      {reviews.length === 0 ? (
        <div className="reviews-empty">
          <h2>No reviews yet</h2>

          <p>
            Be the first person to review
            a product on Revly.
          </p>
        </div>
      ) : (
        <section className="reviews-grid">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
            />
          ))}
        </section>
      )}

    </main>
  );
}