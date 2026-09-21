import React, { useState } from "react";
import { Heart, CheckCircle  } from "lucide-react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function ReviewCard({ review }) {
  const { user } = useAuth();
  const { showToast } = useToast();


  const [likesCount, setLikesCount] = useState(
    review.likesCount ?? review.likes?.length ?? 0
  );

  const [liked, setLiked] = useState(
    review.likes?.some(
      (id) => String(id) === String(user?._id)
    )
  );

  const handleLike = async () => {
    if (!user) {
      showToast("Log in to mark a review helpful");
      return;
    }

    try {
      const result = await apiFetch(
        `/reviews/${review._id}/like`,
        {
          method: "POST",
        }
      );

      setLikesCount(result.likesCount);
      setLiked(result.liked);
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <article className="review-card">

     

{review.product && (
  <div className="review-product">

    {review.product.image && (
      <Link
        to={`/product/${review.product._id}`}
        className="review-product-image-link"
      >
        <img
          src={review.product.image}
          alt={review.product.name}
          className="review-product-image"
        />
      </Link>
    )}

    <div className="review-product-info">
      <strong>{review.product.name}</strong>

      <span>
        {review.product.brand}
      </span>
    </div>

  </div>
)}

     

      <div className="review-author">

        {review.user?.avatar ? (
          <img
            src={review.user.avatar}
            alt={review.user.username}
          />
        ) : (
          <div className="review-author-placeholder">
            {review.user?.username
              ?.charAt(0)
              .toUpperCase()}
          </div>
        )}

        <div>
          <strong>
            @{review.user?.username}
          </strong>

          {review.user?.badge && (
            <span>{review.user.badge}</span>
          )}

          <small>
            {review.createdAt
              ? new Date(
                  review.createdAt
                ).toLocaleDateString()
              : ""}
          </small>
        </div>

      </div>

      

      <h3>{review.title}</h3>

      <p>{review.text}</p>

     
      <div className="review-bars">

        {Object.entries(
          review.ratings || {}
        ).map(([label, value]) => (

          <div key={label}>

            <span>
              {label === "valueForMoney"
                ? "Value for Money"
                : label[0].toUpperCase() +
                  label.slice(1)}
            </span>

            <b>
              {"★".repeat(value)}
              {"☆".repeat(5 - value)}
            </b>

          </div>

        ))}

      </div>

     
      <div className="review-footer">

        <button
          onClick={handleLike}
          className={liked ? "liked" : ""}
        >
          <Heart
            size={14}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />

          {likesCount}
        </button>

        {review.verifiedPurchase && (
          <small>
            <CheckCircle size={13} />
            Verified Purchase
          </small>
        )}

      </div>

    </article>
  );
}
