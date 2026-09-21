import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";


/* =========================================================
   GET USERS
   Search + Filters + Sorting + Pagination
========================================================= */

export const getUsers = asyncHandler(async (req, res) => {
  const {
    search,
    skinTypes,
    skinConcerns,
    ageGroups,
    locations,
    sort,
  } = req.query;

  const page = Math.max(
    1,
    Number(req.query.page) || 1
  );

  const limit = Math.min(
    50,
    Number(req.query.limit) || 8
  );

  const filter = {};

  // Exclude currently logged-in user
  if (req.user?._id) {
    filter._id = {
      $ne: req.user._id,
    };
  }

  /* ---------------- SEARCH ---------------- */

  if (search) {
    filter.username = {
      $regex: search,
      $options: "i",
    };
  }

  /* ---------------- SKIN TYPE ---------------- */

  if (skinTypes) {
    const selectedSkinTypes = Array.isArray(skinTypes)
      ? skinTypes
      : skinTypes.split(",");

    if (selectedSkinTypes.length > 0) {
      filter.skinType = {
        $in: selectedSkinTypes,
      };
    }
  }

  /* ---------------- SKIN CONCERNS ---------------- */

  if (skinConcerns) {
    const selectedConcerns = Array.isArray(skinConcerns)
      ? skinConcerns
      : skinConcerns.split(",");

    if (selectedConcerns.length > 0) {
      filter.skinConcern = {
        $in: selectedConcerns,
      };
    }
  }

  /* ---------------- AGE GROUP ---------------- */

  if (ageGroups) {
    const selectedAgeGroups = Array.isArray(ageGroups)
      ? ageGroups
      : ageGroups.split(",");

    if (selectedAgeGroups.length > 0) {
      filter.ageGroup = {
        $in: selectedAgeGroups,
      };
    }
  }

  /* ---------------- LOCATION ---------------- */

  if (locations) {
    const selectedLocations = Array.isArray(locations)
      ? locations
      : locations.split(",");

    if (selectedLocations.length > 0) {
      filter.location = {
        $in: selectedLocations,
      };
    }
  }

  /* ---------------- SORT ---------------- */

  const sortStage = {
    "most-helpful": {
      helpfulVotes: -1,
    },

    "most-reviews": {
      reviewsCount: -1,
    },

    newest: {
      createdAt: -1,
    },

    "most-followers": {
      followersCount: -1,
    },
  }[sort];

  let users;
  let total;

  /* =========================================================
     MOST FOLLOWERS
     followersCount is a virtual, so calculate it using
     aggregation.
  ========================================================= */

  if (sort === "most-followers") {
    const pipeline = [
      {
        $match: filter,
      },

      {
        $addFields: {
          followersCount: {
            $size: {
              $ifNull: ["$followers", []],
            },
          },
        },
      },

      {
        $sort: {
          followersCount: -1,
        },
      },

      {
        $skip: (page - 1) * limit,
      },

      {
        $limit: limit,
      },

      {
        $project: {
          password: 0,
        },
      },
    ];

    users = await User.aggregate(pipeline);

    total = await User.countDocuments(filter);
  } else {
    users = await User.find(filter)
      .select("-password")
      .sort(
        sortStage || {
          helpfulVotes: -1,
        }
      )
      .skip((page - 1) * limit)
      .limit(limit);

    total = await User.countDocuments(filter);
  }

  res.json({
    users,
    currentPage: page,
    totalPages: Math.max(
      1,
      Math.ceil(total / limit)
    ),
    totalUsers: total,
  });
});


/* =========================================================
   GET USER PROFILE
========================================================= */

export const getUserProfile = asyncHandler(
  async (req, res) => {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate(
        "followers",
        "username avatar badge"
      )
      .populate(
        "following",
        "username avatar badge"
      );

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json(user);
  }
);


/* =========================================================
   UPDATE USER PROFILE
========================================================= */

export const updateUserProfile = asyncHandler(
  async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (
      user._id.toString() !==
      req.user._id.toString()
    ) {
      res.status(403);
      throw new Error(
        "You can only update your own profile"
      );
    }

    const {
      username,
      bio,
      avatar,
      skinType,
      skinConcern,
      ageGroup,
      location,
    } = req.body;

    if (username !== undefined) {
      user.username = username;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    if (skinType !== undefined) {
      user.skinType = skinType;
    }

    if (skinConcern !== undefined) {
      user.skinConcern = skinConcern;
    }

    if (ageGroup !== undefined) {
      user.ageGroup = ageGroup;
    }

    if (location !== undefined) {
      user.location = location;
    }

    const updatedUser = await user.save();

    res.json(
      await User.findById(updatedUser._id)
        .select("-password")
    );
  }
);


