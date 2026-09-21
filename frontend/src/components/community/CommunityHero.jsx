import React from "react";
import { useNavigate } from "react-router-dom";
export default function CommunityHero() {
  const navigate = useNavigate();
  return (
    <section className="community-hero">
      <div>
        <p className="eyebrow">♡ OUR BEAUTY COMMUNITY</p>
        <h1>Discover & Connect<br/><em>with Beauty Lovers like You ♡</em></h1>
        <p>Follow people, read honest reviews, share your experience and be part of our beautiful community.</p>
       <button
       className="btn primary"
       onClick={() => navigate("/add-product")}
        >
        + Add a Product
       </button>   
      </div>
      <div className="hero-faces">{["👩🏻‍🦰","👩🏽","👩🏿","👩🏼‍🦱","👩🏻"].map((x,i)=><span key={i}>{x}</span>)}</div>
    </section>
  );
}