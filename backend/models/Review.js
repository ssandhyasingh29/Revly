import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    text: { type: String, required: true, maxlength: 2000 },

    // These three bars are shown in TopReview.jsx as ★★★★★ rows
    ratings: {
      effectiveness: { type: Number, required: true, min: 1, max: 5 },
      packaging: { type: Number, required: true, min: 1, max: 5 },
      valueForMoney: { type: Number, required: true, min: 1, max: 5 },
    },

    images: [{ type: String }],

    
    // store who liked it, not just a number.
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    verifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Overall star rating shown next to the product/user
reviewSchema.virtual("overallRating").get(function () {
  const { effectiveness, packaging, valueForMoney } = this.ratings;
  return +((effectiveness + packaging + valueForMoney) / 3).toFixed(1);
});

reviewSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

reviewSchema.set("toJSON", { virtuals: true });
reviewSchema.set("toObject", { virtuals: true });

// Powers "Top Review" (most-liked) and product/user review lookups.
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
