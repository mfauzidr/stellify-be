import { Request, Response } from "express";
import { IIdolGroupsBody, IIdolGroupsParams } from "./idol_groups.model";
import { IIdolGroupsResponse } from "../../shared/models/response.model";
import {
  findAll,
  findByUuid,
  insert,
  update,
  remove,
  setActiveStatus,
} from "./idol_groups.repo";
import { AppError } from "src/shared/helper/appError";
import { cloudinaryUploader } from "src/shared/helper/courdinary";

export const getAllIdolGroups = async (
  req: Request,
  res: Response<IIdolGroupsResponse>,
): Promise<Response> => {
  const idolGroups = await findAll();
  if (idolGroups.length < 1) {
    throw new AppError("NO_DATA", "No Data Found", 404);
  }

  return res.status(200).json({
    success: true,
    message: `List all idol groups. ${idolGroups.length} data found`,
    results: idolGroups,
  });
};

export const getIdolGroupByUuid = async (
  req: Request<IIdolGroupsParams>,
  res: Response<IIdolGroupsResponse>,
): Promise<Response> => {
  const { uuid } = req.params;

  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const idolGroups = await findByUuid(uuid);
  if (idolGroups.length < 1) {
    throw new AppError("NO_DATA", "No Data Found", 404);
  }

  return res.status(200).json({
    success: true,
    message: `Idol group with UUID ${uuid} found`,
    results: idolGroups,
  });
};

export const createIdolGroup = async (
  req: Request<{}, {}, IIdolGroupsBody>,
  res: Response<IIdolGroupsResponse>,
): Promise<Response> => {
  if (!req.body.name) {
    throw new AppError("NO_NAME", "Name must be provided", 400);
  }

  console.log(req.files)

  const newIdolGroup = await insert(req.body);

  const uuid = newIdolGroup[0].uuid;

  const files = req.files as {
    logo?: Express.Multer.File[];
    banner?: Express.Multer.File[];
  };

  let logoUrl: string | undefined;
  let bannerUrl: string | undefined;

  if (files.logo?.length) {
    const uploadResult = await cloudinaryUploader(
      files.logo[0],
      "idol-groups/logo",
      uuid,
    );

    if (uploadResult.error) {
      throw new AppError("UPLOAD_FAILED", "Failed to upload image", 400);
    }
    logoUrl = uploadResult.result!.secure_url;
    await update(uuid, { logo: logoUrl });
  }

  if (files.banner?.length) {
    const uploadResult = await cloudinaryUploader(
      files.banner[0],
      "idol-groups/banner",
      uuid,
    );

    if (uploadResult.error) {
      throw new AppError("UPLOAD_FAILED", "Failed to upload image", 400);
    }
    bannerUrl = uploadResult.result!.secure_url;
    await update(uuid, { banner: bannerUrl });
  }

  console.log(logoUrl,bannerUrl)

  return res.status(201).json({
    success: true,
    message: "Idol group created successfully",
    results: newIdolGroup,
  });
};

export const updateIdolGroup = async (
  req: Request<{ uuid: string }, {}, IIdolGroupsBody>,
  res: Response<IIdolGroupsResponse>,
): Promise<Response> => {
  const { uuid } = req.params;

  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const data: Partial<IIdolGroupsBody> = { ...req.body };

  const files = req.files as {
    logo?: Express.Multer.File[];
    banner?: Express.Multer.File[];
  };

  let logoUrl: string | undefined;
  let bannerUrl: string | undefined;

  if (files.logo?.length) {
    const uploadResult = await cloudinaryUploader(
      files.logo[0],
      "idol-groups/logo",
      uuid,
    );

    if (uploadResult.error) {
      throw new AppError("UPLOAD_FAILED", "Failed to upload image", 400);
    }
    logoUrl = uploadResult.result!.secure_url;
    data.logo = logoUrl
  }

  if (files.banner?.length) {
    const uploadResult = await cloudinaryUploader(
      files.banner[0],
      "idol-groups/banner",
      uuid,
    );

    if (uploadResult.error) {
      throw new AppError("UPLOAD_FAILED", "Failed to upload image", 400);
    }
    bannerUrl = uploadResult.result!.secure_url;
    data.banner = bannerUrl
  }

  const updatedIdolGroup = await update(uuid, data);
  if (updatedIdolGroup.length < 1) {
    throw new AppError("NOT_FOUND", "Idol group not found", 404);
  }
  return res.status(200).json({
    success: true,
    message: "Idol group updated successfully",
    results: updatedIdolGroup,
  });
};

export const deleteIdolGroup = async (
  req: Request<{ uuid: string }>,
  res: Response<IIdolGroupsResponse>,
): Promise<Response> => {
  const { uuid } = req.params;
  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const deletedIdolGroup = await remove(uuid);
  return res.status(200).json({
    success: true,
    message: "Idol group deleted successfully",
    results: deletedIdolGroup,
  });
};

export const deactivateIdolGroup = async (
  req: Request<{ uuid: string }>,
  res: Response<IIdolGroupsResponse>,
): Promise<Response> => {
  const { uuid } = req.params;
  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const result = await setActiveStatus(uuid, false);
  if (result.length < 1) {
    throw new AppError("NO_DATA", "No Data Found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Idol group deactivated successfully",
    results: result,
  });
};

export const restoreIdolGroup = async (
  req: Request<{ uuid: string }>,
  res: Response<IIdolGroupsResponse>,
): Promise<Response> => {
  const { uuid } = req.params;
  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const result = await setActiveStatus(uuid, true);
  if (result.length < 1) {
    throw new AppError("NO_DATA", "No Data Found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Idol group restored successfully",
    results: result,
  });
};
