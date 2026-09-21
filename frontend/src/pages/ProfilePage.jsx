import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MessageCircle,
  ArrowLeft,
  Pencil,
  X,
} from "lucide-react";

import { apiFetch } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

import ProfileAvatar from "../components/profile/ProfileAvatar";

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    user: loggedInUser,
    updateUser,
  } = useAuth();

  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

 

  const [editingProfile, setEditingProfile] =
    useState(false);

  const [editData, setEditData] = useState({
    bio: "",
    skinType: "",
    skinConcern: "",
  });

  const [savingProfile, setSavingProfile] =
    useState(false);

 

  const [showPeople, setShowPeople] =
    useState(false);

  const [peopleType, setPeopleType] =
    useState("followers");


  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileData, reviewData] =
          await Promise.all([
            apiFetch(`/users/${id}`),
            apiFetch(`/reviews/user/${id}`),
          ]);

        setProfile(profileData);

        setReviews(
          Array.isArray(reviewData)
            ? reviewData
            : []
        );

        // Check following status
        if (loggedInUser?._id) {
          const loggedInUserId =
            String(loggedInUser._id);

          const isFollowing =
            Array.isArray(profileData.followers) &&
            profileData.followers.some(
              (follower) => {
                const followerId =
                  follower?._id || follower;

                return (
                  String(followerId) ===
                  loggedInUserId
                );
              }
            );

          setFollowing(isFollowing);
        } else {
          setFollowing(false);
        }
      } catch (err) {
        console.error(
          "Failed to load profile:",
          err
        );

        setError(
          err.message ||
            "Unable to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, loggedInUser?._id]);

 

  const isOwnProfile =
    String(loggedInUser?._id) ===
    String(id);



  const startEditingProfile = () => {
    setEditData({
      bio: profile.bio || "",
      skinType: profile.skinType || "",
      skinConcern:
        profile.skinConcern || "",
    });

    setEditingProfile(true);
  };



  const handleEditChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  

  const saveProfile = async () => {
    try {
      setSavingProfile(true);

      const updatedProfile =
        await apiFetch(
          `/users/${id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              bio: editData.bio,
              skinType: editData.skinType,
              skinConcern:
                editData.skinConcern,
            }),
          }
        );

      setProfile((prev) => ({
        ...prev,
        ...updatedProfile,
      }));

      // Update logged-in AuthContext too
      if (isOwnProfile) {
        updateUser({
          bio: updatedProfile.bio,
          skinType:
            updatedProfile.skinType,
          skinConcern:
            updatedProfile.skinConcern,
        });
      }

      setEditingProfile(false);

      showToast(
        "Profile updated successfully!"
      );
    } catch (err) {
      showToast(
        err.message ||
          "Unable to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  

  const handleFollowToggle = async () => {
    if (!loggedInUser) {
      showToast("Log in to follow people");
      return;
    }

    if (isOwnProfile) {
      return;
    }

    try {
      setFollowLoading(true);

      await apiFetch(
        `/users/${id}/follow`,
        {
          method: following
            ? "DELETE"
            : "POST",
        }
      );

      const newFollowing =
        !following;

      setFollowing(newFollowing);

      setProfile((prev) => ({
        ...prev,
        followersCount: Math.max(
          0,
          (prev.followersCount || 0) +
            (newFollowing ? 1 : -1)
        ),
        followers: newFollowing
          ? [
              ...(prev.followers || []),
              loggedInUser,
            ]
          : (prev.followers || []).filter(
              (follower) => {
                const followerId =
                  follower?._id ||
                  follower;

                return (
                  String(followerId) !==
                  String(loggedInUser._id)
                );
              }
            ),
      }));

      showToast(
        newFollowing
          ? `Following ${profile.username}`
          : `Unfollowed ${profile.username}`
      );
    } catch (err) {
      showToast(
        err.message ||
          "Something went wrong"
      );
    } finally {
      setFollowLoading(false);
    }
  };

  

  const openConversation = async () => {
    if (!loggedInUser) {
      showToast(
        "Log in to send a message"
      );
      return;
    }

    if (isOwnProfile) {
      return;
    }

    try {
      const conversation =
        await apiFetch(
          "/conversations",
          {
            method: "POST",
            body: JSON.stringify({
              userId: id,
            }),
          }
        );

      navigate("/messages", {
        state: {
          conversationId:
            conversation._id,
        },
      });
    } catch (err) {
      showToast(
        err.message ||
          "Unable to start conversation"
      );
    }
  };

  

  const openPeople = (type) => {
    setPeopleType(type);
    setShowPeople(true);
  };

  

  const scrollToReviews = () => {
    document
      .getElementById("profile-reviews-section")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

 

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </main>
    );
  }

 

  if (error || !profile) {
    return (
      <main className="profile-page">
        <div className="profile-error">
          <h2>Profile not found</h2>

          <button
            onClick={() =>
              navigate("/community")
            }
          >
            Back to Community
          </button>
        </div>
      </main>
    );
  }

  

  return (
    <main className="profile-page">

      

      <button
        className="profile-back"
        onClick={() =>
          navigate("/community")
        }
      >
        <ArrowLeft size={18} />
        Back to Community
      </button>


      <section className="profile-card">

        <div className="profile-avatar-large">

          {isOwnProfile ? (
            <ProfileAvatar
              user={profile}
              onAvatarUpdated={(newAvatar) => {
                setProfile((prev) => ({
                  ...prev,
                  avatar: newAvatar,
                }));

                updateUser({
                  avatar: newAvatar,
                });
              }}
            />
          ) : (
            <>
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                />
              ) : (
                <span>
                  {profile.username
                    ?.charAt(0)
                    .toUpperCase()}
                </span>
              )}
            </>
          )}

        </div>

        <div className="profile-main-info">

          <div className="profile-name-row">
            <h1>
              {profile.username}
            </h1>

            {profile.badge && (
              <span className="profile-badge">
                {profile.badge}
              </span>
            )}
          </div>

          <p className="profile-username">
            @{profile.username}
          </p>

          {profile.bio && (
            <p className="profile-bio">
              {profile.bio}
            </p>
          )}

          <div className="profile-details">

            {profile.skinType && (
              <span>
                🌸 {profile.skinType} Skin
              </span>
            )}

            {profile.skinConcern && (
              <span>
                ✨ {profile.skinConcern}
              </span>
            )}

          </div>

          <div className="profile-actions">

            {!isOwnProfile && (
              <button
                className="profile-follow-btn"
                onClick={
                  handleFollowToggle
                }
                disabled={followLoading}
              >
                {followLoading
                  ? "..."
                  : following
                  ? "Following"
                  : "Follow"}
              </button>
            )}

            {!isOwnProfile && (
              <button
                className="profile-message-btn"
                onClick={
                  openConversation
                }
              >
                <MessageCircle
                  size={18}
                />
                Message
              </button>
            )}

          </div>

        </div>
      </section>

      

      <section className="profile-stats">

        

        <button
          type="button"
          onClick={scrollToReviews}
          className="profile-stat-button"
        >
          <strong>
            {profile.reviewsCount || 0}
          </strong>

          <span>Reviews</span>
        </button>

       

        <button
          type="button"
          onClick={() =>
            openPeople("followers")
          }
          className="profile-stat-button"
        >
          <strong>
            {profile.followersCount || 0}
          </strong>

          <span>Followers</span>
        </button>

       

        <button
          type="button"
          onClick={() =>
            openPeople("following")
          }
          className="profile-stat-button"
        >
          <strong>
            {profile.followingCount || 0}
          </strong>

          <span>Following</span>
        </button>

       

        <div className="profile-stat-item">
          <strong>
            {profile.helpfulVotes || 0}
          </strong>

          <span>
            Helpful Votes
          </span>
        </div>

      </section>

      

      <section className="profile-content">

        

        <div className="profile-section">

          <div className="profile-section-header">

            <h2>
              About {profile.username}
            </h2>

            {isOwnProfile && (
              <button
                type="button"
                className="profile-edit-btn"
                onClick={
                  startEditingProfile
                }
              >
                <Pencil size={15} />
                Edit
              </button>
            )}

          </div>

          {editingProfile &&
          isOwnProfile ? (
            <div className="profile-edit-form">

              <label>
                About Me
              </label>

              <textarea
                value={editData.bio}
                onChange={(e) =>
                  handleEditChange(
                    "bio",
                    e.target.value
                  )
                }
                maxLength={200}
                placeholder="Tell people a little about yourself..."
              />

              <div className="profile-edit-actions">

                <button
                  type="button"
                  onClick={() =>
                    setEditingProfile(false)
                  }
                  className="profile-cancel-btn"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="profile-save-btn"
                >
                  {savingProfile
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </div>
          ) : (
            <p>
              {profile.bio ||
                "This user hasn't added a bio yet."}
            </p>
          )}

        </div>


        <div className="profile-section">

          <div className="profile-section-header">

            <h2>
              Beauty Profile
            </h2>

            {isOwnProfile &&
              !editingProfile && (
                <button
                  type="button"
                  className="profile-edit-btn"
                  onClick={
                    startEditingProfile
                  }
                >
                  <Pencil size={15} />
                  Edit
                </button>
              )}

          </div>

          {editingProfile &&
          isOwnProfile ? (
            <div className="profile-edit-form">

              <label>
                Skin Type
              </label>

              <select
                value={editData.skinType}
                onChange={(e) =>
                  handleEditChange(
                    "skinType",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select skin type
                </option>

                <option value="Oily">
                  Oily
                </option>

                <option value="Dry">
                  Dry
                </option>

                <option value="Combination">
                  Combination
                </option>

                <option value="Sensitive">
                  Sensitive
                </option>

                <option value="Normal">
                  Normal
                </option>

                <option value="Acne-Prone">
                  Acne-Prone
                </option>
              </select>

              <label>
                Main Concern
              </label>

              <input
                type="text"
                value={
                  editData.skinConcern
                }
                onChange={(e) =>
                  handleEditChange(
                    "skinConcern",
                    e.target.value
                  )
                }
                placeholder="e.g. Acne, pigmentation, dryness..."
              />

              <div className="profile-edit-actions">

                <button
                  type="button"
                  onClick={() =>
                    setEditingProfile(false)
                  }
                  className="profile-cancel-btn"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="profile-save-btn"
                >
                  {savingProfile
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </div>
          ) : (
            <div className="beauty-info">

              <div>
                <span>
                  Skin Type
                </span>

                <strong>
                  {profile.skinType ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>
                  Main Concern
                </span>

                <strong>
                  {profile.skinConcern ||
                    "Not specified"}
                </strong>
              </div>

            </div>
          )}

        </div>

       
        <div
          className="profile-section"
          id="profile-reviews-section"
        >

          <div className="profile-section-header">

            <h2>
              Reviews
            </h2>

            <span className="profile-review-count">
              {reviews.length}
            </span>

          </div>

          {reviews.length === 0 ? (
            <div className="empty-reviews">
              <p>
                No reviews yet.
              </p>
            </div>
          ) : (
            <div className="profile-reviews">

              {reviews.map((review) => {

                const averageRating =
                  review.ratings
                    ? (
                        (
                          review.ratings
                            .effectiveness +
                          review.ratings
                            .packaging +
                          review.ratings
                            .valueForMoney
                        ) / 3
                      ).toFixed(1)
                    : "0.0";

                return (
                  <div
                    className="profile-review-card"
                    key={review._id}
                  >

                   

                    <div className="profile-review-product">

                      {review.product
                        ?.image && (
                        <img
                          src={
                            review.product
                              .image
                          }
                          alt={
                            review.product
                              .name
                          }
                          className="profile-review-product-image"
                        />
                      )}

                      <div>

                        <p className="review-product-brand">
                          {
                            review.product
                              ?.brand
                          }
                        </p>

                        <h3>
                          {
                            review.product
                              ?.name
                          }
                        </h3>

                      </div>

                    </div>

                    

                    <h4>
                      {review.title}
                    </h4>

                    

                    <p>
                      {review.text}
                    </p>

                   

                    <div className="profile-review-rating">
                      ⭐ {averageRating}
                    </div>

                   

                    <div className="profile-review-helpful">
                      ♡{" "}
                      {review.likesCount ||
                        review.likes?.length ||
                        0}{" "}
                      helpful
                    </div>

                   

                    <small>
                      {new Date(
                        review.createdAt
                      ).toLocaleDateString()}
                    </small>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </section>

     

      {showPeople && (
        <div
          className="profile-people-overlay"
          onClick={() =>
            setShowPeople(false)
          }
        >

          <div
            className="profile-people-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="profile-people-header">

              <h2>
                {peopleType ===
                "followers"
                  ? "Followers"
                  : "Following"}
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowPeople(false)
                }
                className="profile-people-close"
              >
                <X size={20} />
              </button>

            </div>

            <div className="profile-people-list">

              {(profile[peopleType] || [])
                .length === 0 ? (
                <p className="empty-text">
                  {peopleType ===
                  "followers"
                    ? "No followers yet."
                    : "Not following anyone yet."}
                </p>
              ) : (
                profile[peopleType].map(
                  (person) => {

                    const personId =
                      person?._id ||
                      person;

                    const personName =
                      person?.username ||
                      "User";

                    return (
                      <button
                        type="button"
                        key={personId}
                        className="profile-person-row"
                        onClick={() => {
                          setShowPeople(
                            false
                          );

                          navigate(
                            `/profile/${personId}`
                          );
                        }}
                      >

                        <div className="profile-person-avatar">

                          {person?.avatar ? (
                            <img
                              src={
                                person.avatar
                              }
                              alt={
                                personName
                              }
                            />
                          ) : (
                            <span>
                              {personName
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </span>
                          )}

                        </div>

                        <div>
                          <strong>
                            {personName}
                          </strong>

                          {person?.badge && (
                            <span>
                              {person.badge}
                            </span>
                          )}
                        </div>

                      </button>
                    );
                  }
                )
              )}

            </div>

          </div>

        </div>
      )}

    </main>
  );
}
