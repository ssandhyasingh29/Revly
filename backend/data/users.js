import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    skinType: {
      type: String,
      enum: [
        "Oily",
        "Dry",
        "Combination",
        "Sensitive",
        "Normal",
        "Acne-Prone",
      ],
      default: "Normal",
    },

    skinConcern: {
      type: String,
      default: "",
      trim: true,
    },

    badge: {
      type: String,
      default: "",
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },

    helpfulVotes: {
      type: Number,
      default: 0,
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ============================================
// PASSWORD HASHING
// ============================================

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );

  next();
});



userSchema.methods.matchPassword =
  async function (enteredPassword) {
    return await bcrypt.compare(
      enteredPassword,
      this.password
    );
  };



userSchema.virtual("followersCount").get(
  function () {
    return Array.isArray(this.followers)
      ? this.followers.length
      : 0;
  }
);

userSchema.virtual("followingCount").get(
  function () {
    return Array.isArray(this.following)
      ? this.following.length
      : 0;
  }
);


userSchema.set("toJSON", {
  virtuals: true,
});

userSchema.set("toObject", {
  virtuals: true,
});

const User = mongoose.model(
  "User",
  userSchema
);

export default User;
