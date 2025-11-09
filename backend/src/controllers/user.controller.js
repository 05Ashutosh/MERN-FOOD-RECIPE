import { User } from "../models/user.model.js";
import { Recipe } from "../models/recipes.model.js";
import { Like } from "../models/like.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary, cloudinaryDelete } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs";
import { io } from "../../server.js";
import { Notification } from "../models/Notification.model.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new APIError(500, "Token generation failed");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  console.log(`[${new Date().toISOString()}] Entering registerUser controller`);

  const { fullName, email, username, password } = req.body;
  console.log(`[${new Date().toISOString()}] Request body:`, {
    fullName,
    email,
    username: username?.toLowerCase(),
  });

  if ([fullName, email, username, password].some((field) => !field?.trim())) {
    throw new APIError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new APIError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  console.log(`[${new Date().toISOString()}] Local files:`, {
    avatar: avatarLocalPath,
    coverImage: coverImageLocalPath,
  });

  if (!avatarLocalPath) {
    throw new APIError(400, "Avatar file is required");
  }

  const verifyLocalFile = (filePath) => {
    if (!fs.existsSync(filePath)) {
      console.error(`File missing: ${filePath}`);
      throw new APIError(500, "Temporary file storage failed");
    }
    if (fs.statSync(filePath).size === 0) {
      console.error(`Empty file: ${filePath}`);
      throw new APIError(400, "Invalid file content");
    }
  };

  try {
    verifyLocalFile(avatarLocalPath);
    if (coverImageLocalPath) verifyLocalFile(coverImageLocalPath);
  } catch (error) {
    [avatarLocalPath, coverImageLocalPath].forEach((filePath) => {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    throw error;
  }

  let avatar, coverImage;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url) {
      throw new APIError(500, "Avatar upload failed");
    }

    if (coverImageLocalPath) {
      coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }
  } catch (uploadError) {
    if (avatar?.public_id) await cloudinaryDelete(avatar.url);
    if (coverImage?.public_id) await cloudinaryDelete(coverImage.url);

    throw new APIError(500, `File upload failed: ${uploadError.message}`);
  }

  try {
    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken -__v"
    );

    if (!createdUser) {
      throw new APIError(500, "User registration failed");
    }

    return res
      .status(201)
      .json(new APIResponse(201, createdUser, "User registered successfully"));
  } catch (dbError) {
    if (avatar?.public_id) await cloudinaryDelete(avatar.url);
    if (coverImage?.public_id) await cloudinaryDelete(coverImage.url);

    throw new APIError(500, `Database error: ${dbError.message}`);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const loginId = username || email;

  if (!loginId) {
    throw new APIError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username: loginId }, { email: loginId }],
  });

  if (!user) {
    throw new APIError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new APIError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -__v"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new APIResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "Login successful"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new APIResponse(200, {}, "Logout successful"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) {
    throw new APIError(400, "Refresh Token is required");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new APIError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new APIError(401, "Invalid Refresh Token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new APIResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Acess token refreshed successfully"
        )
      );
  } catch (error) {
    throw new APIError(401, error?.message || "Invalid Refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new APIError(400, "Old Password and New Password are required");
  }

  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new APIError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new APIResponse(200, {}, "Password changes successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new APIResponse(
      200,
      {
        user: req.user,
      },
      "User details fetched successfully"
    )
  );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, bio, username } = req.body || {};

  const user = await User.findById(req.user._id);
  if (!user) throw new APIError(404, "User not found");

  const updates = {};
  if (typeof fullName === "string" && fullName.trim())
    updates.fullName = fullName.trim();
  if (typeof email === "string" && email.trim()) updates.email = email.trim();
  if (typeof bio === "string") updates.bio = bio;

  // Handle username update with uniqueness check
  if (
    typeof username === "string" &&
    username.trim() &&
    username.trim() !== user.username
  ) {
    const usernameExists = await User.findOne({
      username: username.trim().toLowerCase(),
    });
    if (usernameExists) throw new APIError(400, "Username already taken");
    updates.username = username.trim().toLowerCase();
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  let newAvatarUrl = null;
  let newCoverUrl = null;

  try {
    if (avatarLocalPath) {
      const uploaded = await uploadOnCloudinary(avatarLocalPath);
      if (!uploaded?.url) throw new APIError(500, "Avatar upload failed");
      newAvatarUrl = uploaded.url;
    }
    if (coverLocalPath) {
      const uploaded = await uploadOnCloudinary(coverLocalPath);
      if (!uploaded?.url) throw new APIError(500, "Cover upload failed");
      newCoverUrl = uploaded.url;
    }
  } catch (e) {
    if (newAvatarUrl) await cloudinaryDelete(newAvatarUrl);
    if (newCoverUrl) await cloudinaryDelete(newCoverUrl);
    throw e;
  }

  if (newAvatarUrl) {
    try {
      if (user.avatar) await cloudinaryDelete(user.avatar);
    } catch (_) {}
    updates.avatar = newAvatarUrl;
  }
  if (newCoverUrl) {
    try {
      if (user.coverImage) await cloudinaryDelete(user.coverImage);
    } catch (_) {}
    updates.coverImage = newCoverUrl;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
  }).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new APIResponse(200, updatedUser, "Account details updated successfully")
    );
});

