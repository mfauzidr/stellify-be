import { PoolClient } from "pg";
import { IOrderItemMemberBody } from "./order_item_members.model";

type QueryValue = string | number | Date | null;

export const insert = async (
  data: IOrderItemMemberBody,
  client: PoolClient,
): Promise<void> => {
  const columns: string[] = [];
  const values: QueryValue[] = [];

  for (const [key, value] of Object.entries(data)) {
    columns.push(`"${key}"`);
    values.push(value);
  }

  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

  const query = `
    INSERT INTO "order_item_members"
      (${columns.join(", ")})
    VALUES
      (${placeholders});
  `;

  await client.query(query, values);
};