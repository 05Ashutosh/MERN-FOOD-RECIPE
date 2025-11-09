import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import VideoCard from "../components/videoCard";
import RecipeCard from "../components/RecipeCard";
import { Heart } from "lucide-react";
import { apiRequest } from "../utils/api";

const FavoritesPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("recipes");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const favoriteVideos = [];

  useEffect(() => {
    const fetchLikedRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest(
          "/likes/recipes",
          "GET",
          null,
          dispatch
        );
        console.log("Liked recipes response:", response);
        setFavoriteRecipes(response.data?.recipes || []);
      } catch (error) {
        console.error("Failed to fetch liked recipes:", error);
        setError(error.message || "Failed to load favorites");
        setFavoriteRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedRecipes();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center bg-orange-100 text-orange-500 px-6 py-2 rounded-full mb-4">
            <Heart className="h-5 w-5 mr-2" />
            <h1 className="text-2xl font-bold">Your Favorites</h1>
          </div>

          <div className="flex justify-center gap-4 border-b border-gray-200 pb-4">
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "videos"
                  ? "bg-orange-100 text-orange-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Videos ({favoriteVideos.length})
            </button>
            <button
              onClick={() => setActiveTab("recipes")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "recipes"
                  ? "bg-orange-100 text-orange-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Recipes ({favoriteRecipes.length})
            </button>
          </div>
        </div>

        {error ? (
          <div className="col-span-full text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 font-semibold mb-2">
                Error loading favorites
              </p>
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading favorites...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeTab === "videos" ? (
              favoriteVideos.length > 0 ? (
                favoriteVideos.map((video) => (
                  <VideoCard key={`video-${video.id}`} video={video} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg">No favorite videos yet</p>
                  <p className="text-sm mt-2">Videos feature coming soon!</p>
                </div>
              )
            ) : favoriteRecipes.length > 0 ? (
              favoriteRecipes.map((recipe) => (
                <RecipeCard
                  key={`recipe-${recipe._id}`}
                  recipe={recipe}
                  initialIsLiked={true}
                  onUnlike={() => {
                    setFavoriteRecipes((prev) =>
                      prev.filter((r) => r._id !== recipe._id)
                    );
                  }}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">No favorite recipes found</p>
                <p className="text-sm mt-2">
                  Save your favorite recipes using the ♡ button!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
