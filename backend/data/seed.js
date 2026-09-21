
// Wipes Users and Products collections and inserts sample data.

import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();


const users = [
  {
    username: "riya",
    email: "riya@revly.com",
    password: "123456",
    skinType: "Oily",
    skinConcern: "Acne and pigmentation",
    bio: "Beauty enthusiast and skincare lover",
    badge: "💗 Top Reviewer",
    reviewsCount: 24,
    helpfulVotes: 180,
    avatar: "",
    followers: [],
    following: [],
  },

  {
    username: "ananya",
    email: "ananya@revly.com",
    password: "123456",
    skinType: "Dry",
    skinConcern: "Dryness",
    bio: "Finding products that actually work.",
    badge: "",
    reviewsCount: 18,
    helpfulVotes: 140,
    avatar: "",
    followers: [],
    following: [],
  },

  {
    username: "mehak",
    email: "mehak@revly.com",
    password: "123456",
    skinType: "Combination",
    skinConcern: "Uneven skin tone",
    bio: "Honest beauty reviews ✨",
    badge: "",
    reviewsCount: 31,
    helpfulVotes: 220,
    avatar: "",
    followers: [],
    following: [],
  },

  {
    username: "simran",
    email: "simran@revly.com",
    password: "123456",
    skinType: "Sensitive",
    skinConcern: "Redness",
    bio: "Sensitive skin girlie 🌸",
    badge: "",
    reviewsCount: 12,
    helpfulVotes: 95,
    avatar: "",
    followers: [],
    following: [],
  },

  {
    username: "neha",
    email: "neha@revly.com",
    password: "123456",
    skinType: "Normal",
    skinConcern: "Dullness",
    bio: "Skincare, makeup and honest reviews.",
    badge: "",
    reviewsCount: 27,
    helpfulVotes: 175,
    avatar: "",
    followers: [],
    following: [],
  },

  {
    username: "kavya",
    email: "kavya@revly.com",
    password: "123456",
    skinType: "Oily",
    skinConcern: "Acne",
    bio: "Trying products so you don't have to 💕",
    badge: "",
    reviewsCount: 36,
    helpfulVotes: 260,
    avatar: "",
    followers: [],
    following: [],
  },
];

// ============================================
// SAMPLE PRODUCTS
// ============================================

const products = [
  {
    name: "Niacinamide Serum",
    brand: "Minimalist",
    image:
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=400&q=80",
    category: "Skincare",
    skinTypes: ["Oily", "Acne-Prone"],
  },

  {
    name: "Hydrating Sunscreen SPF 50",
    brand: "Dot & Key",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80",
    category: "Sunscreen",
    skinTypes: ["Dry", "Normal"],
  },
];

// ============================================
// SEED DATABASE
// ============================================

const run = async () => {
  try {
    await connectDB();

    console.log("Connected to MongoDB");

    // Clear old sample data
    await User.deleteMany({});
    await Product.deleteMany({});

    console.log("Old users and products deleted");

    // Insert users
    await User.create(users);

    console.log(`${users.length} users inserted`);

    // Insert products
    await Product.create(products);

    console.log(`${products.length} products inserted`);

    console.log("Seed data inserted successfully");

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

run();
