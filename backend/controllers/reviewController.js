import asyncHandler from "../middleware/asyncHandler.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// Recalculates a product's average rating and review count.
// Called after any review is created or deleted.
const recalculateProductStats = async (productId) => {
  const reviews = await Review.find({ product: productId });

  const reviewsCount = reviews.length;

  const rating = reviewsCount
    ? +(
        reviews.reduce(
          (sum, r) =>
            sum +
            (r.ratings.effectiveness +
              r.ratings.packaging +
              r.ratings.valueForMoney) /
              3,
          0
        ) / reviewsCount
      ).toFixed(1)
    : 0;

  await Product.findByIdAndUpdate(productId, {
    rating,
    reviewsCount,
  });

  return {
    rating,
    reviewsCount,
  };
};

// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const {
    product,
    title,
    text,
    ratings,
    images,
    verifiedPurchase,
  } = req.body;

  if (!product || !title || !text || !ratings) {
    res.status(400);
    throw new Error(
      "product, title, text, and ratings are required"
    );
  }

  const review = await Review.create({
    user: req.user._id,
    product,
    title,
    text,
    ratings,
    images,
    verifiedPurchase,
  });

  // Recalculate product rating and review count
  const productStats = await recalculateProductStats(product);

  // Keep author's reviewsCount in sync
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { reviewsCount: 1 },
  });

  // Populate user information
  const populated = await review.populate(
    "user",
    "username avatar badge"
  );

  // Send the newly calculated product stats to frontend
  res.status(201).json({
    ...populated.toObject(),
    productRating: productStats.rating,
    productReviewsCount: productStats.reviewsCount,
  });
});

// @route   GET /api/reviews/product/:productId
// @access  Public
export const getReviewsForProduct = asyncHandler(
  async (req, res) => {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate("user", "username avatar badge")
      .sort({ createdAt: -1 });

    res.json(reviews);
  }
);

// @route   GET /api/reviews/user/:userId
// @access  Public
export const getReviewsByUser = asyncHandler(
  async (req, res) => {
    const reviews = await Review.find({
      user: req.params.userId,
    })
      .populate("product", "name brand image")
      .sort({ createdAt: -1 });

    res.json(reviews);
  }
);

// @route   GET /api/reviews/top
// @access  Public
export const getTopReview = asyncHandler(
  async (req, res) => {
    const [topReview] = await Review.aggregate([
      {
        $addFields: {
          likesCount: { $size: "$likes" },
        },
      },
      {
        $sort: {
          likesCount: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    if (!topReview) {
      return res.json(null);
    }

    const populated = await Review.findById(
      topReview._id
    )
      .populate("user", "username avatar badge")
      .populate("product", "name brand image");

    res.json(populated);
  }
);

// @route   POST /api/reviews/:id/like
// @access  Private
export const toggleLikeReview = asyncHandler(
  async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    const alreadyLiked = review.likes.some(
      (id) =>
        id.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      // Unlike
      review.likes = review.likes.filter(
        (id) =>
          id.toString() !==
          req.user._id.toString()
      );

      await User.findByIdAndUpdate(review.user, {
        $inc: { helpfulVotes: -1 },
      });
    } else {
      // Like
      review.likes.push(req.user._id);

      await User.findByIdAndUpdate(review.user, {
        $inc: { helpfulVotes: 1 },
      });
    }

    await review.save();

    res.json({
      likesCount: review.likes.length,
      liked: !alreadyLiked,
    });
  }
);

// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(
  async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error("Review not found");
    }

    // Only review author can delete
    if (
      review.user.toString() !==
      req.user._id.toString()
    ) {
      res.status(403);
      throw new Error(
        "You can only delete your own reviews"
      );
    }

   const productId = review.product;
const reviewUserId = review.user;

const reviewHelpfulVotes =
  review.likes?.length || 0;

await review.deleteOne();

    // Recalculate product stats after deletion
    await recalculateProductStats(productId);

    // Decrease author's review count
   await User.findByIdAndUpdate(
  reviewUserId,
  {
    $inc: {
      reviewsCount: -1,
      helpfulVotes: -reviewHelpfulVotes,
    },
  }
);

    res.json({
      message: "Review deleted",
    });
  });

  export const getAllReviews = asyncHandler(
  async (req, res) => {
    const reviews = await Review.find()
      .populate(
        "user",
        "username avatar badge"
      )
      .populate(
        "product",
        "name brand image"
      )
      .sort({ createdAt: -1 });

    res.json(reviews);
  }
);