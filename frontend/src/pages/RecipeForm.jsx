import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  X,
  Upload,
  ChefHat,
  Clock,
  Image,
  Video,
  Trash2,
} from "lucide-react";
import { publishRecipe } from "../features/recipes/recipeSlice";

const DifficultyBadge = ({ level, label, isSelected, onClick }) => {
  const baseClasses =
    "px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer";
  const variants = {
    easy: isSelected
      ? "bg-green-500 text-white"
      : "bg-green-100 text-green-600 hover:bg-green-200",
    intermediate: isSelected
      ? "bg-yellow-500 text-white"
      : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200",
    advanced: isSelected
      ? "bg-red-500 text-white"
      : "bg-red-100 text-red-600 hover:bg-red-200",
  };

  return (
    <div className={`${baseClasses} ${variants[level]}`} onClick={onClick}>
      {label}
    </div>
  );
};

const categories = [
  { value: "APPETIZERS", label: "APPETIZERS" },
  { value: "MAIN COURSES", label: "MAIN COURSES" },
  { value: "SIDE DISHES", label: "SIDE DISHES" },
  { value: "DESSERTS", label: "DESSERTS" },
  { value: "SOUPS & SALADS", label: "SOUPS & SALADS" },
  { value: "BEVERAGES", label: "BEVERAGES" },
  { value: "SNACKS", label: "SNACKS" },
  { value: "VEGETARIAN", label: "VEGETARIAN" },
];

const RecipeForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.recipes);

  const [formData, setFormData] = useState({
    title: "",
    prepTime: "",
    cookTime: "",
    difficulty: "easy",
    description: "",
    ingredients: [""],
    instructions: [""],
    category: "",
    mediaType: "photo",
    image: null,
    video: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleDifficultyChange = (difficulty) => {
    setFormData((prevData) => ({
      ...prevData,
      difficulty,
    }));
  };

  const handleDynamicChange = (index, field, value) => {
    const newItems = [...formData[field]];
    newItems[index] = value;
    setFormData((prevData) => ({
      ...prevData,
      [field]: newItems,
    }));
  };

  const addItem = (field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: [...prevData[field], ""],
    }));
  };

  const removeItem = (index, field) => {
    if (formData[field].length > 1) {
      setFormData((prevData) => ({
        ...prevData,
        [field]: prevData[field].filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.prepTime ||
      !formData.cookTime ||
      !formData.difficulty ||
      (formData.mediaType === "photo" && !formData.image) ||
      (formData.mediaType === "video" && !formData.video) ||
      formData.ingredients.some((ing) => !ing) ||
      formData.instructions.some((step) => !step)
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("prepTime", formData.prepTime);
      formDataToSend.append("cookTime", formData.cookTime);
      formDataToSend.append("difficulty", formData.difficulty);
      
      const type = formData.mediaType === "photo" ? "image" : "video";
      formDataToSend.append("type", type);

      if (formData.mediaType === "photo") {
        formDataToSend.append("mediaFile", formData.image);
      } else {
        formDataToSend.append("mediaFile", formData.video);
      }

      formData.instructions.forEach((instruction, index) => {
        formDataToSend.append("steps", instruction);
      });

      formData.ingredients.forEach((ingredient, index) => {
        formDataToSend.append("ingredients", ingredient);
      });

      await dispatch(publishRecipe(formDataToSend)).unwrap();
      navigate("/");
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-100 to-yellow-100 py-12 px-4 overflow-x-hidden max-w-full">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-800">
                Create New Recipe
              </h1>
            </div>
            <button
              onClick={() => navigate("/")}
              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, mediaType: "photo" }))
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                formData.mediaType === "photo"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Image className="h-5 w-5" />
              <span>Photo Recipe</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, mediaType: "video" }))
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                formData.mediaType === "video"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Video className="h-5 w-5" />
              <span>Video Recipe</span>
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            encType="multipart/form-data"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipe Name
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g., Homemade Margherita Pizza"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prep Time (mins)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        name="prepTime"
                        placeholder="15"
                        value={formData.prepTime}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cook Time (mins)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        name="cookTime"
                        placeholder="30"
                        value={formData.cookTime}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <div className="flex gap-4">
                    {[
                      { value: "easy", label: "Easy" },
                      { value: "intermediate", label: "Medium" },
                      { value: "advanced", label: "Hard" }
                    ].map((diff) => (
                      <DifficultyBadge
                        key={diff.value}
                        level={diff.value}
                        label={diff.label}
                        isSelected={formData.difficulty === diff.value}
                        onClick={() => handleDifficultyChange(diff.value)}
                      />
                    ))}
                  </div>
                  <input
                    type="hidden"
                    name="difficulty"
                    value={formData.difficulty}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.mediaType === "photo"
                      ? "Recipe Image"
                      : "Recipe Video"}
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="mediaFile"
                      accept={
                        formData.mediaType === "photo" ? "image/*" : "video/*"
                      }
                      onChange={(e) => {
                        if (formData.mediaType === "photo") {
                          handleChange({
                            target: {
                              name: "image",
                              files: e.target.files,
                            },
                          });
                        } else {
                          handleChange({
                            target: {
                              name: "video",
                              files: e.target.files,
                            },
                          });
                        }
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                    <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  {formData.mediaType === "photo" && formData.image && (
                    <p className="mt-1 text-sm text-gray-500">
                      Selected: {formData.image.name}
                    </p>
                  )}
                  {formData.mediaType === "video" && formData.video && (
                    <p className="mt-1 text-sm text-gray-500">
                      Selected: {formData.video.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipe Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Tell us about your recipe..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[120px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients
                  </label>
                  <div className="space-y-2">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          name="ingredients"
                          placeholder={`e.g., 2 cups of flour`}
                          value={ingredient}
                          onChange={(e) =>
                            handleDynamicChange(
                              index,
                              "ingredients",
                              e.target.value
                            )
                          }
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(index, "ingredients")}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          disabled={formData.ingredients.length === 1}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addItem("ingredients")}
                      className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Ingredient</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <div className="space-y-2">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      name="steps"
                      placeholder={`Step ${index + 1}: Mix the ingredients...`}
                      value={instruction}
                      onChange={(e) =>
                        handleDynamicChange(
                          index,
                          "instructions",
                          e.target.value
                        )
                      }
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[80px]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index, "instructions")}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors self-start"
                      disabled={formData.instructions.length === 1}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem("instructions")}
                  className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Instruction</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-center mt-4">{error}</div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-orange-300 flex items-center gap-2"
              >
                {loading ? (
                  "Publishing..."
                ) : (
                  <>
                    <ChefHat className="h-5 w-5" />
                    <span>Publish Recipe</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecipeForm;
