import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // Cloudinary URL
      required: true,
    },
    thumbnail: {
      type: String, // Cloudinary URL
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // In seconds
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    prepTime: {
      type: Number, // In minutes
      default: 0,
    },
    cookTime: {
      type: Number, // In minutes
      default: 0,
    },
    ingredients: [
      {
        type: String,
      },
    ],
    steps: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Video = mongoose.model("Video", videoSchema);
