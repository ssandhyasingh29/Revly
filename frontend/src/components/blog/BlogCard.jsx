import React from "react";
import { ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BlogCard({ article }) {
  const navigate = useNavigate();

  return (
    <article
      className="blog-card"
      onClick={() => navigate(`/blog/${article.id}`)}
    >
      <div className="blog-card-image">
        <img src={article.image} alt={article.title} />
      </div>

      <div className="blog-card-content">
        <span className="blog-category">{article.category}</span>

        <h3>{article.title}</h3>

        <p>{article.excerpt}</p>

        <div className="blog-card-footer">
          <span className="blog-read-time">
            <Clock size={13} />
            {article.readTime}
          </span>

          <span className="blog-read-link">
            Read article
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </article>
  );
}