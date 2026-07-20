import { Request, Response } from "express";

import { AppError } from "src/shared/helper/appError"
import { IChekiResponse } from "src/shared/models/response.model";
import { findAll, findByUuid, insert, remove, setActiveStatus, update } from "./cheki.repo";
import { IChekiBody, IChekiParams } from "./cheki.models";

export const getAllCheki = async (req: Request, res: Response<IChekiResponse>): Promise<Response> => {
    const cheki = await findAll();
    if (cheki.length < 1) {
        throw new AppError("NO_DATA", "No Data Found", 404);
    }
    
    return res.status(200).json({
        success: true,
        message: `List all cheki packages. ${cheki.length} data found`,
        results: cheki,
    });
}

export const getChekiByUuid = async (req: Request<IChekiParams>, res: Response<IChekiResponse>): Promise<Response> => {
    const { uuid } = req.params;

    if (!uuid || uuid === ":uuid") {
        throw new AppError("NO_ID", "UUID must be provided", 400);
    }

    const cheki = await findByUuid(uuid);
    if (cheki.length < 1) {
        throw new AppError("NO_DATA", "No Data Found", 404);
    }

    return res.status(200).json({
        success: true,
        message: `Cheki package with UUID ${uuid} found`,
        results: cheki,
    });
}

export const createCheki = async (
    req: Request<{}, {}, IChekiBody>, 
    res: Response<IChekiResponse>, 
): Promise<Response> => {
    if (!req.body.title) {
        throw new AppError("NO_NAME", "Name must be provided", 400);
    }

    const newCheki = await insert(req.body);
    return res.status(201).json({
        success: true,
        message: "Cheki package created successfully",
        results: newCheki,
    });
}

export const updateCheki = async (
    req: Request<{uuid: string}, {}, IChekiBody>,
    res: Response<IChekiResponse>
): Promise<Response> => {
    const { uuid } = req.params;

    if (!uuid || uuid === ":uuid") {
        throw new AppError("NO_ID", "UUID must be provided", 400);
    }

    const data: Partial<IChekiBody> = {...req.body};

    console.log("data :", data);

    const updatedCheki = await update(uuid, data);
    return res.status(200).json({
        success: true,
        message: "Cheki package updated successfully",
        results: updatedCheki,
    });
}

export const deleteCheki = async (
    req: Request<{uuid: string}>,
    res: Response<IChekiResponse>
): Promise<Response> => {
    const { uuid } = req.params;
    if (!uuid || uuid === ":uuid") {
        throw new AppError("NO_ID", "UUID must be provided", 400);
    }

    const deletedCheki = await remove(uuid);
    return res.status(200).json({
        success: true,
        message: "Cheki package deleted successfully",
        results: deletedCheki,
    });
}

export const deactivateCheki = async (
    req: Request<{uuid: string}>,
    res: Response<IChekiResponse>
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
        message: "Cheki package deactivated successfully",
        results: result,
    });
}

export const restoreCheki = async (
    req: Request<{uuid: string}>,
    res: Response<IChekiResponse>
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
        message: "Cheki package restored successfully",
        results: result,
    });
}