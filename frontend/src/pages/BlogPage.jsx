import React, { useState } from "react";
import { Search } from "lucide-react";

import BlogCard from "../components/blog/BlogCard";
import blogData from "../data/blogData";

const categories = [
  "All",
  "Skincare",
  "Haircare",
  "Makeup",
  "Ingredients",
  "Beauty Guides",
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredArticles = blogData.filter((article) => {
    const matchesCategory =
      activeCategory === "All" ||
      article.category === activeCategory;

    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      article.title.toLowerCase().includes(searchText) ||
      article.excerpt.toLowerCase().includes(searchText) ||
      article.category.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="blog-page">
      <section className="blog-page-hero">
        <p className="blog-page-eyebrow">THE REVLY BEAUTY EDIT</p>

        <h1>
          Beauty tips, guides
          <br />
          & inspiration ♡
        </h1>

        <p>
          Simple, honest and useful beauty knowledge to help
          you make better choices for your skin, hair and routine.
        </p>
      </section>

      <section className="blog-page-content">
        <div className="blog-page-toolbar">
          <div className="blog-categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  activeCategory === category ? "active" : ""
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="blog-search">
            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search beauty articles..."
            />
          </div>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="blog-page-grid">
            {filteredArticles.map((article) => (
              <BlogCard
                key={article.id}
                article={article}
              />
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <span>♡</span>
            <h3>No articles found</h3>
            <p>Try another search or category.</p>
          </div>
        )}
      </section>
    </main>
  );
}