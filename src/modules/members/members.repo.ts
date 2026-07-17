import { QueryResult } from "pg";
import db from "../../shared/config/pg";
import { IMembers, IMemberQueryParams, IMemberBody } from "./members.model";

type QueryValue = string | number | Date | null | boolean;

export const findAll = async ({
    idol_group_uuid = "",
    name = "",
    member_status = "",
    generation,
}: IMemberQueryParams): Promise<IMembers[]> => {
    let values: QueryValue[] = [];
    let conditions: string[] = [];
    let whereQuery: string = "";

    if (idol_group_uuid) {
        conditions.push(`"m"."idol_group_uuid" = $${values.length + 1}`);
        values.push(idol_group_uuid);
    }

    if (name) {
        conditions.push(`"m"."name" ILIKE $${values.length + 1}`);
        values.push(`%${name}%`);
    }

    if (member_status) {
        conditions.push(`"m"."member_status" ILIKE $${values.length + 1}`);
        values.push(`%${member_status}%`);
    }

    if (generation) {
        conditions.push(`"m"."generation" = $${values.length + 1}`);
        values.push(generation);
    }

    if (conditions.length > 0) {
        whereQuery = `WHERE ` + conditions.join(" AND ");
    }

    const query = `
        SELECT
            "m"."id",
            "m"."uuid",
            "ig"."name" AS "idol_group",
            "m"."name",
            "m"."jiko",
            "m"."birthday",
            "m"."image",
            "m"."generation",
            "m"."member_status",
            "m"."created_at",
            "m"."updated_at"
        FROM "members" AS "m"
        LEFT JOIN "idol_groups" AS "ig" ON "m"."idol_group_uuid" = "ig"."uuid"
        ${whereQuery}
        ORDER BY "m"."id" ASC
    `;
    const result: QueryResult<IMembers> = await db.query(query, values);
    return result.rows;
};

export const findDetails = async (uuid: string): Promise<IMembers[]> => {
    const query = `
        SELECT
            "m"."id",
            "m"."uuid",
            "ig"."name" AS "idol_group",
            "m"."name",
            "m"."jiko",
            "m"."birthday",
            "m"."image",
            "m"."generation",
            "m"."member_status",
            "m"."created_at",
            "m"."updated_at"
        FROM "members" AS "m"
        LEFT JOIN "idol_groups" AS "ig" ON "m"."idol_group_uuid" = "ig"."uuid"
        WHERE "m"."uuid" = $1
    `;
    const values: QueryValue[] = [uuid];
    const result: QueryResult<IMembers> = await db.query(query, values);
    return result.rows;
};


export const insert = async (data: IMemberBody): Promise<IMembers[]> => {
    const columns: QueryValue[] = [];
    const values: QueryValue[] = [];
    for (const [key, value] of Object.entries(data)) {
        values.push(value);
        columns.push(`"${key}"`);
    }

    const insertedValues: string = values
        .map((_, index) => `$${index + 1}`)
        .join(", ");

    const query = `
        INSERT INTO "members" (${columns.join(", ")})
        VALUES (${insertedValues})
        RETURNING *
    `;

    const result: QueryResult<IMembers> = await db.query(query, values);
    return result.rows;
};

export const update = async (uuid: string, data: Partial<IMemberBody>): Promise<IMembers[]> => {
    const columns: QueryValue[] = [];
    const values: QueryValue[] = [uuid];
    for (const [key, value] of Object.entries(data)) {
        values.push(value);
        columns.push(`"${key}" = $${values.length}`);
    }
    const query = `
        UPDATE "members"
        SET ${columns.join(", ")},
        updated_at = NOW()
        WHERE "uuid" = $1
        RETURNING *
    `;
    const result: QueryResult<IMembers> = await db.query(query, values);
    return result.rows;
}

export const remove = async (uuid: string): Promise<IMembers[]> => {
    const query = `
        DELETE FROM "members"
        WHERE "uuid" = $1
        RETURNING *
    `;
    const values: QueryValue[] = [uuid];
    const result: QueryResult<IMembers> = await db.query(query, values);
    return result.rows;
}

export const setActiveStatus = async (uuid: string, status: boolean): Promise<IMembers[]> => {
    const values: QueryValue[] = [uuid, status];
    const deletedAtClause = status ? ", deleted_at = NULL" : ", deleted_at = NOW()";

    const query = `
        UPDATE "members"
        SET "is_active" = $2 ${deletedAtClause}
        WHERE "uuid" = $1
        RETURNING *
    `;

    const result: QueryResult<IMembers> = await db.query(query, values);
    return result.rows;
}