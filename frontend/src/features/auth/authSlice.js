import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../../utils/api";
import { toast } from "react-toastify";

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiRequest(
        "/users/register",
        "POST",
        formData
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiRequest(
        "/users/login",
        "POST",
        credentials
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const logoutUserAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest(
        "/users/logout",
        "POST",
        null
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, { payload }) => {
      state.user = payload.user;
      state.accessToken = payload.token;
      state.isAuthenticated = true;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("accessToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.data;
        state.isAuthenticated = true;
        toast.success("Registration successful!");
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        toast.error(payload);
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.data.user;
        state.accessToken = payload.data.accessToken;
        state.isAuthenticated = true;
        localStorage.setItem("accessToken", payload.data.accessToken);
        toast.success("Login successful!");
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.isAuthenticated = false;
        toast.error(payload);
      })
      .addCase(logoutUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem("accessToken");
        toast.success("Logged out successfully!");
      })
      .addCase(logoutUserAsync.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        toast.error(payload);
      });
  },
});

export const { setUser, setAuthenticated, logoutUser } = authSlice.actions;
export default authSlice.reducer;
