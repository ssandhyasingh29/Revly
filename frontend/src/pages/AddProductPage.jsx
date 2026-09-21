import React, {
  useRef,
  useState,
} from "react";

import {
  Search,
  Plus,
  X,
  Image,
  LoaderCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { apiFetch } from "../config/api";
import { useToast } from "../context/ToastContext";

export default function AddProductPage() {
  const navigate = useNavigate();

  const { showToast } = useToast();

  const fileInputRef =
    useRef(null);

  // ==========================================
  // EXISTING PRODUCT SEARCH
  // ==========================================

  const [search, setSearch] =
    useState("");

  const [
    existingProducts,
    setExistingProducts,
  ] = useState([]);

  const searchExistingProducts =
    async (value) => {
      setSearch(value);

      if (!value.trim()) {
        setExistingProducts([]);
        return;
      }

      try {
        const data = await apiFetch(
          `/products/search?q=${encodeURIComponent(
            value
          )}`
        );

        setExistingProducts(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        setExistingProducts([]);
      }
    };

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] =
    useState({
      name: "",
      brand: "",
      category: "Skincare",
      skinTypes: [],
    });

  // ==========================================
  // PRODUCT IMAGE
  // ==========================================

  const [productImage, setProductImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  // ==========================================
  // OPTIONS
  // ==========================================

  const skinTypes = [
    "Oily",
    "Dry",
    "Combination",
    "Sensitive",
    "Normal",
    "Acne-Prone",
  ];

  const categories = [
    "Skincare",
    "Haircare",
    "Makeup",
    "Bodycare",
    "Sunscreen",
    "Personal Care",
    "Tools & Others",
  ];

  // ==========================================
  // NORMAL INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // SKIN TYPE CHANGE
  // ==========================================

  const handleSkinTypeChange =
    (skinType) => {
      setFormData((prev) => {
        const alreadySelected =
          prev.skinTypes.includes(
            skinType
          );

        return {
          ...prev,

          skinTypes:
            alreadySelected
              ? prev.skinTypes.filter(
                  (type) =>
                    type !== skinType
                )
              : [
                  ...prev.skinTypes,
                  skinType,
                ],
        };
      });
    };

  // ==========================================
  // IMAGE SELECTION
  // ==========================================

  const handleImageChange = (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    // Allowed types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      showToast(
        "Please select a JPG, PNG, or WebP image"
      );

      e.target.value = "";

      return;
    }

    // 5 MB
    if (
      file.size >
      5 * 1024 * 1024
    ) {
      showToast(
        "Product image must be smaller than 5 MB"
      );

      e.target.value = "";

      return;
    }

    setProductImage(file);

    // Preview
    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(
      previewUrl
    );

    e.target.value = "";
  };

  // ==========================================
  // REMOVE SELECTED IMAGE
  // ==========================================

  const removeSelectedImage =
    () => {
      setProductImage(null);
      setImagePreview("");
    };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast(
        "Please enter the product name"
      );

      return;
    }

    if (!formData.brand.trim()) {
      showToast(
        "Please enter the brand name"
      );

      return;
    }

    if (!productImage) {
      showToast(
        "Please upload a product image"
      );

      return;
    }

    if (
      !formData.skinTypes.length
    ) {
      showToast(
        "Please select at least one skin type"
      );

      return;
    }

    try {
      setSubmitting(true);

      // ======================================
      // CREATE FORMDATA
      // ======================================

      const data =
        new FormData();

      data.append(
        "name",
        formData.name.trim()
      );

      data.append(
        "brand",
        formData.brand.trim()
      );

      data.append(
        "category",
        formData.category
      );

      data.append(
        "skinTypes",
        JSON.stringify(
          formData.skinTypes
        )
      );

      data.append(
        "image",
        productImage
      );

      // ======================================
      // SEND TO BACKEND
      // ======================================

      const stored =
        localStorage.getItem(
          "revlyUser"
        );

      const token = stored
        ? JSON.parse(stored).token
        : null;

      const response =
        await fetch(
          `${
            import.meta.env
              .VITE_API_URL ||
            "http://localhost:5001/api"
          }/products`,
          {
            method: "POST",

            headers: {
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },

            body: data,
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to add product"
        );
      }

      // ======================================
      // SUCCESS
      // ======================================

      showToast(
        "Product added successfully!"
      );

      navigate(
        `/product/${result._id}`
      );
    } catch (err) {
      console.error(
        "Add product error:",
        err
      );

      showToast(
        err.message ||
          "Failed to add product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // CANCEL
  // ==========================================

  const handleCancel = () => {
    navigate("/");
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="add-product-page">
      <div className="add-product-container">
        <div className="add-product-card">

          {/* =====================================
              CHECK EXISTING PRODUCTS
          ===================================== */}

          <section className="existing-product-section">
            <div className="add-product-section-heading">
              <div className="section-icon">
                <Search size={25} />
              </div>

              <div>
                <h2>
                  Check Existing Products
                </h2>

                <p>
                  Search before adding a new
                  product.
                </p>
              </div>
            </div>

            {/* SEARCH */}

            <div className="product-search-box">
              <Search size={20} />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  searchExistingProducts(
                    e.target.value
                  )
                }
                placeholder="Search product name..."
              />

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => {
                    setSearch("");
                    setExistingProducts(
                      []
                    );
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* SEARCH RESULTS */}

            {existingProducts.length >
              0 && (
              <div className="existing-products-list">
                <p className="existing-products-label">
                  Product already available
                </p>

                {existingProducts.map(
                  (product) => (
                    <button
                      type="button"
                      className="existing-product-item"
                      key={product._id}
                      onClick={() =>
                        navigate(
                          `/product/${product._id}`
                        )
                      }
                    >
                      <img
                        src={
                          product.image
                        }
                        alt={
                          product.name
                        }
                      />

                      <div>
                        <strong>
                          {
                            product.name
                          }
                        </strong>

                        <span>
                          {
                            product.brand
                          }
                        </span>
                      </div>

                      <span className="view-product">
                        View →
                      </span>
                    </button>
                  )
                )}
              </div>
            )}
          </section>

          {/* =====================================
              DIVIDER
          ===================================== */}

          <div className="add-product-divider">
            <span>
              <Plus size={17} />
            </span>
          </div>

          {/* =====================================
              ADD NEW PRODUCT
          ===================================== */}

          <section className="new-product-section">
            <div className="add-product-section-heading">
              <div className="section-icon">
                <Plus size={25} />
              </div>

              <div>
                <h2>
                  Add New Product
                </h2>

                <p>
                  Enter the product details
                  below.
                </p>
              </div>
            </div>

            {/* FORM */}

            <form
              className="add-product-form"
              onSubmit={
                handleSubmit
              }
            >
              {/* PRODUCT NAME */}

              <div className="add-product-field">
                <label>
                  Product Name{" "}
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Niacinamide 10% Serum"
                />
              </div>

              {/* BRAND */}

              <div className="add-product-field">
                <label>
                  Brand{" "}
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="brand"
                  value={
                    formData.brand
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. The Ordinary"
                />
              </div>

              {/* =================================
                  PRODUCT IMAGE
              ================================= */}

              <div className="add-product-field">
                <label>
                  Product Image{" "}
                  <span>*</span>
                </label>

                {!imagePreview ? (
                  <button
                    type="button"
                    className="product-image-upload-box"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={
                      submitting
                    }
                  >
                    <Image
                      size={30}
                    />

                    <strong>
                      Upload Product Photo
                    </strong>

                    <small>
                      JPG, PNG or WebP ·
                      Max 5 MB
                    </small>
                  </button>
                ) : (
                  <div className="product-image-preview">
                    <img
                      src={
                        imagePreview
                      }
                      alt="Product preview"
                    />

                    <button
                      type="button"
                      className="remove-product-image"
                      onClick={
                        removeSelectedImage
                      }
                      disabled={
                        submitting
                      }
                      aria-label="Remove product image"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  hidden
                />

                <small>
                  Upload a clear photo of the
                  product.
                </small>
              </div>

              {/* CATEGORY */}

              <div className="add-product-field">
                <label>
                  Category{" "}
                  <span>*</span>
                </label>

                <select
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                >
                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* =================================
                  SKIN TYPES
              ================================= */}

              <div className="add-product-field skin-types-field">
                <label>
                  Suitable Skin Types{" "}
                  <span>*</span>
                </label>

                <p className="field-description">
                  Select all skin types this
                  product is suitable for.
                </p>

                <div className="skin-types">
                  {skinTypes.map(
                    (type) => (
                      <div
                        className="skin-type-option"
                        key={type}
                      >
                        <input
                          id={`skin-${type}`}
                          type="checkbox"
                          value={type}
                          checked={formData.skinTypes.includes(
                            type
                          )}
                          onChange={() =>
                            handleSkinTypeChange(
                              type
                            )
                          }
                        />

                        <label
                          htmlFor={`skin-${type}`}
                        >
                          {type}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* =================================
                  BUTTONS
              ================================= */}

              <div className="add-product-actions">
                <button
                  type="button"
                  className="cancel-product-btn"
                  onClick={
                    handleCancel
                  }
                  disabled={
                    submitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-product-submit"
                  disabled={
                    submitting
                  }
                >
                  {submitting ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="avatar-spinner"
                      />

                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />

                      Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}