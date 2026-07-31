import { PoolClient, QueryResult } from "pg";
import db from "src/shared/config/pg";
import dayjs from "dayjs";
import {
  IOrderBody,
  IOrderList,
  IOrderQueryParams,
  IOrders,
} from "./orders.model";

type QueryValue = string | number | Date | null;

export const totalCount = async ({
  search = "",
  user_uuid = "",
  payment_status,
}: {
  search?: string;
  user_uuid?: string;
  payment_status?: string;
}): Promise<number> => {
  let query = `
    SELECT COUNT(*)::int as total
    FROM "orders"
  `;

  let values: (string | number)[] = [];
  let conditions: QueryValue[] = [];

  if (search) {
    conditions.push(`"order_number" ILIKE $${values.length + 1}`);
    values.push(`%${search}%`);
  }

  if (user_uuid) {
    conditions.push(`"user_uuid" = $${values.length + 1}`);
    values.push(`${user_uuid}`);
  }

  if (payment_status) {
    conditions.push(`"payment_status" = $${values.length + 1}`);
    values.push(`${payment_status}`);
  }

  if (conditions.length > 0) {
    query += `WHERE ` + conditions.join(" AND ");
  }

  const result: QueryResult<{ total: number }> = await db.query(query, values);
  return result.rows[0].total;
};

export const findAll = async ({
  search = "",
  user_uuid = "",
  payment_status,
  sort_by,
  sort_order,
  page,
  limit,
}: IOrderQueryParams): Promise<IOrderList[]> => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const offset = (pageNum - 1) * limitNum;

  let values: QueryValue[] = [];
  let conditions: string[] = [];
  let whereQuery: string = "";

  if (search) {
    conditions.push(`"o"."order_number" ILIKE $${values.length + 1}`);
    values.push(`%${search}%`);
  }

  if (user_uuid) {
    conditions.push(`"o"."user_uuid" = $${values.length + 1}`);
    values.push(`${user_uuid}`);
  }

  if (payment_status) {
    conditions.push(`"p"."status" = $${values.length + 1}`);
    values.push(`${payment_status}`);
  }

  if (conditions.length > 0) {
    whereQuery = `WHERE ` + conditions.join(" AND ");
  }

  let orderByClause = 'ORDER BY "o"."created_at" DESC';

  const sortableColumns = {
    created_at: `"o"."created_at"`,
    order_number: `"o"."order_number"`,
    total_amount: `"o"."total_amount"`,
  };

  const sortColumn =
    sortableColumns[sort_by as keyof typeof sortableColumns] ??
    `"o"."created_at"`;

  const order = sort_order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

  orderByClause = `ORDER BY ${sortColumn} ${order}`;

  const query: string = `
    SELECT
      "o"."uuid",
      "o"."order_number",
      "p"."order_type",
      "o"."order_phase",
      "o"."payment_method",
      "p"."status" as "payment_status",
      COALESCE("oi"."total_items", 0) AS "total_items",
      "o"."total_amount"::int,
      "o"."customer_name",
      "e"."uuid" AS "event_uuid",
      "e"."title" AS "event_title",
      "e"."event_date",
      "e"."banner" AS "event_banner",
      "o"."notes",
      "p"."expired_at",
      "o"."created_at"
    FROM "orders" "o"
    LEFT JOIN "payments" "p" ON "p"."order_uuid" = "o"."uuid"
    LEFT JOIN "events" "e" ON "e"."uuid" = "o"."event_uuid"  
    LEFT JOIN (
      SELECT
        "order_uuid",
        COUNT(*)::int AS "total_items"
      FROM "order_items"
      GROUP BY "order_uuid"
    ) "oi" ON "oi"."order_uuid" = "o"."uuid"
    ${whereQuery}
    ${orderByClause}
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  values.push(limitNum);
  values.push(offset);


  const result: QueryResult<IOrderList> = await db.query(query, values);
  return result.rows;
};

export const findDetails = async (uuid: string): Promise<IOrders[]> => {
  const query: string = `
    SELECT * FROM "orders"
    WHERE "uuid" = $1
    `;

  const values: QueryValue[] = [uuid];
  const result: QueryResult<IOrders> = await db.query(query, values);
  return result.rows;
};

export const findLastOrderNumber = async (
  prefix: string,
): Promise<string | null> => {
  const today = dayjs().format("YYMMDD");

  const result = await db.query<Pick<IOrders, "order_number">>(
    `
      SELECT order_number
      FROM orders
      WHERE order_number LIKE $1
      ORDER BY order_number DESC
      LIMIT 1
    `,
    [`${prefix}${today}%`],
  );

  return result.rows[0]?.order_number ?? null;
};

export const insert = async (
  data: IOrderBody,
  client?: PoolClient,
): Promise<IOrders[]> => {
  const executor = client ?? db;
  const columns: string[] = [];
  const values: QueryValue[] = [];

  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}"`);
  }

  const insertedValues = values.map((_, index) => `$${index + 1}`).join(", ");

  const query = `
    INSERT INTO "orders"
    (${columns.join(", ")})
    VALUES
    (${insertedValues})
    RETURNING *
  `;

  const result: QueryResult<IOrders> = await executor.query(query, values);
  return result.rows;
};

// export const update = async (
//   uuid: string,
//   status: PaymentStatus,
// ): Promise<IOrders[]> => {
//   const query = `
//     UPDATE orders
//     SET
//       payment_status = $1,
//       updated_at = NOW()
//     WHERE uuid = $2
//     RETURNING *;
//   `;

//   const result: QueryResult<IOrders> = await db.query(query, [status, uuid]);

//   return result.rows;
// };
