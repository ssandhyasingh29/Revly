import React from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  ["♧", "Skincare"],
  ["♧", "Haircare"],
  ["♢", "Makeup"],
  ["♧", "Bodycare"],
  ["☼", "Sunscreen"],
  ["♡", "Personal Care"],
  ["♧", "Tools & Others"],
  ["◌", "View All"],
];

export default function CategoryStrip() {
  const navigate = useNavigate();

  const handleCategoryClick = (label) => {
    if (label === "View All") {
      navigate("/product-explore");
      return;
    }

    navigate(
      `/product-explore?category=${encodeURIComponent(label)}`
    );
  };

  return (
    <section className="category-strip">
      {categories.map(([icon, label]) => (
        <button
          key={label}
          type="button"
          onClick={() => handleCategoryClick(label)}
        >
          <span>{icon}</span>
          <strong>{label}</strong>
        </button>
      ))}
    </section>
  );
}