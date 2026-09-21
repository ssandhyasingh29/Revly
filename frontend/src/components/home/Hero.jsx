import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../config/api";

export default function Hero() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    users: 0,
    reviews: 0,
    products: 0,
    topReviewers: 0,
  });

 useEffect(() => {
  const fetchStats = async () => {
    try {
      const data = await apiFetch("/stats");

      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  fetchStats();
}, []);

  const formatNumber = (number) => {
    if (number >= 1000000) {
      const value = number / 1000000;
      return `${Number(value.toFixed(1))}M+`;
    }

    if (number >= 1000) {
      const value = number / 1000;
      return `${Number(value.toFixed(1))}K+`;
    }

    return `${number}+`;
  };

  // Explore Reviews button
  const handleExploreReviews = () => {
   navigate("/reviews");
  };

  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">✨ BEAUTY COMMUNITY</p>

        <h1>
          Real People.
          <br />
          Real Reviews.
        </h1>

        <h2>Real Beautiful You. ♡</h2>

        <p>
          Discover honest reviews from people with skin like yours.
          Choose products that truly work for YOU!
        </p>

        <div className="hero-actions">

          {/* EXPLORE REVIEWS */}
          <button
            className="btn primary"
            type="button"
            onClick={handleExploreReviews}
          >
            Explore Reviews <ArrowRight size={16} />
          </button>

          {/* JOIN COMMUNITY */}
          <button
            className="btn outline"
            type="button"
            onClick={() => {
              navigate("/community");
              showToast("Let's find your beauty community!");
            }}
          >
            Join the Community
          </button>

        </div>

        <div className="hero-stats">
          <div>
            <strong>{formatNumber(stats.users)}</strong>
            <span>Happy Users</span>
          </div>

          <div>
            <strong>{formatNumber(stats.reviews)}</strong>
            <span>Reviews</span>
          </div>

          <div>
            <strong>{formatNumber(stats.products)}</strong>
            <span>Products</span>
          </div>

          <div>
            <strong>{formatNumber(stats.topReviewers)}</strong>
            <span>Top Reviewers</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85"
            alt="Beauty creator"
          />
        </div>

        <div className="hero-bubble">
          <strong>
            Find what
            <br />
            works for you
          </strong>

          <em>skin, together. ♡</em>
        </div>
      </div>
    </section>
  );
}