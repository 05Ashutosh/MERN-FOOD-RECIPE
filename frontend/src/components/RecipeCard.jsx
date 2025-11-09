import React, { useState } from "react";
import { Clock, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { apiRequest } from "../utils/api";

const RecipeCard = ({ recipe, initialIsLiked = false, onUnlike }) => {
  console.log(recipe);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);
  const [likeCount, setLikeCount] = useState(recipe.likesCount || 0);

  const recipeData = {
    id: recipe._id || recipe.id,
    title: recipe.title,
    description: recipe.description,
    category: recipe.category,
    difficulty: recipe.difficulty,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    image: recipe.mediaFile || recipe.image,
    type: recipe.type,
    author: recipe.owner?.username || recipe.author,
    authorUsername: recipe.owner?.username || recipe.username || recipe.author,
    authorAvatar:
      recipe.owner?.avatar ||
      recipe.authorAvatar ||
      "https://via.placeholder.com/150",
    tags: recipe.tags || [],
  };

  const getBgColor = (category) => {
    switch (category.toLowerCase()) {
      case "lunch":
        return "bg-green-50";
      case "main course":
        return "bg-orange-50";
      case "sidedish":
      case "soup":
        return "bg-red-50";
      default:
        return "bg-gray-50";
    }
  };

  const getButtonColor = (category) => {
    switch (category.toLowerCase()) {
      case "lunch":
        return "bg-green-600 hover:bg-green-700";
      case "main course":
        return "bg-orange-600 hover:bg-orange-700";
      case "sidedish":
      case "soup":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    const previousState = isLiked;
    const previousCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(previousState ? likeCount - 1 : likeCount + 1);

    try {
      const endpoint = previousState
        ? `/likes/unfavorite/recipe/${recipeData.id}`
        : `/likes/favorite/recipe/${recipeData.id}`;
      await apiRequest(endpoint, "POST", null, dispatch);
      if (previousState && onUnlike) {
        onUnlike();
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      setIsLiked(previousState);
      setLikeCount(previousCount);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${getBgColor(
        recipeData.category
      )}`}
    >
      <div
        className="p-4 flex items-center space-x-3 border-b border-gray-100 cursor-pointer"
        onClick={() => navigate(`/user/${recipeData.authorUsername}`)}
      >
        <div className="relative h-10 w-10 flex-shrink-0">
          <img
            src={recipeData.authorAvatar}
            alt={recipeData.author}
            className="rounded-full object-cover w-full h-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {recipeData.author}
          </h4>
          <p className="text-xs text-gray-500 font-medium">Recipe Creator</p>
        </div>
      </div>

      <div className="relative aspect-video px-4 pt-4">
        <div className="relative h-full w-full rounded-t-xl overflow-hidden">
          {recipeData.type === "video" ? (
            <video
              src={recipeData.image}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={recipeData.image}
              alt={recipeData.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-3 right-3 flex flex-col items-center gap-1">
            <button
              onClick={handleLikeToggle}
              disabled={isLoading}
              className="p-2 rounded-full bg-white/90 hover:bg-white transition-all duration-200 shadow-sm disabled:opacity-50"
            >
              <Heart
                className={`h-5 w-5 transition-all duration-200 ${
                  isLiked
                    ? "fill-rose-500 text-rose-500"
                    : "text-rose-400 hover:text-rose-600"
                }`}
              />
            </button>
            {likeCount > 0 && (
              <span className="text-xs font-semibold text-white bg-black/60 px-2 py-0.5 rounded-full shadow-sm">
                {likeCount}
              </span>
            )}
          </div>
          <div className="absolute bottom-3 left-3 flex items-center bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
            <Clock className="h-4 w-4 mr-1.5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {recipeData.prepTime + recipeData.cookTime} min
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          {/* Category & Difficulty */}
          <div className="flex gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getButtonColor(
                recipeData.category
              )} text-white`}
            >
              {recipeData.category}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-600 text-white">
              {recipeData.difficulty}
            </span>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {recipeData.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {recipeData.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {recipeData.tags?.map((tag, index) => (
            <span
              key={index}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-white text-gray-600 border border-gray-200"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* View Recipe Button */}
        <button
          onClick={() => navigate(`/recipe/${recipeData.id}`)}
          className={`w-fit py-2 px-4 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${getButtonColor(
            recipeData.category
          )}`}
        >
          View Recipe
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
