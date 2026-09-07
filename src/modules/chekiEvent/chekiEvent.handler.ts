import { Request, Response } from "express";
import { IChekiEventBody, IUpdateChekiEventBody } from "./chekiEvent.model";
import {
  createChekiEventService,
  findChekiEvent,
  updateChekiEventService,
} from "./chekiEvent.services";

export const getChekiEvent = async (
  req: Request<{ uuid: string }>,
  res: Response,
) => {
  try {
    const { uuid } = req.params;

    const result = await findChekiEvent(uuid);

    res.status(200).json({
      success: true,
      message: "Get cheki event successfully",
      results: result,
    });
  } catch (error) {
    throw error;
  }
};

export const createChekiEvent = async (
  req: Request<{}, {}, IChekiEventBody>,
  res: Response,
) => {
  try {
    const body: IChekiEventBody = req.body;

    const result = await createChekiEventService(body);

    res.status(201).json({
      success: true,
      message: "Create cheki event successfully",
      results: result,
    });
  } catch (error) {
    throw error;
  }
};

export const updateChekiEvent = async (
  req: Request<{ uuid: string }, {}, IUpdateChekiEventBody>,
  res: Response,
) => {
  try {
    const { uuid } = req.params;
    const body: IUpdateChekiEventBody = req.body;

    const result = await updateChekiEventService(uuid, body);

    res.status(200).json({
      success: true,
      message: "Update cheki event successfully",
      results: result,
    });
  } catch (error) {
    throw error;
  }
};
