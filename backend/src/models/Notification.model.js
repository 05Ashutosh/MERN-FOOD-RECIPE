import mongoose from "mongoose";
const NotificationSchema = new mongoose.Schema({
  message: String,
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  read: {
    type: Boolean,
    default: false,
  },
  date: { type: Date, default: Date.now },
});

export const Notification = mongoose.model("Notification", NotificationSchema);
