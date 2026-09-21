import React from "react";
export default function SectionTitle({ title, action = "View All", onAction }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      <button onClick={onAction}>{action}</button>
    </div>
  );
}