import { PoolClient, QueryResult } from "pg";
import db from "src/shared/config/pg";
import { IPayment, IPaymentBody } from "./payments.model";
import { IMidtransNotificationBody } from "./midtrans/midtrans.model";

type QueryValue =
  | string
  | number
  | boolean
  | Date
  | IMidtransNotificationBody
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

export const findByProviderOrderId = async (providerId: string): Promise<IPayment[]> => {
  const query: string = `
    SELECT * FROM "payments"
    WHERE "provider_order_id" = $1
    `;

  const values: QueryValue[] = [providerId];
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
    RETURNING 
      "uuid",
      "order_uuid",
      "order_type",
      "provider",
      "transaction_id",
      "snap_token",
      "redirect_url",
      "gross_amount"::int,
      "status",
      "fraud_status",
      "paid_at",
      "expired_at",
      "created_at"
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
    RETURNING 
      "uuid",
      "order_uuid",
      "order_type",
      "provider",
      "transaction_id",
      "snap_token",
      "redirect_url",
      "gross_amount"::int,
      "status",
      "fraud_status",
      "paid_at",
      "expired_at",
      "created_at",
      "updated_at"
  `;

  const result: QueryResult<IPayment> = await executor.query(query, values);
  return result.rows;
};
