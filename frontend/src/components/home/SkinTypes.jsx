import React from "react";
import SectionTitle from "../common/SectionTitle";
import { useNavigate } from "react-router-dom";

const skins = [
  ["Oily Skin", "👩🏻‍🦰", "Oily"],
  ["Dry Skin", "👩🏻", "Dry"],
  ["Combination Skin", "👩🏼‍🦱", "Combination"],
  ["Sensitive Skin", "👵🏻", "Sensitive"],
  ["Acne-Prone Skin", "👩🏻‍🦰", "Acne-Prone"],
  ["Normal Skin", "👩🏽", "Normal"],
];

export default function SkinTypes() {
  const navigate = useNavigate();

  const handleSkinTypeClick = (skinType) => {
    navigate(
      `/product-explore?skinType=${encodeURIComponent(skinType)}`
    );
  };

  return (
    <section className="section skin-section">

      <SectionTitle title="Explore by Skin Type" />

      <div className="skin-grid">

        {skins.map(([name, emoji, skinType]) => (

          <button
            key={name}
            type="button"
            onClick={() => handleSkinTypeClick(skinType)}
          >
            <span>{emoji}</span>
            <strong>{name}</strong>
          </button>

        ))}

      </div>

    </section>
  );
}