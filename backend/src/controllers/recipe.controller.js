import { Recipe } from "../models/recipes.model.js";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, cloudinaryDelete } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";
import { CATEGORIES } from "../models/recipes.model.js";
import { User } from "../models/user.model.js";
import { Log } from "../utils/Log.js";
import mongoose from "mongoose";

const getAllRecipes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 100, query, sortBy, sortType = "desc" } = req.query;

  const user = req.user;
  console.log(query);

  console.log(user);
  const currentUser = await User.findById(user?._id).select("following").lean();
  const followingListRaw = currentUser ? currentUser.following : [];
  Log.print(user, currentUser);
  Log.print(user, followingListRaw);
  // difference between followingListRaw and followingList
  const followingList = followingListRaw.map(
    (id) => new mongoose.Types.ObjectId(id.toString())
  );
  Log.print(user, followingList);

  const conditions = {};
  if (query) {
    conditions.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  // if (user?._id) {
  //   conditions.owner = user._id;
  // }

  const pipeline = [
    { $match: conditions },
    {
      addFields: {
        followIndex: {
          $indexOfArray: [followingList, "$owner"],
        },
      },
    },
  ];

  const sortOptions = {};
  // if (sortBy) {
  //   sortOptions[followers] = sortType === "desc" ? -1 : 1;
  // }

  const recipes = await Recipe.find(conditions)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("owner", "username email avatar")
    .lean();

  // Add like counts to recipes
  const recipesWithLikes = await Promise.all(
    recipes.map(async (recipe) => {
      const likesCount = await Like.countDocuments({ recipe: recipe._id });
      return { ...recipe, likesCount };
    })
  );

  const totalRecipes = await Recipe.countDocuments(conditions);

  return res.status(200).json(
    new APIResponse(
      200,
      {
        recipes: recipesWithLikes,
        totalRecipes,
      },
      "Recipes fetched successfully"
    )
  );
});

const getRecipeLimit = asyncHandler(async (req, res) => {
  const { page = 1, limit = 5, query, sortBy, sortType } = req.query;
  console.log(`Page no ${page}`);

  const conditions = {};
  if (query) {
    conditions.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  // if (userId) {
  //   conditions.owner = userId;
  // }

  const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
  }
  const skipIndex = (page - 1) * limit;
  const recipes = await Recipe.find(conditions)
    .sort(sortOptions)
    .skip(skipIndex)
    .limit(Number(limit))
    .populate("owner", "username email avatar")
    .lean();

  // Add like counts to recipes
  const recipesWithLikes = await Promise.all(
    recipes.map(async (recipe) => {
      const likesCount = await Like.countDocuments({ recipe: recipe._id });
      return { ...recipe, likesCount };
    })
  );

  const totalRecipes = await Recipe.countDocuments(conditions);

  return res.status(200).json(
    new APIResponse(
      200,
      {
        recipes: recipesWithLikes,
        totalRecipes,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRecipes / limit),
      },
      "Recipes fetched successfully"
    )
  );
});

const publish = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (title.trim().length === 0 || description.trim().length === 0) {
    throw new APIError(400, "Title and description are required");
  }
  if (!CATEGORIES.includes(req.body.category)) {
    throw new APIError(400, "Invalid recipe category");
  }

  const mediaFileLocalPath = req.files?.mediaFile[0]?.path;
  if (!mediaFileLocalPath) {
    throw new APIError(400, "Media file is required");
  }
  const mediaFile = await uploadOnCloudinary(mediaFileLocalPath);

  if (!mediaFile) {
    throw new APIError(400, "Error uploading media file");
  }

  const recipe = await Recipe.create({
    mediaFile: mediaFile.url,
    title,
    description,
    type: req.body.type,
    owner: req.user._id,
    ingredients: req.body.ingredients,
    steps: req.body.steps,
    difficulty: req.body.difficulty,
    prepTime: req.body.prepTime,
    cookTime: req.body.cookTime,
    category: req.body.category,
  });
  const createdRecipe = await Recipe.findById(recipe._id)
    .populate("owner", "username email avatar")
    .lean();
  if (!createdRecipe) {
    await Promise.all([await cloudinaryDelete(mediaFile.url)]);
    throw new APIError(500, "Something went wrong while creating recipe");
  }

  // Add like count (will be 0 for new recipe)
  const recipeWithLikes = { ...createdRecipe, likesCount: 0 };

  return res
    .status(200)
    .json(new APIResponse(200, recipeWithLikes, "Recipe created successfully"));
});

const getRecipeById = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  const recipe = await Recipe.findById(recipeId)
    .populate("owner", "username email avatar")
    .lean();

  if (!recipe) {
    throw new APIError(404, `Recipe with ID ${recipeId} not found`);
  }

  // Add like count
  const likesCount = await Like.countDocuments({ recipe: recipe._id });
  const recipeWithLikes = { ...recipe, likesCount };

  return res
    .status(200)
    .json(new APIResponse(200, recipeWithLikes, "Recipe fetched successfully"));
});

const deleteRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const { _id: userId } = req.user;
  const recipe = await Recipe.findById(recipeId);

  if (!recipe) {
    throw new APIError(404, `Recipe with ${recipeId} not found`);
  }

  if (recipe.owner.toString() !== userId.toString()) {
    throw new APIError(403, "You do not have permission to delete this recipe");
  }

  try {
    await cloudinaryDelete(recipe.mediaFile);
  } catch (e) {
    console.log("Cloudinary delete failed for recipe media:", e?.message || e);
  }

  await Recipe.findByIdAndDelete(recipeId);

  await Like.deleteMany({ recipe: recipeId });

  return res
    .status(200)
    .json(new APIResponse(200, null, "Recipe deleted successfully"));
});

export { getAllRecipes, getRecipeById, publish, deleteRecipe, getRecipeLimit };
