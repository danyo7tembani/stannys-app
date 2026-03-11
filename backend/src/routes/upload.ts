import { Router, Request, Response } from "express";
import multer from "multer";
import { config } from "../config.js";
import { handleUpload } from "../services/upload.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

/** POST /upload : un fichier (file) ou plusieurs (files), retour { url } ou { urls } */
router.post(
  "/",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "files", maxCount: 50 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const files: Express.Multer.File[] = [];
      const f = req.files as { file?: Express.Multer.File[]; files?: Express.Multer.File[] } | undefined;
      if (f?.file?.length) files.push(...f.file);
      if (f?.files?.length) files.push(...f.files);

      const cloudinaryConfig =
        config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET
          ? {
              cloudName: config.CLOUDINARY_CLOUD_NAME,
              apiKey: config.CLOUDINARY_API_KEY,
              apiSecret: config.CLOUDINARY_API_SECRET,
            }
          : null;
      const result = await handleUpload(files, config.UPLOAD_DIR, cloudinaryConfig);
      if ("error" in result) {
        return res.status(result.status).json({ error: result.error });
      }
      const { urls } = result;
      if (urls.length === 1) {
        return res.json({ url: urls[0] });
      }
      return res.json({ urls });
    } catch (e) {
      console.error("POST /upload", e);
      res.status(500).json({ error: "Erreur lors de l'upload" });
    }
  }
);

export default router;
