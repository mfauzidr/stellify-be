import { Request, Response } from "express";
import { IIdolGroupsBody, IIdolGroupsParams } from "./idol_groups.model";
import { IIdolGroupsResponse } from "../../shared/models/response.model";
import { findAll, findByUuid, insert } from "./idol_groups.repo";
import { AppError } from "src/shared/helper/appError";


export const getAllIdolGroups = async (req: Request, res: Response<IIdolGroupsResponse>): Promise<Response> => {
    const idolGroups = await findAll();
    if (idolGroups.length < 1) {
        throw new AppError("NO_DATA", "No Data Found", 404);
    }
    
    return res.status(200).json({
        success: true,
        message: `List all idol groups. ${idolGroups.length} data found`,
        results: idolGroups,
    });
}

export const getIdolGroupByUuid = async (req: Request<IIdolGroupsParams>, res: Response<IIdolGroupsResponse>): Promise<Response> => {
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
}

export const createIdolGroup = async (
    req: Request<{}, {}, IIdolGroupsBody>, 
    res: Response<IIdolGroupsResponse>, 
) => {
    if (!req.body.name) {
        throw new AppError("NO_NAME", "Name must be provided", 400);
    }   
    console.log("name :" , req.body.name);

    const newIdolGroup = await insert(req.body);
    return res.status(201).json({
        success: true,
        message: "Idol group created successfully",
        results: newIdolGroup,
    });
}