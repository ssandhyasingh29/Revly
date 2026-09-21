import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import SectionTitle from "../common/SectionTitle";
import BlogCard from "../blog/BlogCard";
import blogData from "../../data/blogData";

export default function BlogSection() {
  const navigate = useNavigate();

  const latestArticles = blogData.slice(0, 3);

  return (
    <section className="section blog-section" id="blog">
      <div className="blog-heading">
        <SectionTitle title="Latest from the Revly Blog" />

        <button
          type="button"
          className="blog-view-all"
          onClick={() => navigate("/blog")}
        >
          View All
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="blog-grid">
        {latestArticles.map((article) => (
          <BlogCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}