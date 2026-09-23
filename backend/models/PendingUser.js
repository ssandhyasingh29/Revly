import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const pendingUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
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
    },

    verificationToken: {
      type: String,
      required: true,
    },

    verificationTokenExpires: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically delete unverified registrations after the verification token expires.
pendingUserSchema.index(
  { verificationTokenExpires: 1 },
  { expireAfterSeconds: 0 }
);

// Hash password before saving temporary registration
pendingUserSchema.pre(
  "save",
  async function (next) {
    if (!this.isModified("password")) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
      this.password,
      salt
    );

    next();
  }
);

export default mongoose.model(
  "PendingUser",
  pendingUserSchema
);