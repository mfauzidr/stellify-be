import { QueryResult } from "pg";
import db from "src/shared/config/pg";
import { IProductQueryParams, IProducts, IProductsBody } from "./product.model";

export const totalCount = async ({
  search = "",
  member_uuid = "",
}: {
  search?: string;
  member_uuid?: string;
}): Promise<number> => {
  let query = `
    SELECT COUNT(*) as total
    FROM "products"
  `;

  let values: (string | number)[] = [];
  let conditions: QueryValue[] = [];

  if (search) {
    conditions.push(`"name" ILIKE $${values.length + 1}`);
    values.push(`%${search}%`);
  }

  if (member_uuid) {
    conditions.push(`"member_uuid" = $${values.length + 1}`);
    values.push(`${member_uuid}`);
  }

  if (conditions.length > 0) {
    query += `WHERE ` + conditions.join(" AND ");
  }

  console.log(query);

  const result: QueryResult<{ total: number }> = await db.query(query, values);
  return result.rows[0].total;
};

type QueryValue = string | number | Date | null;

export const findAll = async ({
  search = "",
  member_uuid = "",
  sortBy,
  order,
  page,
  limit,
}: IProductQueryParams): Promise<IProducts[]> => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 12;
  const offset = (pageNum - 1) * limitNum;

  let values: QueryValue[] = [];
  let conditions: string[] = [];
  let whereQuery: string = "";

  if (search) {
    conditions.push(`"p"."name" ILIKE $${values.length + 1}`);
    values.push(`%${search}%`);
  }

  if (member_uuid) {
    conditions.push(`"p"."member_uuid" = $${values.length + 1}`);
    values.push(`${member_uuid}`);
  }

  if (conditions.length > 0) {
    whereQuery = `WHERE ` + conditions.join(" AND ");
  }

  let orderByClause = 'ORDER BY "id" ASC';

  if (sortBy && order) {
    orderByClause = `ORDER BY ${sortBy} ${order}`;
  }

  const query: string = `
    SELECT
        "p"."id",
        "p"."uuid",
        "p"."name" AS "productName",
        "m"."name" AS "memberName",
        "p"."price",
        "p"."stock",
        "p"."is_active",
        "p"."created_at",
        "p"."updated_at",
        "p"."deleted_at"
    FROM "products" "p"
    LEFT JOIN "members" "m" ON "p"."member_uuid" = "m"."uuid" 
    ${whereQuery}
    ${orderByClause}
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  values.push(limitNum);
  values.push(offset);

  const result: QueryResult<IProducts> = await db.query(query, values);
  return result.rows;
};

export const findDetails = async (uuid: string): Promise<IProducts[]> => {
  const query: string = `
    SELECT
        "p"."id",
        "p"."uuid",
        "p"."name" AS "productName",
        "m"."name" AS "memberName",
        "p"."price",
        "p"."stock",
        "p"."is_active",
        "p"."created_at",
        "p"."updated_at",
        "p"."deleted_at"
    FROM "products" "p"
    LEFT JOIN "members" "m" ON "p"."member_uuid" = "m"."uuid"
    WHERE "p"."uuid" = $1
    `;

  const values: QueryValue[] = [uuid];
  const result: QueryResult<IProducts> = await db.query(query, values);
  return result.rows;
};

export const insert = async (data: IProductsBody): Promise<IProducts[]> => {
  const columns: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}"`);
  }

  const insertedValues = values.map((_, index) => `$${index + 1}`).join(", ");

  const query = `
    INSERT INTO "products"
    (${columns.join(", ")})
    VALUES
    (${insertedValues})
    RETURNING *
  `;

  const result: QueryResult<IProducts> = await db.query(query, values);
  return result.rows;
};

export const update = async (
  uuid: string,
  data: Partial<IProductsBody>
): Promise<IProducts[]> => {
  const columns: string[] = [];
  const values: any[] = [uuid];
  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}"=$${values.length}`);
  }

  const query = `
        UPDATE "products"
        SET ${columns.join(", ")},
        "updated_at" = now()
        WHERE "uuid" = $1
        RETURNING *
    `;

  const result: QueryResult<IProducts> = await db.query(query, values);
  return result.rows;
};

export const deleteProduct = async (uuid: string): Promise<IProducts[]> => {
  const query = `
        DELETE FROM "products"
        WHERE "uuid" = $1
        RETURNING *
    `;

  const values = [uuid];
  const result = await db.query<IProducts>(query, values);
  return result.rows;
};

export const setActiveProducts = async (uuid: string, isActive: boolean): Promise<IProducts[]> => {
  const values = [uuid, isActive];
  let deletedAtClause = "";

  if (isActive === true) {
    deletedAtClause = "null";
  } else if (isActive === false) {
    deletedAtClause = "now()";
  }

  const query = `
        UPDATE "products" 
        SET "is_active" = $2,
        "deleted_at" = ${deletedAtClause}
        WHERE "uuid" = $1 
        RETURNING *`;

  const result: QueryResult<IProducts> = await db.query(query, values);
  return result.rows;
};