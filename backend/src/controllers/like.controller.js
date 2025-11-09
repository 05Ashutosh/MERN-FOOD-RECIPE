import mongoose from "mongoose";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const {videoId} = req.params;

  if (!videoId) {
    throw new APIError(400, "Video ID is required");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
        .status(200)
        .json(new APIResponse(200, {}, "Video unliked successfully"));
  }

  await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });

  return res
      .status(200)
      .json(new APIResponse(200, {}, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const {commentId} = req.params;

  if (!commentId) {
    throw new APIError(400, "Comment ID is required");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
        .status(200)
        .json(new APIResponse(200, {}, "Comment unliked successfully"));
  }

  await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });

  return res
      .status(200)
      .json(new APIResponse(200, {}, "Comment liked successfully"));
});

const toggleRecipeLike = asyncHandler(async (req, res) => {
  const {recipeId} = req.params;

  if (!recipeId) {
    throw new APIError(400, "Recipe ID is required");
  }

  const existingLike = await Like.findOne({
    recipe: recipeId,
    likedBy: req.user?._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
        .status(200)
        .json(new APIResponse(200, {isLiked: false}, "Recipe unliked successfully"));
  }

  await Like.create({
    recipe: recipeId,
    likedBy: req.user?._id,
  });

  return res
      .status(200)
      .json(new APIResponse(200, {isLiked: true}, "Recipe liked successfully"));
});

const favoriteRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  if (!recipeId) {
    throw new APIError(400, "Recipe ID is required");
  }

  const existingLike = await Like.findOne({
    recipe: recipeId,
    likedBy: req.user?._id,
  });

  if (existingLike) {
    return res
      .status(200)
      .json(new APIResponse(200, { isLiked: true }, "Recipe already favorited"));
  }

  await Like.create({
    recipe: recipeId,
    likedBy: req.user?._id,
  });

  return res
    .status(200)
    .json(new APIResponse(200, { isLiked: true }, "Recipe favorited successfully"));
});

const unfavoriteRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  if (!recipeId) {
    throw new APIError(400, "Recipe ID is required");
  }

  const existingLike = await Like.findOne({
    recipe: recipeId,
    likedBy: req.user?._id,
  });

  if (!existingLike) {
    return res
      .status(200)
      .json(new APIResponse(200, { isLiked: false }, "Recipe already not favorited"));
  }

  await Like.findByIdAndDelete(existingLike._id);

  return res
    .status(200)
    .json(new APIResponse(200, { isLiked: false }, "Recipe unfavorited successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
        video: {$exists: true},
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $unwind: "$videoDetails",
    },
    {
      $project: {
        _id: 1,
        videoDetails: 1,
      },
    },
  ]);

  return res
      .status(200)
      .json(
          new APIResponse(200, likedVideos, "Liked videos fetched successfully")
      );
});

const getLikedRecipes = asyncHandler(async (req, res) => {
  const likedRecipes = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
        recipe: {$exists: true},
      },
    },
    {
      $lookup: {
        from: "recipes",
        localField: "recipe",
        foreignField: "_id",
        as: "recipeDetails",
      },
    },
    {
      $unwind: "$recipeDetails",
    },
    {
      $lookup: {
        from: "users",
        localField: "recipeDetails.owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    {
      $unwind: "$ownerDetails",
    },
    {
      $project: {
        _id: "$recipeDetails._id",
        title: "$recipeDetails.title",
        description: "$recipeDetails.description",
        mediaFile: "$recipeDetails.mediaFile",
        category: "$recipeDetails.category",
        difficulty: "$recipeDetails.difficulty",
        prepTime: "$recipeDetails.prepTime",
        cookTime: "$recipeDetails.cookTime",
        ingredients: "$recipeDetails.ingredients",
        steps: "$recipeDetails.steps",
        owner: {
          _id: "$ownerDetails._id",
          username: "$ownerDetails.username",
          email: "$ownerDetails.email",
          avatar: "$ownerDetails.avatar",
        },
        createdAt: "$recipeDetails.createdAt",
      },
    },
  ]);

  return res
      .status(200)
      .json(
          new APIResponse(200, { recipes: likedRecipes }, "Liked recipes fetched successfully")
      );
});

export { toggleVideoLike, toggleCommentLike, toggleRecipeLike, favoriteRecipe, unfavoriteRecipe, getLikedVideos, getLikedRecipes };
