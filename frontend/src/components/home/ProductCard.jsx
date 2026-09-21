import React from "react";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Rating from "../common/Rating";

export default function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  return (
    <article className="product-card" onClick={() => navigate(`/product/${product._id}`)}>
      <button className={`heart ${liked ? "liked" : ""}`} onClick={(e) => { e.stopPropagation(); setLiked(v => !v); }}>
        <Heart size={17} fill={liked ? "currentColor" : "none"} />
      </button>
      <div className="product-image"><img src={product.image} alt={product.name}/></div>
      <p className="product-brand">{product.brand}</p>
      <h3>{product.name}</h3>
      <Rating value={product.rating} reviews={product.reviewsCount} />
    </article>
  );
}