// Public profile by username with recipes
const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username: username.toLowerCase() })
    .select("-password -refreshToken -__v")
    .lean();

  if (!user) {
    throw new APIError(404, "User not found");
  }

  const recipes = await Recipe.find({ owner: user._id })
    .populate("owner", "username email avatar")
    .lean();

  // Add like counts to recipes
  const recipesWithLikes = await Promise.all(
    recipes.map(async (recipe) => {
      const likesCount = await Like.countDocuments({ recipe: recipe._id });
      return { ...recipe, likesCount };
    })
  );

  const response = {
    user: {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      coverImage: user.coverImage || "",
      bio: user.bio || "",
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
    },
    recipes: recipesWithLikes,
  };

  return res
    .status(200)
    .json(new APIResponse(200, response, "Profile fetched"));
});

const followUser = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const target = await User.findOne({ username: username.toLowerCase() });
  if (!target) throw new APIError(404, "User not found");
  if (target._id.toString() === req.user._id.toString()) {
    throw new APIError(400, "You cannot follow yourself");
  }
  // realtime notification

  await User.findByIdAndUpdate(target._id, {
    $addToSet: { followers: req.user._id },
  });
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { following: target._id },
  });

  const updated = await User.findById(target._id).select("followers following");
  // res.redirect("http://localhost:5000/api/v1/notifications/message", {
  //   message: `${req.user.fullName} followed you`,
  // });

  try {
    const notification = new Notification({
      message: `${req.user.fullName} followed you`,
      recipient: target._id,
      sender: req.user._id,
    });
    await notification.save();

    // io.to(target._id.toString()).emit("notification", notification);
    const populateNotification = await Notification.findById(
      notification._id
    ).populate("sender", "username avatar fullName");
    io.to(target._id.toString()).emit("notification", populateNotification);
    console.log(notification);
  } catch (e) {
    console.error("Notification error:", e);
  }
  return res.status(200).json(
    new APIResponse(
      200,
      {
        followersCount: updated.followers.length,
        followingCount: updated.following.length,
      },
      "Followed"
    )
  );
});

// Unfollow a user by username
const unfollowUser = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const target = await User.findOne({ username: username.toLowerCase() });
  if (!target) throw new APIError(404, "User not found");
  if (target._id.toString() === req.user._id.toString()) {
    throw new APIError(400, "You cannot unfollow yourself");
  }

  await User.findByIdAndUpdate(target._id, {
    $pull: { followers: req.user._id },
  });
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { following: target._id },
  });

  const updated = await User.findById(target._id).select("followers following");
  const unFollowNotification = await Notification.create({
    message: `${req.user.fullName} unfollowed you`,
    recipient: target._id,
    sender: req.user._id,
  });
  const populateNotification = await Notification.findById(
    unFollowNotification._id
  ).populate("sender", "username avatar fullName");
  io.to(target._id.toString()).emit("notification", populateNotification);
  console.log(unFollowNotification);
  return res.status(200).json(
    new APIResponse(
      200,
      {
        followersCount: updated.followers.length,
        followingCount: updated.following.length,
      },
      "Unfollowed"
    )
  );
});

export {
  registerUser,
  loginUser,
  logout,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  getUserByUsername,
  followUser,
  unfollowUser,
};
