import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(`[${new Date().toISOString()}] Multer destination set to ./public/temp for file: ${file.originalname}`);
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    console.log(`[${new Date().toISOString()}] Multer saving file as: ${file.originalname}`);
    cb(null, file.originalname);
  }
});

export const upload = multer({ storage });