import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function CommunityBanner() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <section className="community-banner">
        <div className="community-people">
          {["👩🏿", "👩🏾", "👩🏻", "👩🏼", "👩🏽"].map((x, i) => (
            <span key={i}>{x}</span>
          ))}
        </div>

        <div>
          <h2>Join Our Beautiful Community ♡</h2>
          <p>
            Share your experience, help others, and find your perfect match.
          </p>
        </div>

        <div className="banner-actions">
          <button className="btn primary" onClick={() => navigate("/register")}>
            Register Now
          </button>

          <button className="btn outline" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="community-banner welcome-banner">
      <div className="welcome-avatar-wrapper">
  <div className="welcome-avatar">
    {user.avatar ? (
      <img src={user.avatar} alt={user.username} />
    ) : (
      <span>{user.username?.charAt(0).toUpperCase()}</span>
    )}
  </div>

  <span className="welcome-floating-heart">♡</span>
</div>

      <div className="welcome-content">
        <span className="welcome-eyebrow">WELCOME TO REVLY</span>

        <h2>
          Welcome back, <span>{user.username}</span>
        </h2>

        <p>
          You're part of our beautiful community now. Explore honest reviews,
          discover beauty lovers and share what works for you.
        </p>
      </div>

      <div className="banner-actions welcome-actions">
        <button
          className="btn primary"
          onClick={() => navigate("/community")}
        >
          Explore Community
        </button>

        <button
          className="btn outline"
          onClick={() => navigate("/add-product")}
        >
          Add a Product
        </button>
      </div>
    </section>
  );
}