import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Trash2 } from "lucide-react";
import VideoCard from "../components/videoCard";
import RecipeCard from "../components/RecipeCard";
import { apiRequest } from "../utils/api";
import { setUser } from "../features/auth/authSlice";

const Profile = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("recipes");
  const [loading, setLoading] = useState(true);
  const isOwnProfile = !username || username === currentUser?.username;
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    fullName: currentUser?.fullName || "",
    username: currentUser?.username || "",
    bio: currentUser?.bio || "",
    avatar: null,
    coverImage: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [user, setUser] = useState({
    name: currentUser?.fullName || currentUser?.username || "Loading...",
    username: username || currentUser?.username || "user",
    avatar: currentUser?.avatar || "https://via.placeholder.com/150?text=AS",
    coverImage: currentUser?.coverImage || "",
    joinDate: currentUser?.createdAt
      ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Recently",
    followersCount: Array.isArray(currentUser?.followers)
      ? currentUser.followers.length
      : 0,
    followingCount: Array.isArray(currentUser?.following)
      ? currentUser.following.length
      : 0,
    bio: currentUser?.bio || "Food enthusiast 🍳",
  });

  const [userContent, setUserContent] = useState({
    videos: [],
    recipes: [],
  });

  const [showConfirm, setShowConfirm] = useState(null);

  useEffect(() => {
    const fetchUserContent = async () => {
      setLoading(true);
      try {
        if (!username || isOwnProfile) {
          if (!currentUser?._id) {
            setLoading(false);
            return;
          }
          const [recipesResponse, videosResponse] = await Promise.all([
            apiRequest(
              `/recipes?userId=${currentUser._id}`,
              "GET",
              null,
              dispatch
            ),
            apiRequest(
              `/videos?userId=${currentUser._id}`,
              "GET",
              null,
              dispatch
            ).catch(() => ({ data: { videos: [] } })),
          ]);
          setUserContent({
            recipes: recipesResponse.data.recipes || [],
            videos: videosResponse.data?.videos || [],
          });
          setIsFollowing(false);
        } else {
          const profileRes = await apiRequest(
            `/users/profile/${username}`,
            "GET",
            null,
            dispatch
          );
          const profileUser = profileRes.data.user;
          setUser({
            name: profileUser.fullName || profileUser.username,
            username: profileUser.username,
            avatar: profileUser.avatar,
            coverImage: profileUser.coverImage || "",
            joinDate: "Recently",
            followersCount: profileUser.followersCount || 0,
            followingCount: profileUser.followingCount || 0,
            bio: profileUser.bio || "Food enthusiast 🍳",
          });
          setUserContent((prev) => ({
            ...prev,
            recipes: profileRes.data.recipes || [],
          }));
          // fill videos if available via videos endpoint
          try {
            const videosRes = await apiRequest(
              `/videos?userId=${profileUser._id}`,
              "GET",
              null,
              dispatch
            );
            setUserContent((prev) => ({
              ...prev,
              videos: videosRes.data?.videos || [],
            }));
          } catch (_) {
            setUserContent((prev) => ({ ...prev, videos: [] }));
          }
          const followingIds = Array.isArray(currentUser?.following)
            ? currentUser.following.map((id) => id.toString())
            : [];
          setIsFollowing(followingIds.includes(profileUser._id));
        }
      } catch (error) {
        console.error("Failed to fetch user content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserContent();
  }, [username, isOwnProfile, currentUser, dispatch]);

  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setUser({
        name: currentUser.fullName || currentUser.username || "User",
        username: currentUser.username,
        avatar: currentUser.avatar || "https://via.placeholder.com/150?text=AS",
        coverImage: currentUser.coverImage || "",
        joinDate: currentUser.createdAt
          ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "Recently",
        followersCount: Array.isArray(currentUser.followers)
          ? currentUser.followers.length
          : 0,
        followingCount: Array.isArray(currentUser.following)
          ? currentUser.following.length
          : 0,
        bio: currentUser.bio || "Food enthusiast 🍳",
      });
      setFormValues({
        fullName: currentUser.fullName || "",
        username: currentUser.username || "",
        bio: currentUser.bio || "",
        avatar: null,
        coverImage: null,
      });
      setAvatarPreview(null);
      setCoverPreview(null);
    }
  }, [currentUser, username, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (isOwnProfile || !username) return;
    try {
      if (isFollowing) {
        const res = await apiRequest(
          `/users/unfollow/${username}`,
          "POST",
          null,
          dispatch
        );
        setIsFollowing(false);
        setUser((prev) => ({
          ...prev,
          followersCount: res.data.followersCount,
        }));
      } else {
        const res = await apiRequest(
          `/users/follow/${username}`,
          "POST",
          null,
          dispatch
        );
        setIsFollowing(true);
        setUser((prev) => ({
          ...prev,
          followersCount: res.data.followersCount,
        }));
      }
    } catch (e) {
      console.error("Follow toggle failed", e);
    }
  };

  const handleDelete = (type, id) => {
    setShowConfirm({ type, id });
  };

  const confirmDelete = async (type, id) => {
    try {
      if (type === "recipes") {
        await apiRequest(`/recipes/${id}`, "DELETE", null, dispatch);
      } else if (type === "videos") {
        await apiRequest(`/videos/${id}`, "DELETE", null, dispatch);
      }
      setUserContent((prev) => ({
        ...prev,
        [type]: prev[type].filter((item) => (item._id || item.id) !== id),
      }));
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setShowConfirm(null);
    }
  };

  const cancelDelete = () => setShowConfirm(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">
            Please log in to view your profile
          </p>
          <a
            href="/login"
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      {/* Cover Image Section */}
      <div className="relative w-full h-60 sm:h-80 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">
        <img
          src={
            user.coverImage ||
            "https://images.pexels.com/photos/32375350/pexels-photo-32375350.jpeg?_gl=1*188bca9*_ga*MTgzMjUwMjA2MC4xNzYyNTIwNzgz*_ga_8JE65Q40S6*czE3NjI1MjQ4MTUkbzIkZzEkdDE3NjI1MjQ5MjAkajE2JGwwJGgw"
          }
          alt="cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 sm:-mt-24">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl bg-white"
              />
              <div className="pb-2 text-white sm:text-gray-900">
                <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-lg sm:drop-shadow-none">
                  {user.name}
                </h1>
                <p className="text-white/90 sm:text-gray-600 drop-shadow sm:drop-shadow-none">
                  @{user.username}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="pb-2 flex items-center gap-3">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="bg-orange-500 text-white px-6 py-2.5 rounded-full hover:bg-orange-600 transition-colors shadow-md font-medium"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-2.5 rounded-full transition-colors shadow-md font-medium ${
                    isFollowing
                      ? "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50"
                      : " hover:bg-blue-200 text-blue-600 rounded-full transition-colors"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>

          {/* Bio and Stats */}
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
              <span className="text-gray-600 flex items-center gap-1">
                <span className="font-semibold text-gray-900">
                  {user.followersCount || 0}
                </span>{" "}
                Foodies
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600 flex items-center gap-1">
                <span className="font-semibold text-gray-900">
                  {user.followingCount || 0}
                </span>{" "}
                World
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">Joined {user.joinDate}</span>
            </div>
            {user.bio && (
              <p className="text-gray-700 leading-relaxed">{user.bio}</p>
            )}
          </div>
        </div>

        <div className="mb-8 mt-6">
          <div className="flex justify-center gap-4 border-b border-gray-200 pb-4">
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "videos"
                  ? "bg-orange-100 text-orange-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Videos ({userContent.videos.length})
            </button>
            <button
              onClick={() => setActiveTab("recipes")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "recipes"
                  ? "bg-orange-100 text-orange-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Recipes ({userContent.recipes.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {activeTab === "videos" ? (
            userContent.videos.length > 0 ? (
              userContent.videos.map((video) => (
                <div key={video._id || video.id} className="relative">
                  <VideoCard video={video} />
                  <button
                    onClick={() =>
                      handleDelete("videos", video._id || video.id)
                    }
                    className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors z-10"
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p className="text-lg">No videos uploaded yet</p>
              </div>
            )
          ) : userContent.recipes.length > 0 ? (
            userContent.recipes.map((recipe) => (
              <div key={recipe._id || recipe.id} className="relative">
                <RecipeCard recipe={recipe} />
                <button
                  onClick={() =>
                    handleDelete("recipes", recipe._id || recipe.id)
                  }
                  className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors z-10"
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p className="text-lg">No recipes shared yet</p>
            </div>
          )}
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-80">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this{" "}
                {showConfirm.type.slice(0, -1)}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    confirmDelete(showConfirm.type, showConfirm.id)
                  }
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Profile</h3>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = new FormData();
                  if (
                    formValues.fullName &&
                    formValues.fullName !== (currentUser?.fullName || "")
                  )
                    form.append("fullName", formValues.fullName);
                  if (
                    formValues.username &&
                    formValues.username !== (currentUser?.username || "")
                  )
                    form.append("username", formValues.username);
                  if (typeof formValues.bio === "string")
                    form.append("bio", formValues.bio);
                  if (formValues.avatar)
                    form.append("avatar", formValues.avatar);
                  if (formValues.coverImage)
                    form.append("coverImage", formValues.coverImage);
                  try {
                    const res = await apiRequest(
                      "/users/update-account",
                      "PATCH",
                      form,
                      dispatch
                    );
                    const updated = res.data;
                    const token = localStorage.getItem("accessToken");
                    dispatch(setUser({ user: updated, token }));
                    setUser({
                      name: updated.fullName || updated.username,
                      username: updated.username,
                      avatar: updated.avatar,
                      coverImage: updated.coverImage || "",
                      joinDate: user.joinDate,
                      followersCount: user.followersCount,
                      followingCount: user.followingCount,
                      bio: updated.bio || "",
                    });
                    setIsEditOpen(false);
                    setAvatarPreview(null);
                    setCoverPreview(null);
                  } catch (err) {
                    console.error("Update failed", err);
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formValues.fullName}
                      onChange={(e) =>
                        setFormValues((v) => ({
                          ...v,
                          fullName: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formValues.username}
                      onChange={(e) =>
                        setFormValues((v) => ({
                          ...v,
                          username: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={formValues.bio}
                    onChange={(e) =>
                      setFormValues((v) => ({ ...v, bio: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar
                    </label>
                    <label className="block cursor-pointer">
                      <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm text-gray-700 text-center transition-colors">
                        {formValues.avatar
                          ? formValues.avatar.name
                          : "Choose Image"}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormValues((v) => ({ ...v, avatar: file }));
                            setAvatarPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image
                    </label>
                    <div className="space-y-2">
                      {(coverPreview || currentUser?.coverImage) && (
                        <div className="w-full h-20 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                          <img
                            src={coverPreview || currentUser?.coverImage}
                            alt="cover preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <label className="block cursor-pointer">
                        <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm text-gray-700 text-center transition-colors">
                          {formValues.coverImage
                            ? formValues.coverImage.name
                            : "Choose Cover"}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormValues((v) => ({
                                ...v,
                                coverImage: file,
                              }));
                              setCoverPreview(URL.createObjectURL(file));
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditOpen(false);
                      setAvatarPreview(null);
                      setCoverPreview(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
