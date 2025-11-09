import { Video } from "../models/video.model.js";
import { Recipe } from "../models/recipes.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, cloudinaryDelete } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 100, query, sortBy, sortType, userId } = req.query;

  const conditions = {};
  if (query) {
    conditions.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  if (userId) {
    conditions.owner = userId;
  }

  const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
  }

  const videos = await Video.find(conditions)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("owner", "username email avatar")
    .lean();

  const recipeConditions = { ...conditions, type: "video" };
  const videoRecipes = await Recipe.find(recipeConditions)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("owner", "username email avatar")
    .lean();

  const transformedRecipes = videoRecipes.map((recipe) => ({
    ...recipe,
    videoFile: recipe.mediaFile,
    thumbnail: recipe.mediaFile,
    duration: (recipe.prepTime + recipe.cookTime) * 60,
  }));

  const allVideos = [...videos, ...transformedRecipes];
  const totalVideos =
    (await Video.countDocuments(conditions)) +
    (await Recipe.countDocuments(recipeConditions));

  return res.status(200).json(
    new APIResponse(
      200,
      {
        videos: allVideos,
        totalVideos,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVideos / limit),
      },
      "Videos fetched successfully"
    )
  );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId)
    .populate("owner", "username email avatar")
    .lean();

  if (!video) {
    throw new APIError(404, `Video with ID ${videoId} not found`);
  }

  return res
    .status(200)
    .json(new APIResponse(200, video, "Video fetched successfully"));
});

const publishVideo = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    difficulty,
    prepTime,
    cookTime,
    ingredients,
    steps,
  } = req.body;

  if (!title || title.trim().length === 0) {
    throw new APIError(400, "Title is required");
  }
  if (!description || description.trim().length === 0) {
    throw new APIError(400, "Description is required");
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) {
    throw new APIError(400, "Video file is required");
  }
  if (!thumbnailLocalPath) {
    throw new APIError(400, "Thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) {
    throw new APIError(400, "Error uploading video file");
  }
  if (!thumbnail) {
    throw new APIError(400, "Error uploading thumbnail");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoFile.duration || 0,
    owner: req.user._id,
    category: category || "Cooking",
    difficulty: difficulty || "Easy",
    prepTime: prepTime || 0,
    cookTime: cookTime || 0,
    ingredients: ingredients ? JSON.parse(ingredients) : [],
    steps: steps ? JSON.parse(steps) : [],
  });

  const createdVideo = await Video.findById(video._id).populate(
    "owner",
    "username email avatar"
  );

  if (!createdVideo) {
    await Promise.all([
      cloudinaryDelete(videoFile.url),
      cloudinaryDelete(thumbnail.url),
    ]);
    throw new APIError(500, "Something went wrong while creating video");
  }

  return res
    .status(200)
    .json(new APIResponse(200, createdVideo, "Video published successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { _id: userId } = req.user;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new APIError(404, `Video with ${videoId} not found`);
  }

  if (video.owner.toString() !== userId.toString()) {
    throw new APIError(403, "You do not have permission to delete this video");
  }

  await Promise.all([
    cloudinaryDelete(video.videoFile),
    cloudinaryDelete(video.thumbnail),
  ]);

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new APIResponse(200, null, "Video deleted successfully"));
});

export { getAllVideos, getVideoById, publishVideo, deleteVideo };
