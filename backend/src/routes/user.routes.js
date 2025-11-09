import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    changeCurrentPassword, getCurrentUser,
    loginUser,
    logout,
    refreshAccessToken,
    registerUser, updateAccountDetails,
    getUserByUsername, followUser, unfollowUser
} from "../controllers/user.controller.js";

const router = Router();

router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] User router hit: ${req.method} ${req.url}`);
    next();
});

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    (req, res, next) => {
        console.log(`[${new Date().toISOString()}] Register route hit with method: ${req.method}`);
        console.log(`[${new Date().toISOString()}] Files received:`, req.files);
        console.log(`[${new Date().toISOString()}] Body received:`, req.body);
        next();
    },
    registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/logout").post(verifyJWT, logout);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/update-account")
  .patch(
    verifyJWT,
    upload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "coverImage", maxCount: 1 },
    ]),
    updateAccountDetails
  );

// Public profile and social actions
router.route("/profile/:username").get(getUserByUsername);
router.route("/follow/:username").post(verifyJWT, followUser);
router.route("/unfollow/:username").post(verifyJWT, unfollowUser);

export default router;