import { Request, Response } from "express";
import { AppError } from "src/shared/helper/appError";
import { IEventsResponse } from "src/shared/models/response.model";
import {
  findAll,
  findByUuid,
  insert,
  remove,
  setActiveStatus,
  update,
} from "./events.repo";
import { IEventRequest, IEventsBody, IEventsParams } from "./events.model";
import { cloudinaryUploader } from "src/shared/helper/courdinary";
import db from "src/shared/config/pg";

const parseMemberUuids = (
  member_uuids?: string | string[],
): string[] | undefined => {
  if (!member_uuids) return undefined;

  if (Array.isArray(member_uuids)) {
    return member_uuids;
  }

  return member_uuids
    .split(",")
    .map((uuid) => uuid.trim())
    .filter(Boolean);
};

export const getAllEvents = async (
  req: Request,
  res: Response<IEventsResponse>,
): Promise<Response> => {
  const events = await findAll();
  if (events.length < 1) {
    throw new AppError("NO_DATA", "No Data Found", 404);
  }

  return res.status(200).json({
    success: true,
    message: `List all events. ${events.length} data found`,
    results: events,
  });
};

export const getEventsByUuid = async (
  req: Request<IEventsParams>,
  res: Response<IEventsResponse>,
): Promise<Response> => {

  const client = await db.connect();
  const { uuid } = req.params;

  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const events = await findByUuid(uuid, client);
  if (events.length < 1) {
    throw new AppError("NO_DATA", "No Data Found", 404);
  }

  return res.status(200).json({
    success: true,
    message: `Event with UUID ${uuid} found`,
    results: events,
  });
};

export const createEvents = async (
  req: Request<{}, {}, IEventRequest>,
  res: Response<IEventsResponse>,
): Promise<Response> => {
  const client = await db.connect();
  const body: IEventsBody = {
    ...req.body
  };

  if (!req.body.idol_group_uuid) {
    throw new AppError("NO_ID", "Event UUID must be provided", 400);
  }
  if (!req.body.title) {
    throw new AppError("NO_NAME", "Event title must be provided", 400);
  }
  if (!req.body.event_date) {
    throw new AppError("NO_DATE", "Event date must be provided", 400);
  }

  const newEvents = await insert(body, client);
  const eventsUuid = newEvents[0].uuid;

  if (req.file) {
    const uploadResult = await cloudinaryUploader(
      req.file,
      "events",
      eventsUuid,
    );

    if (uploadResult.error) {
      throw new AppError("UPLOAD_FAILED", "Failed to upload image", 400);
    }
    const imageUrl = uploadResult.result!.secure_url;
    await update(eventsUuid, { banner: imageUrl }, client);
  }

  return res.status(200).json({
    success: true,
    message: "Event created successfully",
    results: newEvents,
  });
};

export const updateEvent = async (
  req: Request<{ uuid: string }, {}, IEventRequest>,
  res: Response<IEventsResponse>,
): Promise<Response> => {
  const client = await db.connect();
  const { uuid } = req.params;

  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const data: Partial<IEventsBody> = {
    ...req.body
  };

  if (req.file) {
    const uploadResult = await cloudinaryUploader(req.file, "events", uuid);

    if (uploadResult.error) {
      throw new AppError("UPLOAD_FAILED", "Failed to upload image", 400);
    }
    const imageUrl = uploadResult.result!.secure_url;
    data.banner = imageUrl;
  }

  const updatedEvent = await update(uuid, data, client);
  return res.status(200).json({
    success: true,
    message: "Event updated successfully",
    results: updatedEvent,
  });
};

export const deleteEvent = async (
  req: Request<{ uuid: string }>,
  res: Response<IEventsResponse>,
): Promise<Response> => {
  const { uuid } = req.params;
  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const deletedEvent = await remove(uuid);
  return res.status(200).json({
    success: true,
    message: "Event deleted successfully",
    results: deletedEvent,
  });
};

export const deactivateEvent = async (
  req: Request<{ uuid: string }>,
  res: Response<IEventsResponse>,
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
    message: "Event deactivated successfully",
    results: result,
  });
};

export const restoreEvent = async (
  req: Request<{ uuid: string }>,
  res: Response<IEventsResponse>,
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
    message: "Event restored successfully",
    results: result,
  });
};
