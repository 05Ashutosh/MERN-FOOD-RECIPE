import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { ArrowLeft, ArrowRight } from "lucide-react";
import RecipeCard from "../components/RecipeCard";
import {
  fetchRecipes,
  fetchRecipesLimit,
} from "../features/recipes/recipeSlice";
import CategoryNav from "../components/CategoryNav.jsx";
import { useLocation } from "react-router-dom";

const HomePage = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { recipes, loading, error, totalPages, currentPage } = useSelector(
    (state) => state.recipes
  );
  // const trendingRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    dispatch(fetchRecipes({ query: "" }));
  }, [dispatch]);

  const [page, setPage] = useState(1);
  const limit = 2;

  // useEffect(() => {
  //   dispatch(fetchRecipesLimit({ page, limit }));
  // }, [dispatch, page]);

  const filteredRecipes =
    activeCategory === "all"
      ? recipes
      : recipes?.filter((recipe) => {
          const recipeCategory = recipe.category?.toLowerCase();
          const categoryMap = {
            appetizers: "appetizers",
            "main-courses": "main courses",
            "side-dishes": "side dishes",
            desserts: "desserts",
            "soups-salads": "soups & salads",
            beverages: "beverages",
            snacks: "snacks",
            vegetarian: "vegetarian",
          };
          return recipeCategory === categoryMap[activeCategory];
        });

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-600">Loading recipes...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-red-600">Error: {error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 overflow-x-hidden max-w-full">
      <CategoryNav
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recommended Recipes</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-4">
          {filteredRecipes && filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))
          ) : (
            <p className="text-gray-600">No recipes found in this category</p>
          )}
        </div>
      </section>
      <div className="w-full m-auto flex justify-center items-center">
        <button
          className="py-1 px-3 rounded-2xl bg-orange-500 text-lg text-white"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        >
          Prev
        </button>
        <span className=" px-2">
          {currentPage}/{totalPages}
        </span>
        <button
          className="py-1 px-3 rounded-2xl bg-orange-500 text-lg text-white"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        >
          Next
        </button>
      </div>

      {/* Trending Recipes
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Trending Now</h2>
          <div className="gap-4 hidden md:block">
            <button
              onClick={() => scroll(trendingRef, "left")}
              className="bg-orange-100 rounded-xl  px-5 py-2 hover:orange-500 group mr-2"
            >
              <ArrowLeft className="text-orange-300 group-hover:text-orange-500" />
            </button>
            <button
              onClick={() => scroll(trendingRef, "right")}
              className="bg-orange-100 rounded-xl  px-5 py-2 hover:orange-500 group"
            >
              <ArrowRight className="text-orange-300 group-hover:text-orange-500" />
            </button>
          </div>
        </div>
        <div
          ref={trendingRef}
          className="flex flex-col md:flex-row overflow-x-auto pb-4 gap-6 no-scrollbar"
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {recipes && recipes.length > 0 ? (
            recipes.map((recipe) => (
              <div key={recipe._id} className="min-w-[300px]">
                <RecipeCard recipe={recipe} />
              </div>
            ))
          ) : (
            <p className="text-gray-600">No recipes found</p>
          )}
        </div>
      </section> */}
    </main>
  );
};

export default HomePage;
