import { QueryResult } from "pg"
import db from "../../shared/config/pg"
import { IIdolGroups, IIdolGroupsBody } from "./idol_groups.model";

type QueryValue = string | number | Date | null;

export const findAll = async (): Promise<IIdolGroups[]> => {
    const query = `SELECT * FROM "idol_groups"`;
    const result: QueryResult<IIdolGroups> = await db.query(query);
    return result.rows;
}

export const findByUuid = async (uuid: string): Promise<IIdolGroups[]> => {
    const query = `SELECT * FROM "idol_groups" WHERE uuid = $1`;
    const result: QueryResult<IIdolGroups> = await db.query(query, [uuid]);
    return result.rows;
}

export const insert = async (data: IIdolGroupsBody): Promise<IIdolGroups[]> => {
    const columns: QueryValue[] = [];
    const values: QueryValue[] = [];
    for (const [key, value] of Object.entries(data)) {
        values.push(value);
        columns.push(`"${key}"`);
    }

    const insertedValues = values
        .map((_, index) => `$${index + 1}`)
        .join(", ");

    const query = `
        INSERT INTO "idol_groups"
        (${columns.join(", ")})
        VALUES
        (${insertedValues})
        RETURNING *
    `;

    const result: QueryResult<IIdolGroups> = await db.query(query, values);
    return result.rows;
}  

    