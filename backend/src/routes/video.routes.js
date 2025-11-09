import { Router } from "express";
import {
  getAllVideos,
  getVideoById,
  publishVideo,
  deleteVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(getAllVideos);
router
  .route("/publish")
  .post(
    verifyJWT,
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    publishVideo
  );
router.route("/:videoId")
  .get(getVideoById)
  .delete(verifyJWT, deleteVideo);

export default router;
