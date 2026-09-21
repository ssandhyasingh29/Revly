import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import {
  Sparkles,
  Heart,
  Droplets,
  Scissors,
  Smile,
  Sun,
  Leaf,
  WandSparkles,
  ArrowRight,
} from "lucide-react";

import ProductCard from "../components/home/ProductCard";
import { apiFetch } from "../config/api";

const categories = [
  {
    name: "All",
    icon: Sparkles,
  },
  {
    name: "Skincare",
    icon: Smile,
  },
  {
    name: "Haircare",
    icon: Scissors,
  },
  {
    name: "Makeup",
    icon: Smile,
  },
  {
    name: "Bodycare",
    icon: Droplets,
  },
  {
    name: "Sunscreen",
    icon: Sun,
  },
  {
    name: "Personal Care",
    icon: Leaf,
  },
  {
    name: "Tools & Others",
    icon: WandSparkles,
  },
];

const skinTypes = [
  "Oily",
  "Dry",
  "Combination",
  "Sensitive",
  "Acne-Prone",
  "Normal",
];

export default function ProductExplorePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedCategory =
    searchParams.get("category") || "All";

  const selectedSkinType =
    searchParams.get("skinType") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (selectedCategory !== "All") {
          params.set("category", selectedCategory);
        }

        if (selectedSkinType) {
          params.set("skinType", selectedSkinType);
        }

        const queryString = params.toString();

        const data = await apiFetch(
          `/products${
            queryString ? `?${queryString}` : ""
          }`
        );

        setProducts(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Failed to load products:",
          err
        );

        setError(
          err.message ||
            "Unable to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, selectedSkinType]);

  /* =================================================
     CATEGORY CHANGE
  ================================================= */

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams();

    if (category !== "All") {
      params.set("category", category);
    }

    if (selectedSkinType) {
      params.set("skinType", selectedSkinType);
    }

    const queryString = params.toString();

    navigate(
      `/product-explore${
        queryString ? `?${queryString}` : ""
      }`
    );
  };

  /* =================================================
     SKIN TYPE CHANGE
  ================================================= */

  const handleSkinTypeChange = (skinType) => {
    const params = new URLSearchParams();

    if (selectedCategory !== "All") {
      params.set("category", selectedCategory);
    }

    if (skinType) {
      params.set("skinType", skinType);
    }

    const queryString = params.toString();

    navigate(
      `/product-explore${
        queryString ? `?${queryString}` : ""
      }`
    );
  };

  /* =================================================
     SELECTED CATEGORY ICON
  ================================================= */

  const selectedCategoryData =
    categories.find(
      (category) =>
        category.name === selectedCategory
    );

  const CategoryIcon =
    selectedCategoryData?.icon || Sparkles;

  /* =================================================
     PAGE
  ================================================= */

  return (
    <main className="product-explore-page">

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="product-explore-hero">

        <div className="product-hero-content">

          <p className="product-hero-eyebrow">
            <Heart size={13} />
            EXPLORE REVLY
          </p>

          <h1>
            Find products you'll{" "}
            <span>love to revly about</span>

            <Heart
              className="hero-title-heart"
              size={27}
            />
          </h1>

          <p className="product-hero-description">
            Discover beauty products shared by
            the Revly community.
            <br />
            Explore skincare, haircare, makeup
            and more — all in one place.
          </p>

          <button
            type="button"
            className="product-hero-button"
            onClick={() =>
              navigate("/product-explore")
            }
          >
            Explore All Products
            <ArrowRight size={17} />
          </button>

        </div>

        {/* ================================================= */}
        {/* HERO PRODUCT VISUAL */}
        {/* ================================================= */}

        <div className="product-hero-visual">

          <img
            src="/images/revly-hero-products.jpg"
            alt="Beauty products"
            className="revly-hero-products-image"
          />

          <div className="hero-sparkle">
            ✦
          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* SKIN TYPE FILTER */}
      {/* ================================================= */}

      {selectedSkinType && (
        <section className="product-category-section">

          <div className="product-category-heading">

            <div>

              <p className="eyebrow">
                SKIN TYPE
              </p>

              <h2>
                Products for {selectedSkinType} Skin
              </h2>

            </div>

            <span className="product-count">
              {products.length}{" "}
              {products.length === 1
                ? "product"
                : "products"}
            </span>

          </div>

          <div className="product-category-tabs">

            <button
              type="button"
              className="product-category-tab active"
            >
              {selectedSkinType} Skin
            </button>

            <button
              type="button"
              className="product-category-tab"
              onClick={() =>
                handleSkinTypeChange("")
              }
            >
              View All Skin Types
            </button>

          </div>

        </section>
      )}


      {/* ================================================= */}
      {/* CATEGORY SECTION */}
      {/* ================================================= */}

      <section className="product-category-section">

        <div className="product-category-heading">

          <div>

            <p className="eyebrow">
              SHOP BY CATEGORY
            </p>

            <h2>
              What are you looking for?
            </h2>

          </div>

          <span className="product-count">
            {products.length}{" "}
            {products.length === 1
              ? "product"
              : "products"}
          </span>

        </div>


        {/* CATEGORY TABS */}

        <div className="product-category-tabs">

          {categories.map(
            ({ name, icon: Icon }) => (
              <button
                key={name}
                type="button"
                className={
                  selectedCategory === name
                    ? "product-category-tab active"
                    : "product-category-tab"
                }
                onClick={() =>
                  handleCategoryChange(name)
                }
              >
                <Icon size={17} />
                <span>{name}</span>
              </button>
            )
          )}

        </div>

      </section>


      {/* ================================================= */}
      {/* PRODUCTS SECTION */}
      {/* ================================================= */}

      <section className="product-explore-list">

        <div className="product-list-heading">

          <div className="product-list-title">

            <div className="product-category-icon">
              <CategoryIcon size={25} />
            </div>

            <div>

              <p className="eyebrow">

                {selectedSkinType
                  ? `${selectedSkinType.toUpperCase()} SKIN`
                  : selectedCategory === "All"
                  ? "REVLY COLLECTION"
                  : selectedCategory.toUpperCase()}

              </p>

              <h2>

                {selectedSkinType
                  ? `${selectedSkinType} Skin Products`
                  : selectedCategory === "All"
                  ? "All Beauty Products"
                  : `${selectedCategory} Products`}

              </h2>

              <p>

                {selectedSkinType
                  ? `Products suitable for ${selectedSkinType.toLowerCase()} skin.`
                  : selectedCategory === "All"
                  ? "Beauty products from the Revly community."
                  : `Products from the Revly community in ${selectedCategory.toLowerCase()}.`}

              </p>

            </div>

          </div>


          {/* VIEW ALL CATEGORY */}

          {selectedCategory !== "All" &&
            products.length > 0 && (

              <button
                type="button"
                className="view-all-category"
                onClick={() =>
                  handleCategoryChange("All")
                }
              >
                View All Products
                <ArrowRight size={15} />
              </button>

            )}

        </div>


        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (
          <div className="product-explore-state">
            Loading products...
          </div>
        )}


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {!loading && error && (
          <div className="product-explore-state">
            {error}
          </div>
        )}


        {/* ================================================= */}
        {/* EMPTY */}
        {/* ================================================= */}

        {!loading &&
          !error &&
          products.length === 0 && (

            <div className="product-explore-empty">

              <div className="product-empty-icon">
                <Heart size={28} />
              </div>

              <h3>
                No products here yet
              </h3>

              <p>
                {selectedSkinType
                  ? `No products marked as suitable for ${selectedSkinType} skin yet.`
                  : "Be the first to add a product to this category."}
              </p>

              <button
                type="button"
                className="btn primary"
                onClick={() =>
                  navigate("/add-product")
                }
              >
                + Add a Product
              </button>

            </div>

          )}


        {/* ================================================= */}
        {/* PRODUCTS */}
        {/* ================================================= */}

        {!loading &&
          !error &&
          products.length > 0 && (

            <div className="product-explore-grid">

              {products.map((product) => (

                <ProductCard
                  key={product._id}
                  product={product}
                />

              ))}

            </div>

          )}

      </section>

    </main>
  );
}