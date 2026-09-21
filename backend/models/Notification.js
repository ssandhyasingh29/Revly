import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["follow", "like", "review", "message"],
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    read: {
      type: Boolean,
      default: false,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  recipient: 1,
  read: 1,
  createdAt: -1,
});

export default mongoose.model("Notification", notificationSchema);