import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

export const getStats = asyncHandler(async (req, res) => {
  const users = await User.countDocuments();
  const products = await Product.countDocuments();
  const reviews = await Review.countDocuments();

  const topReviewers = await User.countDocuments({
  badge: { $ne: "" },
});

  res.json({
    users,
    reviews,
    products,
    topReviewers,
  });
});