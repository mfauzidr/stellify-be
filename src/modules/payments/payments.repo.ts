import { PoolClient, QueryResult } from "pg";
import db from "src/shared/config/pg";
import { IPayment, IPaymentBody } from "./payments.model";

type QueryValue =
  | string
  | number
  | boolean
  | Date
  | Record<string, unknown>
  | null;

export const findByUuid = async (uuid: string): Promise<IPayment[]> => {
  const query: string = `
    SELECT * FROM "payments"
    WHERE "uuid" = $1
    `;

  const values: QueryValue[] = [uuid];
  const result: QueryResult<IPayment> = await db.query(query, values);
  return result.rows;
};

export const insert = async (
  data: IPaymentBody,
  client?: PoolClient,
): Promise<IPayment[]> => {
  const executor = client ?? db;
  const columns: string[] = [];
  const values: QueryValue[] = [];

  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}"`);
  }

  const insertedValues = values.map((_, index) => `$${index + 1}`).join(", ");

  const query = `
    INSERT INTO "payments"
    (${columns.join(", ")})
    VALUES
    (${insertedValues})
    RETURNING *
  `;

  const result: QueryResult<IPayment> = await executor.query(query, values);
  return result.rows;
};

export const update = async (
  uuid: string,
  data: Partial<IPaymentBody>,
  client?: PoolClient,
): Promise<IPayment[]> => {
  const executor = client ?? db;
  const columns: QueryValue[] = [];
  const values: QueryValue[] = [uuid];

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;

    values.push(value);
    columns.push(`"${key}" = $${values.length}`);
  }

  if (!columns.length) {
    throw new Error("No fields to update");
  }

  const query = `
        UPDATE "payments"
        SET ${columns.join(", ")},
        updated_at = now()
        WHERE uuid = $1
        RETURNING *
    `;

  const result: QueryResult<IPayment> = await executor.query(query, values);
  return result.rows;
};
