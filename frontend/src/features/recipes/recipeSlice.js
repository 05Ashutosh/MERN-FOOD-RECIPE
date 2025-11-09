import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../../utils/api";
import { toast } from "react-toastify";

export const fetchRecipes = createAsyncThunk(
  "recipes/fetchAll",
  async ({ query }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/recipes?query=${query}`, "GET");
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRecipesLimit = createAsyncThunk(
  "recipes/fetchRecipeLimit",
  async ({ limit, page }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(
        `/recipes/recipeLimit?limit=${limit}&page=${page}`,
        "GET"
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRecipeById = createAsyncThunk(
  "recipes/fetchById",
  async (recipeId, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/recipes/${recipeId}`, "GET");
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const publishRecipe = createAsyncThunk(
  "recipes/publish",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/recipes/publish", "POST", formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const recipeSlice = createSlice({
  name: "recipes",
  initialState: {
    recipes: [],
    currentRecipe: null,
    totalPages: 1,
    currentPage: 1,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.recipes = payload.data.recipes;
      })
      .addCase(fetchRecipes.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
      })

      .addCase(fetchRecipesLimit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipesLimit.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.recipes = payload.data.recipes;
        state.currentPage = payload.data.currentPage;
        state.totalPages = payload.data.totalPages;
      })
      .addCase(fetchRecipesLimit.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
      })

      .addCase(fetchRecipeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipeById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentRecipe = payload.data;
      })
      .addCase(fetchRecipeById.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
      })
      .addCase(publishRecipe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishRecipe.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.recipes.unshift(payload.data);
        toast.success("Recipe published successfully");
      })
      .addCase(publishRecipe.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message;
        toast.error(error.message);
      });
  },
});

export default recipeSlice.reducer;
