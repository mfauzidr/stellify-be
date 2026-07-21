import { Request, Response } from "express";
import { AppError } from "../../shared/helper/appError";
import { IMemberBody, IMemberQueryParams } from "./members.model";
import { IMemberResponse } from "src/shared/models/response.model";
import { findAll, findDetails, insert, remove, setActiveStatus, update } from "./members.repo";
import { cloudinaryUploader } from "src/shared/helper/courdinary";

export const getAllMembers = async (
  req: Request<{}, {}, {}, IMemberQueryParams>,
  res: Response<IMemberResponse>,
): Promise<Response> => {
  const members = await findAll(req.query);
  if (members.length < 1) {
    throw new AppError("NO_DATA", "No Data Found", 404);
  }
  return res.status(200).json({
    success: true,
    message: `List all members. ${members.length} data found`,
    results: members,
  });
};

export const getDetailMember = async (
  req: Request<{ uuid: string }>,
  res: Response<IMemberResponse>,
): Promise<Response> => {
  const { uuid } = req.params;

  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const member = await findDetails(uuid as string);
  if (member.length === 0) {
    throw new AppError("NO_DATA", "No Data Found", 404);
  }
  return res.status(200).json({
    success: true,
    message: `Detail member with uuid ${uuid}`,
    results: member,
  });
};

export const createMember = async (
  req: Request<{}, {}, IMemberBody>,
  res: Response<IMemberResponse>,
): Promise<Response> => {
  const memberData = req.body;

  const requiredFields = [
    { key: "name", label: "Member name" },
    { key: "idol_group_uuid", label: "Idol group UUID" },
    { key: "jiko", label: "Member jiko" },
    { key: "birthday", label: "Member birthday" },
    { key: "generation", label: "Member generation" },
    { key: "member_status", label: "Member status" },
  ] as const;

  for (const field of requiredFields) {
    if (!memberData[field.key]) {
      throw new AppError("INVALID_INPUT", `${field.label} is required`, 400);
    }
  }

  const member = await insert(memberData);
  const uuid = member[0].uuid

  if (req.file) {
    const uploadResult = await cloudinaryUploader(req.file, "member", uuid);

    if (uploadResult.error) {
      throw new AppError("UPLOAD_FAILED", "Failed to upload image", 400);
    }
    const imageUrl = uploadResult.result?.secure_url;
    await update(uuid, { image: imageUrl });
  }

  return res.status(201).json({
    success: true,
    message: "Member created successfully",
    results: member,
  });
};

export const updateMember = async (
    req: Request<{ uuid: string }, {}, IMemberBody>,
    res: Response<IMemberResponse>,
): Promise<Response> => {
    const { uuid } = req.params;

    if (!uuid || uuid === ":uuid") {
        throw new AppError("NO_ID", "UUID must be provided", 400);
    }

    const memberData = req.body;

    if (req.file) {
    const uploadResult = await cloudinaryUploader(req.file, "member", uuid);

    if (uploadResult.error) {
      throw new AppError("UPLOAD_FAILED", "Failed to upload image", 400);
    }
    const imageUrl = uploadResult.result?.secure_url;
    memberData.image = imageUrl
  }

    const member = await update(uuid, memberData);
    if (member.length === 0) {
        throw new AppError("NO_DATA", "No Data Found", 404);
    }
    return res.status(200).json({
        success: true,
        message: `Member with uuid ${uuid} updated successfully`,
        results: member,
    });
};

export const deleteMember = async (
    req: Request<{ uuid: string }>,
    res: Response<IMemberResponse>,
): Promise<Response> => {
    const { uuid } = req.params;

    if (!uuid || uuid === ":uuid") {
        throw new AppError("NO_ID", "UUID must be provided", 400);
    }

    const member = await remove(uuid);
    if (member.length === 0) {
        throw new AppError("NO_DATA", "No Data Found", 404);
    }
    return res.status(200).json({
        success: true,
        message: `Member with uuid ${uuid} deleted successfully`,
    });
};


export const deactivateMember = async (
    req: Request<{ uuid: string }>,
    res: Response<IMemberResponse>,
): Promise<Response> => {
    const { uuid } = req.params;
    if (!uuid || uuid === ":uuid") {
        throw new AppError("NO_ID", "UUID must be provided", 400);
    }

    const result = await setActiveStatus (uuid, false);
    if (result.length < 1) {
        throw new AppError("NOT_FOUND", "Member not found", 404);
    }

    return res.status(200).json({
        success: true,
        message: "Member deactivated",
        results: result,
    });
}

export const restoreMember = async (
    req: Request<{ uuid: string }>,
    res: Response<IMemberResponse>,
): Promise<Response> => {
    const { uuid } = req.params;
    if (!uuid || uuid === ":uuid") {
        throw new AppError("NO_ID", "UUID must be provided", 400);
    }

    const result = await setActiveStatus (uuid, true);
    if (result.length < 1) {
        throw new AppError("NOT_FOUND", "Member not found", 404);
    }

    return res.status(200).json({
        success: true,
        message: "Member restored",
        results: result,
    });
}