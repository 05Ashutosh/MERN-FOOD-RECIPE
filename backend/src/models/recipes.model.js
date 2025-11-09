import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const { Schema } = mongoose;

export const CATEGORIES = [
  "APPETIZERS",
  "MAIN COURSES",
  "SIDE DISHES",
  "DESSERTS",
  "SOUPS & SALADS",
  "BEVERAGES",
  "SNACKS",
  "VEGETARIAN",
];

const recipeSchema = new Schema(
  {
    mediaFile: {
      type: String,
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
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    ingredients: {
      type: [String],
      required: true,
    },
    steps: {
      type: [String],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "intermediate", "advanced"],
      required: true,
    },
    prepTime: {
      type: Number,
      required: true,
    },
    cookTime: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

recipeSchema.plugin(mongooseAggregatePaginate);

export const Recipe = mongoose.model("Recipe", recipeSchema);
