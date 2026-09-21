import React from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import blogData from "../data/blogData";

const articleContent = {
  "skincare-routine-by-skin-type": {
    intro:
      "A good skincare routine does not need to have ten different products. The right routine starts with understanding your skin and choosing products that work with it.",

    sections: [
      {
        title: "Start with the basics",
        text:
          "A simple routine usually includes a gentle cleanser, a moisturizer and sunscreen during the day. Once your skin is comfortable with these basics, you can introduce targeted products for specific concerns.",
      },
      {
        title: "For oily skin",
        text:
          "Look for lightweight, non-comedogenic products that do not leave your skin feeling heavy. A gentle cleanser and a lightweight moisturizer can help maintain your skin barrier without adding unnecessary heaviness.",
      },
      {
        title: "For dry skin",
        text:
          "Dry skin usually benefits from gentle cleansing and richer moisturizing products. Ingredients such as ceramides, glycerin and hyaluronic acid can help support hydration.",
      },
      {
        title: "For combination skin",
        text:
          "Combination skin can have both oily and dry areas. Instead of treating your entire face the same way, choose balanced products and pay attention to how different areas of your skin respond.",
      },
      {
        title: "For sensitive skin",
        text:
          "Keep your routine simple and introduce new products one at a time. Fragrance-free and gentle formulations can be easier to tolerate, but everyone's skin can react differently.",
      },
      {
        title: "For acne-prone skin",
        text:
          "Focus on gentle cleansing, keeping the skin barrier healthy and choosing non-comedogenic products. Avoid adding several strong active ingredients at once, especially when you are starting a new routine.",
      },
    ],
  },

  "vitamin-c-serum-guide": {
    intro:
      "Vitamin C is a popular skincare ingredient, but understanding what it actually does can help you decide whether it belongs in your routine.",

    sections: [
      {
        title: "What does vitamin C do?",
        text:
          "Vitamin C is an antioxidant that can help protect skin from oxidative stress. With consistent use, topical vitamin C may also help improve the appearance of uneven skin tone and dullness.",
      },
      {
        title: "When should you use it?",
        text:
          "Vitamin C is commonly used in the morning. Follow it with moisturizer and sunscreen to complete your daytime routine.",
      },
      {
        title: "Start slowly",
        text:
          "If you are new to vitamin C, start with a lower concentration and use it a few times a week before increasing frequency if your skin tolerates it well.",
      },
    ],
  },

  "understanding-skin-type": {
    intro:
      "Knowing your skin type can make choosing skincare products much easier. Your skin generally falls into one of several broad categories.",

    sections: [
      {
        title: "Oily skin",
        text:
          "Oily skin tends to produce more sebum and may appear shiny, especially around the forehead, nose and chin.",
      },
      {
        title: "Dry skin",
        text:
          "Dry skin may feel tight, rough or flaky and often benefits from products that support hydration and the skin barrier.",
      },
      {
        title: "Combination skin",
        text:
          "Combination skin typically has oilier areas, often around the T-zone, alongside normal or drier areas.",
      },
      {
        title: "Sensitive skin",
        text:
          "Sensitive skin can react easily to certain products or environmental factors. Keeping your routine gentle and simple can help.",
      },
      {
        title: "Normal skin",
        text:
          "Normal skin is generally balanced, without persistent excessive oiliness or dryness.",
      },
    ],
  },

  "how-to-layer-skincare": {
    intro:
      "Layering skincare does not have to be complicated. Applying products in a sensible order can make your routine easier to follow.",

    sections: [
      {
        title: "A simple order",
        text:
          "A common routine order is cleanser, toner or essence if you use one, serum, moisturizer and sunscreen during the daytime.",
      },
      {
        title: "Do not overload your routine",
        text:
          "Using too many active ingredients at once can increase the chance of irritation. Introduce new products gradually and give your skin time to adjust.",
      },
      {
        title: "Day vs night",
        text:
          "Sunscreen belongs in your daytime routine. Some treatment products are more commonly used at night, depending on the ingredient and the product instructions.",
      },
    ],
  },

  "sunscreen-spf-pa-guide": {
    intro:
      "Sunscreen is one of the most important parts of a daytime skincare routine. Understanding the labels can make choosing one much easier.",

    sections: [
      {
        title: "What is SPF?",
        text:
          "SPF primarily describes protection against UVB radiation, which is strongly associated with sunburn.",
      },
      {
        title: "What does PA mean?",
        text:
          "The PA system is used to indicate UVA protection. More plus signs generally indicate a higher level of UVA protection.",
      },
      {
        title: "How much sunscreen should you use?",
        text:
          "Use a generous, even layer over exposed skin and reapply as appropriate, especially after sweating, swimming or prolonged outdoor exposure.",
      },
    ],
  },

  "haircare-basics": {
    intro:
      "Healthy-looking hair starts with taking care of both the scalp and the lengths. A simple routine can go a long way.",

    sections: [
      {
        title: "Take care of your scalp",
        text:
          "Keep your scalp clean according to its needs. If your scalp becomes oily quickly, you may need to wash more frequently than someone with a drier scalp.",
      },
      {
        title: "Protect your lengths",
        text:
          "Conditioner can help improve softness and manageability. Minimize unnecessary heat and handle wet hair gently to reduce breakage.",
      },
      {
        title: "Keep your routine realistic",
        text:
          "You do not need a huge collection of hair products. Focus on cleansing, conditioning and protecting your hair based on your individual needs.",
      },
    ],
  },
};

export default function BlogArticlePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const article = blogData.find((item) => item.id === id);
  const content = articleContent[id];

  if (!article) {
    return (
      <main className="blog-article-page">
        <div className="blog-article-not-found">
          <h1>Article not found</h1>

          <button
            type="button"
            onClick={() => navigate("/blog")}
          >
            Back to Blog
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="blog-article-page">
      <button
        type="button"
        className="blog-back-btn"
        onClick={() => navigate("/blog")}
      >
        <ArrowLeft size={16} />
        Back to Blog
      </button>

      <article className="blog-article">
        <div className="blog-article-category">
          {article.category}
        </div>

        <h1>{article.title}</h1>

        <div className="blog-article-meta">
          <Clock size={15} />
          <span>{article.readTime}</span>
          <span>•</span>
          <span>Revly Beauty Edit</span>
        </div>

        <div className="blog-article-image">
          <img
            src={article.image}
            alt={article.title}
          />
        </div>

        <div className="blog-article-body">
          <p className="blog-article-intro">
            {content?.intro || article.excerpt}
          </p>

          {content?.sections?.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}