import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/Product.js";

import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";


export const getProducts = asyncHandler(
  async (req, res) => {
    const {
      category,
      skinType,
    } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (skinType) {
      filter.skinTypes = skinType;
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 });

    res.json(products);
  }
);



export const getTrendingProducts = asyncHandler(
  async (req, res) => {
    const limit =
      Number(req.query.limit) || 12;

    const products = await Product.find()
      .sort({
        reviewsCount: -1,
        rating: -1,
      })
      .limit(limit);

    res.json(products);
  }
);


export const getProductById = asyncHandler(
  async (req, res) => {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      res.status(404);

      throw new Error(
        "Product not found"
      );
    }

    res.json(product);
  }
);


// ==========================================

export const createProduct = asyncHandler(
  async (req, res) => {
    const {
      name,
      brand,
      category,
      skinTypes,
    } = req.body;

    

    if (!name?.trim()) {
      res.status(400);

      throw new Error(
        "Product name is required"
      );
    }

    if (!brand?.trim()) {
      res.status(400);

      throw new Error(
        "Brand name is required"
      );
    }

    if (!category) {
      res.status(400);

      throw new Error(
        "Product category is required"
      );
    }

    if (!req.file) {
      res.status(400);

      throw new Error(
        "Please upload a product image"
      );
    }

 

    let parsedSkinTypes = skinTypes;

    

    if (typeof skinTypes === "string") {
      try {
        parsedSkinTypes =
          JSON.parse(skinTypes);
      } catch {
        parsedSkinTypes = [skinTypes];
      }
    }

    if (
      !Array.isArray(parsedSkinTypes) ||
      !parsedSkinTypes.length
    ) {
      res.status(400);

      throw new Error(
        "Please select at least one skin type"
      );
    }

   

    const result =
      await uploadToCloudinary(
        req.file.buffer,
        "revly/products"
      );

   

    const product =
      await Product.create({
        name: name.trim(),
        brand: brand.trim(),

        image: result.secure_url,

        imagePublicId:
          result.public_id,

        category,

        skinTypes:
          parsedSkinTypes,
      });

    res.status(201).json(product);
  }
);


export const searchProducts = asyncHandler(async (req, res) => {
  const q = req.query.q?.trim() || "";

  if (!q) return res.json([]);

  const words = q.split(/\s+/).filter(Boolean);

  const searchConditions = words.map((word) => {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    return {
      $or: [
        { name: regex },
        { brand: regex },
        { category: regex },
        { skinTypes: regex },
      ],
    };
  });

  const products = await Product.find({
    $or: searchConditions,
  })
    .sort({ reviewsCount: -1, rating: -1, createdAt: -1 })
    .limit(20);

  res.json(products);
});
