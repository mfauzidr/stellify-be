import { UploadApiOptions, UploadApiResponse } from "cloudinary";
import DataUriParser from "datauri/parser";
import path from "path";

import cloudinary from "../config/cloud";

const parser = new DataUriParser();

export const cloudinaryUploader = async (
  file: Express.Multer.File,
  folder: string,
  uid: string,
): Promise<{ result?: UploadApiResponse; error?: Error }> => {
  const { buffer, originalname } = file;

  const extName = path.extname(originalname);
  const base64File = parser.format(extName, buffer);

  if (!base64File.content) {
    return {
      error: new Error("Failed parsing file"),
    };
  }

  try {
    const uploadConfig: UploadApiOptions = {
      folder,
      public_id: uid,
      overwrite: true,
      invalidate: true,
    };

    const result = await cloudinary.uploader.upload(
      base64File.content,
      uploadConfig,
    );

    return { result };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error
          : new Error("Cloudinary upload failed"),
    };
  }
};