import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProductCard from "./ProductCard";
import { apiFetch } from "../../config/api";

export default function TrendingProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState(0);

  useEffect(() => {
    apiFetch("/products/trending?limit=12")
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = products.slice(start, start + 6);

  return (
    <section className="section" id="products">
      <div className="trending-section-heading">
        <h2></h2>

        <button
          type="button"
          className="trending-view-all"
          onClick={() => navigate("/product-explore")}
        >
          View All →
        </button>
      </div>

      {loading && (
        <p className="loading-text">
          Loading trending products...
        </p>
      )}

      {!loading && !products.length && (
        <p className="empty-text">
          No products yet — be the first to add one!
        </p>
      )}

      <div className="product-grid">
        {visible.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      {products.length > 6 && (
        <div className="carousel-controls">
          <button
            type="button"
            onClick={() => setStart(Math.max(0, start - 1))}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() =>
              setStart(
                Math.min(
                  Math.max(products.length - 6, 0),
                  start + 1
                )
              )
            }
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}