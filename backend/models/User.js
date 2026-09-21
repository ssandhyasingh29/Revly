import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: true,
    },

    emailVerificationOtp: {
      type: String,
      default: "",
      select: false,
    },

    emailVerificationOtpExpires: {
      type: Date,
      default: null,
      select: false,
    },

    avatar: {
      type: String,
      default: "",
    },

    avatarPublicId: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: 200,
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

    skinConcern: {
      type: String,
      default: "",
    },

    ageGroup: {
      type: String,
      enum: ["18–24", "25–34", "35–44", "45+", ""],
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    badge: {
      type: String,
      default: "",
    },

    followers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    following: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },

    helpfulVotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // If password is already a bcrypt has hashed ,don't hash it a second time.
  const isAlreadyHashed =
    /^\$2[aby]\$\d{2}\$/.test(this.password);

  if (isAlreadyHashed) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );

  next();
});

userSchema.methods.matchPassword = async function (
  enteredPassword
) {
  return bcrypt.compare(
    enteredPassword,
    this.password
  );
};

userSchema.virtual("followersCount").get(function () {
  return Array.isArray(this.followers)
    ? this.followers.length
    : 0;
});

userSchema.virtual("followingCount").get(function () {
  return Array.isArray(this.following)
    ? this.following.length
    : 0;
});

userSchema.set("toJSON", {
  virtuals: true,
});

userSchema.set("toObject", {
  virtuals: true,
});

export default mongoose.model(
  "User",
  userSchema
);
