import React from "react";
export default function Rating({ value, reviews }) {
  return (
    <div className="rating">
      <span>★</span> {value} <small>({reviews} reviews)</small>
    </div>
  );
}