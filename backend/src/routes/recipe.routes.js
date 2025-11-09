import { Router } from "express";
import {
  getAllRecipes,
  getRecipeById,
  publish,
  deleteRecipe,
  getRecipeLimit,
} from "../controllers/recipe.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getAllRecipes);
router.route("/recipeLimit").get(getRecipeLimit);
router
  .route("/publish")
  .post(
    verifyJWT,
    upload.fields([{ name: "mediaFile", maxCount: 1 }]),
    publish
  );
router.route("/:recipeId").get(getRecipeById).delete(verifyJWT, deleteRecipe);

export default router;
