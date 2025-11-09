import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Notification } from "../models/Notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/APIResponse.js";

const router = Router();

router.get("/message", verifyJWT, async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ date: -1 })
    .limit(50)
    .populate("sender", "username avatar");
  res
    .status(200)
    .json(
      new APIResponse(200, notifications, "Notifications fetched successfully")
    );
});

router.get("/message/read")
export default router;
