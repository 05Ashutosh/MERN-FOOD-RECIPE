import { Router } from 'express';
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleRecipeLike,
    favoriteRecipe,
    unfavoriteRecipe,
    getLikedVideos,
    getLikedRecipes
} from '../controllers/like.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/toggle/video/:videoId').post(toggleVideoLike);
router.route('/toggle/comment/:commentId').post(toggleCommentLike);
router.route('/toggle/recipe/:recipeId').post(toggleRecipeLike);
router.route('/favorite/recipe/:recipeId').post(favoriteRecipe);
router.route('/unfavorite/recipe/:recipeId').post(unfavoriteRecipe);
router.route('/videos').get(getLikedVideos);
router.route('/recipes').get(getLikedRecipes);

export default router;