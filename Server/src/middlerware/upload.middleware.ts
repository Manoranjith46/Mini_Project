import multer from "multer";
import "dotenv/config";

// Use memory storage - we'll handle GridFS upload in the controller
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});
