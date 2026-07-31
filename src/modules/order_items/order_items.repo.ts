import { PoolClient } from "pg";

import { IOrderItems, IOrderItemsBody } from "./order_items.model";

type QueryValue = string | number | Date | null;

export const insert = async (
  data: IOrderItemsBody,
  client: PoolClient,
): Promise<IOrderItems[]> => {
  const columns: string[] = [];
  const values: QueryValue[] = [];

  for (const [key, value] of Object.entries(data)) {
    columns.push(`"${key}"`);
    values.push(value);
  }

  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

  const query = `
          INSERT INTO "order_items"
          (${columns.join(", ")})
          VALUES
          (${placeholders})
          RETURNING *
      `;

  const orderItems = await client.query(query, values);

  return orderItems.rows
};