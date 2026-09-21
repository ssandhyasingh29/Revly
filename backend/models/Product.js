import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    imagePublicId: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      enum: [
        "Skincare",
        "Haircare",
        "Makeup",
        "Bodycare",
        "Sunscreen",
        "Personal Care",
        "Tools & Others",
      ],
      required: true,
    },

    skinTypes: [
      {
        type: String,
        enum: [
          "Oily",
          "Dry",
          "Combination",
          "Sensitive",
          "Normal",
          "Acne-Prone",
        ],
      },
    ],

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({
  reviewsCount: -1,
});

export default mongoose.model(
  "Product",
  productSchema
);