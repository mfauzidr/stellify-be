import multer, {
  Field,
  memoryStorage,
  Options,
} from "multer";
import { RequestHandler } from "express";

const createMulterOptions = (): Options => ({
  storage: memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedMime = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedMime.includes(file.mimetype)) {
      return cb(new Error("INVALID_FILE_TYPE"));
    }

    cb(null, true);
  },
});

const uploader = multer(createMulterOptions());

export const singleUploader = (
  fieldName: string
): RequestHandler => uploader.single(fieldName);

export const multiUploader = (
  fieldName: string,
  maxCount: number
): RequestHandler => uploader.array(fieldName, maxCount);

export const multiFieldUploader = (
  fields: Field[]
): RequestHandler => uploader.fields(fields);