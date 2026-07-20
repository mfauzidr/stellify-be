import { QueryResult } from "pg";
import db from "../../shared/config/pg";
import { ICheki, IChekiBody } from "./cheki.models";

type QueryValue = string | number | Date | boolean | null;

export const findAll = async (): Promise<ICheki[]> => {
  const query = `SELECT * FROM "cheki_packages" WHERE "is_active" = true`;
  const result: QueryResult<ICheki> = await db.query(query);
  return result.rows;
};

export const findByUuid = async (uuid: string): Promise<ICheki[]> => {
  const query = `SELECT * FROM "cheki_packages" WHERE uuid = $1`;
  const result: QueryResult<ICheki> = await db.query(query, [uuid]);
  return result.rows;
};

export const insert = async (data: IChekiBody): Promise<ICheki[]> => {
  const columns: QueryValue[] = [];
  const values: QueryValue[] = [];
  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}"`);
  }

  const insertedValues = values.map((_, index) => `$${index + 1}`).join(", ");

  const query = `
        INSERT INTO "cheki_packages"
        (${columns.join(", ")})
        VALUES
        (${insertedValues})
        RETURNING *
    `;

  const result: QueryResult<ICheki> = await db.query(query, values);
  return result.rows;
};

export const update = async (
  uuid: string,
  data: Partial<IChekiBody>,
): Promise<ICheki[]> => {
  const columns: QueryValue[] = [];
  const values: QueryValue[] = [uuid];
  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}" = $${values.length}`);
  }

  const query = `
        UPDATE "cheki_packages"
        SET ${columns.join(", ")},
        updated_at = now()
        WHERE uuid = $1
        RETURNING *
    `;

  const result: QueryResult<ICheki> = await db.query(query, values);
  return result.rows;
};

export const remove = async (uuid: string): Promise<ICheki[]> => {
  const query = `
        DELETE FROM "cheki_packages"
        WHERE uuid = $1
        RETURNING *
    `;
  const result: QueryResult<ICheki> = await db.query(query, [uuid]);
  return result.rows;
};

export const setActiveStatus = async (
  uuid: string,
  status: boolean,
): Promise<ICheki[]> => {
  let deleteClause = status ? ", deleted_at = NULL" : ", deleted_at = NOW()";

  const query = `
    UPDATE "cheki_packages"
    SET "is_active" = $2 ${deleteClause}
    WHERE uuid = $1
    RETURNING *
`;

  const result: QueryResult<ICheki> = await db.query(query, [uuid, status]);
  return result.rows;
};