/* =========================================================
   FOLLOW USER
========================================================= */

export const followUser = asyncHandler(
  async (req, res) => {
    const targetId = req.params.id;

    if (
      targetId ===
      req.user._id.toString()
    ) {
      res.status(400);
      throw new Error(
        "You can't follow yourself"
      );
    }

    const target = await User.findById(targetId);

    if (!target) {
      res.status(404);
      throw new Error("User not found");
    }

    const alreadyFollowing =
      target.followers.includes(
        req.user._id
      );

    if (alreadyFollowing) {
      res.status(400);
      throw new Error(
        "Already following this user"
      );
    }

    target.followers.push(
      req.user._id
    );

    await target.save();

    req.user.following.push(
      target._id
    );

    await req.user.save();

    /* -------- NOTIFICATION -------- */

    await Notification.create({
      recipient: target._id,
      sender: req.user._id,
      type: "follow",
      text: `${req.user.username} started following you`,
    });

    res.json({
      message: `Now following ${target.username}`,
    });
  }
);


/* =========================================================
   UNFOLLOW USER
========================================================= */

export const unfollowUser = asyncHandler(
  async (req, res) => {
    const targetId = req.params.id;

    const target = await User.findById(targetId);

    if (!target) {
      res.status(404);
      throw new Error("User not found");
    }

    target.followers =
      target.followers.filter(
        (id) =>
          id.toString() !==
          req.user._id.toString()
      );

    await target.save();

    req.user.following =
      req.user.following.filter(
        (id) =>
          id.toString() !==
          target._id.toString()
      );

    await req.user.save();

    res.json({
      message: `Unfollowed ${target.username}`,
    });
  }
);


/* =========================================================
   SUGGESTED USERS
========================================================= */
export const getSuggestedUsers = asyncHandler(
  async (req, res) => {
    // Guest user
    if (!req.user) {
      const users = await User.find({})
        .select("-password")
        .sort({
          helpfulVotes: -1,
          reviewsCount: -1,
        })
        .limit(10);

      return res.json(users);
    }

    // Logged-in user
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      res.status(404);
      throw new Error("User not found");
    }

    const followingIds = currentUser.following || [];

    const filter = {
      _id: {
        $ne: req.user._id,
        $nin: followingIds,
      },
    };

    // Prefer users with same skin type
    if (currentUser.skinType) {
      filter.skinType = currentUser.skinType;
    }

    let users = await User.find(filter)
      .select("-password")
      .sort({
        helpfulVotes: -1,
        reviewsCount: -1,
      })
      .limit(10);

    // If not enough same-skin-type users,
    // fill with other users
    if (users.length < 10) {
      const existingIds = [
        req.user._id,
        ...followingIds,
        ...users.map((user) => user._id),
      ];

      const moreUsers = await User.find({
        _id: {
          $nin: existingIds,
        },
      })
        .select("-password")
        .sort({
          helpfulVotes: -1,
          reviewsCount: -1,
        })
        .limit(10 - users.length);

      users = [
        ...users,
        ...moreUsers,
      ];
    }

    res.json(users);
  }
);


      


/* =========================================================
   TOP REVIEWERS
========================================================= */

export const getTopReviewers = asyncHandler(
  async (req, res) => {
    const users = await User.find({
      reviewsCount: {
        $gt: 0,
      },
    })
      .select("-password")
      .sort({
        helpfulVotes: -1,
        reviewsCount: -1,
      })
      .limit(10);

    res.json(users);
  }
);

export const updateProfileAvatar = asyncHandler(
  async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error("Please select an image");
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (
      user._id.toString() !==
      req.user._id.toString()
    ) {
      res.status(403);
      throw new Error(
        "You can only change your own profile photo"
      );
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "revly/avatars"
    );

    if (user.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(
          user.avatarPublicId
        );
      } catch (error) {
        console.error(
          "Old avatar deletion failed:",
          error.message
        );
      }
    }

    user.avatar = result.secure_url;
    user.avatarPublicId = result.public_id;

    await user.save();

    res.json({
      message: "Profile photo updated successfully",
      avatar: user.avatar,
      avatarPublicId: user.avatarPublicId,
    });
  }
);

export const removeProfileAvatar = asyncHandler(
  async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (
      user._id.toString() !==
      req.user._id.toString()
    ) {
      res.status(403);
      throw new Error(
        "You can only remove your own profile photo"
      );
    }

    if (user.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(
          user.avatarPublicId
        );
      } catch (error) {
        console.error(
          "Avatar deletion from Cloudinary failed:",
          error.message
        );
      }
    }

    user.avatar = "";
    user.avatarPublicId = "";

    await user.save();

    res.json({
      message: "Profile photo removed successfully",
      avatar: "",
      avatarPublicId: "",
    });
  }
);