import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChefHat,
  Heart,
  Bookmark,
  Share2,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { fetchRecipeById } from "../features/recipes/recipeSlice";

function RecipeDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const {
    currentRecipe: recipe,
    loading,
    error,
  } = useSelector((state) => state.recipes);

  useEffect(() => {
    if (id) {
      dispatch(fetchRecipeById(id));
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading recipe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-4xl font-bold text-gray-800">Recipe not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg hover:shadow-md transition-all duration-300 md:hover:-translate-x-1 md:px-4"
      >
        <ArrowLeft className="h-5 w-5 text-gray-700" />
        <span className="text-gray-700 font-medium">All Recipes</span>
      </Link>

      <main className="container mx-auto p-4 md:p-8 pt-16 md:pt-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-12">
          {/* Image/Video Section */}
          <div className="w-full md:w-1/2 lg:w-[45%] md:sticky md:top-20 self-start">
            <div className="relative group">
              {recipe.type === "video" ? (
                <video
                  src={recipe.mediaFile}
                  controls
                  controlsList="nodownload"
                  playsInline
                  preload="metadata"
                  className="w-full max-h-[400px] md:h-[400px] object-cover rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl transform transition-transform duration-300 md:hover:scale-[1.01]"
                  onError={(e) => {
                    console.error("Video error:", e);
                    console.log("Video source:", recipe.mediaFile);
                  }}
                >
                  <source src={recipe.mediaFile} type="video/mp4" />
                  <source src={recipe.mediaFile} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={recipe.mediaFile || recipe.image}
                  alt={recipe.title}
                  className="w-full max-h-[400px] md:h-[400px] object-cover rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl transform transition-transform duration-300 md:hover:scale-[1.01]"
                />
              )}

              <div className="md:hidden absolute bottom-4 right-4 flex space-x-2">
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md active:scale-95 transition-transform">
                  <Share2 className="h-5 w-5 text-gray-700" />
                </button>
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md active:scale-95 transition-transform">
                  <Bookmark className="h-5 w-5 text-gray-700" />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md">
                <button className="active:scale-95 transition-transform">
                  <Heart className="h-6 w-6 text-red-500" />
                </button>
                <span className="font-bold text-gray-800 text-base md:text-lg">
                  {recipe.likes ? recipe.likes.toLocaleString() : 0}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 md:border-none md:bg-transparent md:p-2 mt-5 ">
              <div className="flex items-center justify-between">
                <Link
                  to={`/user/${recipe.owner?.username}`}
                  className="flex items-center space-x-3 md:space-x-4"
                >
                  <img
                    src={
                      recipe.owner?.avatar || "https://via.placeholder.com/150"
                    }
                    alt={recipe.owner?.username || "Unknown"}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-white shadow-lg"
                  />
                  <div>
                    <div className="flex flex-col">
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">
                        {recipe.owner?.username || "Unknown Chef"}
                      </h2>
                      <span className="text-gray-500 text-sm md:text-base">
                        @{recipe.owner?.username || "unknown"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {recipe.createdAt
                          ? new Date(recipe.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Date unknown"}
                      </span>
                    </div>
                  </div>
                </Link>
                <button className="hidden md:flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors">
                  <span className="font-medium">Follow</span>
                  <ChefHat className="h-5 w-5" />
                </button>
              </div>
              <button className="mt-3 w-full md:hidden px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors font-medium">
                Follow Chef
              </button>
            </div>
          </div>

          <div className="w-full md:w-1/2 lg:w-[55%] space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {recipe.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                {recipe.description}
              </p>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {[
                  { icon: ChefHat, text: recipe.difficulty, color: "blue" },
                  {
                    icon: Clock,
                    text: `${recipe.prepTime} min Prep`,
                    color: "green",
                  },
                  {
                    icon: Clock,
                    text: `${recipe.cookTime} min Cook`,
                    color: "orange",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center text-${item.color}-600 bg-${item.color}-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all active:scale-95 md:hover:scale-105`}
                  >
                    <item.icon className="h-4 w-4 md:h-5 md:w-5 mr-1.5" />
                    <span className="font-semibold text-xs md:text-sm">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center">
                <ChefHat className="h-5 w-5 md:h-6 md:w-6 mr-2 text-blue-500" />
                Ingredients
                <span className="text-gray-400 text-base md:text-lg ml-2">
                  ({recipe.ingredients.length} items)
                </span>
              </h3>
              <ul className="space-y-2 md:space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg active:bg-gray-50 md:hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    <span className="text-gray-700 text-base md:text-lg">
                      {ingredient}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center">
                <Bookmark className="h-5 w-5 md:h-6 md:w-6 mr-2 text-green-500" />
                Instructions
              </h3>
              <ol className="space-y-4 md:space-y-6">
                {recipe.steps.map((step, index) => (
                  <li
                    key={index}
                    className="flex space-x-3 md:space-x-4 group active:bg-gray-50 md:hover:bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center font-bold text-base md:text-lg transition-all group-hover:bg-blue-500 group-hover:text-white">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed flex-1">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RecipeDetails;
