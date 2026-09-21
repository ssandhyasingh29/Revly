import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, ChevronLeft, ChevronRight, ArrowRight, Check } from "lucide-react";

import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../config/api";

export default function TopReviewers() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [reviewers, setReviewers] = useState([]);
  const [following, setFollowing] = useState({});
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState(0);

  useEffect(() => {
    const loadReviewers = async () => {
      try {
        const data = await apiFetch("/users/top-reviewers?limit=5");

        setReviewers(Array.isArray(data) ? data : []);

        if (user?._id && Array.isArray(data)) {
          const initialFollowing = {};

          data.forEach((reviewer) => {
            initialFollowing[reviewer._id] =
              Array.isArray(reviewer.followers) &&
              reviewer.followers.some(
                (id) => id.toString() === user._id.toString()
              );
          });

          setFollowing(initialFollowing);
        }
      } catch (error) {
        console.error("Failed to load top reviewers:", error);
        setReviewers([]);
      } finally {
        setLoading(false);
      }
    };

    loadReviewers();
  }, [user]);

  const toggleFollow = async (reviewer) => {
    if (!user) {
      showToast("Log in to follow reviewers");
      return;
    }

    if (user._id === reviewer._id) return;

    const isFollowing = following[reviewer._id];

    try {
      await apiFetch(`/users/${reviewer._id}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      });

      setFollowing((prev) => ({
        ...prev,
        [reviewer._id]: !isFollowing,
      }));

      showToast(
        isFollowing
          ? `Unfollowed ${reviewer.username}`
          : `Following ${reviewer.username}`
      );
    } catch (error) {
      showToast(error.message || "Something went wrong");
    }
  };

  const openProfile = (reviewer) => {
    navigate(`/profile/${reviewer._id}`);
  };

 const visibleReviewers = reviewers.slice(start, start + 2);

const nextReviewers = () => {
  if (start < reviewers.length - 2) {
    setStart((prev) => prev + 1);
  }
};

const previousReviewers = () => {
  if (start > 0) {
    setStart((prev) => prev - 1);
  }
}; 

  return (
    <section className="reviewers-panel" id="reviewers">
      <div className="reviewers-heading">
        <div>
          <div className="reviewers-title">
            <Crown size={22} />
            <h2>Top Reviewers</h2>
          </div>

          <p>
            Meet people whose beauty reviews others find helpful.
          </p>
        </div>

        <button
          type="button"
          className="reviewers-view-all"
          onClick={() => navigate("/community")}
        >
          View All
          <ArrowRight size={15} />
        </button>
      </div>

      {loading && (
        <p className="reviewers-loading">
          Loading reviewers...
        </p>
      )}

      {!loading && reviewers.length === 0 && (
        <p className="reviewers-empty">
          No top reviewers yet.
        </p>
      )}

      {!loading && reviewers.length > 0 && (
        <div className="reviewers-carousel">
          {start > 0 && (
            <button
              type="button"
              className="reviewers-arrow reviewers-arrow-left"
              onClick={previousReviewers}
              aria-label="Previous reviewers"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div className="reviewers-list">
            {visibleReviewers.map((reviewer, index) => {
              const actualRank = start + index + 1;
              const isFollowing = following[reviewer._id];

              return (
                <article
                  className="reviewer-card"
                  key={reviewer._id}
                >
                  <div className="reviewer-rank">
                    #{actualRank}
                  </div>

                  {actualRank === 1 && (
                    <div className="reviewer-crown">
                      <Crown size={18} />
                    </div>
                  )}

                  <button
                    type="button"
                    className="reviewer-avatar-btn"
                    onClick={() => openProfile(reviewer)}
                    aria-label={`Open ${reviewer.username}'s profile`}
                  >
                    {reviewer.avatar ? (
                      <img
                        src={reviewer.avatar}
                        alt={reviewer.username}
                      />
                    ) : (
                      <span className="reviewer-avatar-placeholder">
                        {reviewer.username
                          ?.charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="reviewer-name-btn"
                    onClick={() => openProfile(reviewer)}
                  >
                    @{reviewer.username}
                  </button>

                  <div className="reviewer-helpful">
                    <span>⭐</span>
                    <span>
                      {reviewer.helpfulVotes || 0} Helpful Votes
                    </span>
                  </div>

                  <button
                    type="button"
                    className="reviewer-profile-btn"
                    onClick={() => openProfile(reviewer)}
                  >
                    View Profile
                    <ArrowRight size={14} />
                  </button>

                  <button
                    type="button"
                    className={`reviewer-follow-btn ${
                      isFollowing ? "is-following" : ""
                    }`}
                    onClick={() => toggleFollow(reviewer)}
                  >
                    {isFollowing ? (
                      <>
                        <Check size={14} />
                        Following
                      </>
                    ) : (
                      "Follow"
                    )}
                  </button>
                </article>
              );
            })}
          </div>

          {start < reviewers.length - 2 && (
            <button
              type="button"
              className="reviewers-arrow reviewers-arrow-right"
              onClick={nextReviewers}
              aria-label="Next reviewers"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}