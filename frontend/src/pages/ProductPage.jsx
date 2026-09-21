import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import Rating from "../components/common/Rating";
import ReviewCard from "../components/reviews/ReviewCard";
import WriteReviewForm from "../components/reviews/WriteReviewForm";
import { apiFetch } from "../config/api";

import "../styles/ProductPage.css";

export default function ProductPage() {
  
  // this is what tells the page WHICH product to load.
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);

  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetching both at once
    Promise.all([
      apiFetch(`/products/${id}`),
      apiFetch(`/reviews/product/${id}`),
    ])
      .then(([productData, reviewData]) => {
        setProduct(productData);
        setReviews(reviewData);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Called by WriteReviewForm the instant a new review is posted
  const handleReviewAdded = (review) => {
  
  setReviews((prev) => [review, ...prev]);

  // Immediately update product rating and review count
  setProduct((prev) => ({
    ...prev,
    rating: review.productRating,
    reviewsCount: review.productReviewsCount,
  }));
};

  if (loading) return <p className="loading-text">Loading product...</p>;
  if (!product) return <p className="empty-text">Product not found.</p>;

  return (
    <div className="product-page">
      <section className="product-page-header">
<button
  type="button"
  className="product-main-image-btn"
  onClick={() => setShowFullImage(true)}
  aria-label={`View ${product.name} image`}
>
  <img
    src={product.image}
    alt={product.name}
    className="product-main-image"
  />
</button> 


        <div>
          <p className="product-brand">{product.brand}</p>
          <h1>{product.name}</h1>
          <Rating value={product.rating} reviews={product.reviewsCount} />
          <span className="product-category">{product.category}</span>
        </div>
      </section>

      <section className="product-page-reviews">
        <h2>Reviews ({reviews.length})</h2>
        {!reviews.length && <p className="empty-text">No reviews yet — be the first!</p>}
        {reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
      </section>

      <WriteReviewForm productId={id} onReviewAdded={handleReviewAdded} />

   {/* full image overlay */}         

{showFullImage && (
  <div
    className="full-image-overlay"
    onClick={() => setShowFullImage(false)}
  >
    <div
      className="full-image-container"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="full-image-close"
        onClick={() => setShowFullImage(false)}
        aria-label="Close image"
      >
        ×
      </button>

      <img
        src={product.image}
        alt={product.name}
        className="full-product-image"
      />
    </div>
  </div>
)}
    </div>
  );
}
