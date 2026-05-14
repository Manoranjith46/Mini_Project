import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL || "";

const storage = new GridFsStorage({
  url: DATABASE_URL,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (_req: any, file: any) => {
    return {
      bucketName: "uploads",
      filename: `${Date.now()}-${file.originalname}`,
    };
  },
});

export const upload = multer({ storage });
