import React from "react";

import Hero from "../components/home/Hero";
import CategoryStrip from "../components/home/CategoryStrip";
import TrendingProducts from "../components/home/TrendingProducts";
import TopReview from "../components/home/TopReview";
import TopReviewers from "../components/home/TopReviewers";
import SkinTypes from "../components/home/SkinTypes";
import CommunityBanner from "../components/home/CommunityBanner";


export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryStrip />
      <TrendingProducts />

      <section className="section home-reviews-split">
        <TopReview />
        <TopReviewers />
      </section>

      <SkinTypes />
      <CommunityBanner />
      
    </>
  );
}