import { Router } from "express";
import recipeRoutes from "./recipe.routes.js";
import videoRoutes from "./video.routes.js";
import likeRoutes from "./likes.routes.js";
import userRoutes from "./user.routes.js";
import notificationRoutes from "./Notification.routes.js";

const router = Router();

router.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] Incoming request: ${req.method} ${req.url}`
  );
  next();
});

router.use("/users", userRoutes);
router.use("/recipes", recipeRoutes);
router.use("/videos", videoRoutes);
router.use("/likes", likeRoutes);
router.use("/notification", notificationRoutes);

router.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] No route matched for: ${req.method} ${
      req.url
    }`
  );
  next();
});

export default router;
