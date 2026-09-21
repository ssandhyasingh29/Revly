import React from "react";
import { Star } from "lucide-react";

// A small, reusable star picker 
export default function StarInput({ label, value, onChange }) {
  return (
    <div className="star-input-row">
      <span>{label}</span>
      <div className="star-input">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => onChange(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star size={20} fill={n <= value ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
    </div>
  );
}
