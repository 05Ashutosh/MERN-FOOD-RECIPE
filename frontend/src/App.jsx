import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import RecipeDetails from "./pages/RecipeDetails";
import UserProfile from "./pages/UserProfile";
import RecipeForm from "./pages/RecipeForm";
import FavoritesPage from "./pages/FavoritesPage";
import Settings from "./pages/Settings";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import {
  setAuthenticated,
  setUser,
  logoutUser,
} from "./features/auth/authSlice";
import { apiRequest } from "./utils/api";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const ProtectedLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !isSidebarCollapsed
      ) {
        setIsSidebarCollapsed(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarCollapsed]);

  return (
    <>
      <Navbar />
      <div ref={sidebarRef}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />
      </div>
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <Outlet />
      </div>
    </>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        dispatch(setAuthenticated(false));
        setIsCheckingAuth(false);
        return;
      }

      try {
        const response = await apiRequest(
          "/users/current-user",
          "GET",
          null,
          dispatch
        );
        dispatch(setUser({ user: response.data.user, token }));
        setIsCheckingAuth(false);
      } catch (error) {
        if (error.message.includes("Unauthorized")) {
          try {
            const refreshResponse = await apiRequest(
              "/users/refresh-token",
              "POST",
              null,
              dispatch
            );
            const newToken = refreshResponse.data.data.accessToken;
            localStorage.setItem("accessToken", newToken);
            const currentUserResponse = await apiRequest(
              "/users/current-user",
              "GET",
              null,
              dispatch
            );
            dispatch(
              setUser({
                user: currentUserResponse.data.user,
                token: newToken,
              })
            );
            setIsCheckingAuth(false);
          } catch (refreshError) {
            dispatch(logoutUser());
            setIsCheckingAuth(false);
          }
        } else {
          dispatch(logoutUser());
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();
  }, [dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="recipe/:id" element={<RecipeDetails />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="user/:username" element={<UserProfile />} />
          <Route path="create-recipe" element={<RecipeForm />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
