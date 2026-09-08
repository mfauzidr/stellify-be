import { PoolClient, QueryResult } from "pg";
import db from "../../shared/config/pg";
import { IEvents, IEventsBody } from "./events.model";

type QueryValue = string | number | Date | boolean | string[] | null;

export const findAll = async (): Promise<IEvents[]> => {
  const query = `
    SELECT 
      "e".*,
      COALESCE(
        json_agg("m"."name" ORDER BY "m"."name") FILTER (WHERE "m"."uuid" IS NOT NULL),
        '[]'::json
      ) AS "member_lineups"
    FROM "events" "e"
    LEFT JOIN "event_members" "em" ON "e"."uuid" = "em"."event_uuid"
    LEFT JOIN "members" "m" ON "em"."member_uuid" = "m"."uuid"
    WHERE "e"."is_active" = true
    GROUP BY "e"."id"
    ORDER BY "e"."event_date" ASC, "e"."id" ASC
  `;
  const result: QueryResult<IEvents> = await db.query(query);
  return result.rows;
};

export const findByUuid = async (
  uuid: string,
  executor: PoolClient,
  includeInactive = true,
): Promise<IEvents[]> => {
  const query = `
    SELECT 
      "e".*,
      COALESCE(
        json_agg("m"."name" ORDER BY "m"."name") FILTER (WHERE "m"."uuid" IS NOT NULL),
        '[]'::json
      ) AS "member_lineups"
    FROM "events" "e"
    LEFT JOIN "event_members" "em"
      ON "e"."uuid" = "em"."event_uuid"
    LEFT JOIN "members" "m"
      ON "em"."member_uuid" = "m"."uuid"
    WHERE "e"."uuid" = $1
      AND ($2 = true OR "e"."is_active" = true)
    GROUP BY "e"."id"
  `;

  const result: QueryResult<IEvents> = await executor.query(query, [
    uuid,
    includeInactive,
  ]);

  return result.rows;
};

export const insert = async (
  data: IEventsBody,
  executor: PoolClient,
): Promise<IEvents[]> => {
  const { ...eventData } = data;

  const columns: QueryValue[] = [];
  const values: QueryValue[] = [];

  for (const [key, value] of Object.entries(eventData)) {
    values.push(value);
    columns.push(`"${key}"`);
  }

  const insertedValues = values.map((_, index) => `$${index + 1}`).join(", ");

    const query = `
      INSERT INTO "events"
      (${columns.join(", ")})
      VALUES
      (${insertedValues})
      RETURNING *
    `;

    const result: QueryResult<IEvents> = await executor.query(query, values);

    return result.rows;
};

export const update = async (
  uuid: string,
  data: Partial<IEventsBody>,
  executor: PoolClient,
): Promise<IEvents[]> => {
  const columns: QueryValue[] = [];
  const values: QueryValue[] = [uuid];

  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}" = $${values.length}`);
  }

  if (columns.length === 0) {
    return [];
  }

  const query = `
    UPDATE "events"
    SET
      ${columns.join(", ")},
      "updated_at" = NOW()
    WHERE "uuid" = $1
    RETURNING *;
  `;

  const result: QueryResult<IEvents> = await executor.query(query, values);

  return result.rows;
};

export const remove = async (uuid: string): Promise<IEvents[]> => {
  const query = `
        UPDATE "events"
        SET "is_active" = false,
            "deleted_at" = NOW(),
            "updated_at" = NOW()
        WHERE "uuid" = $1
        RETURNING *
    `;
  const result: QueryResult<IEvents> = await db.query(query, [uuid]);
  return result.rows;
};

export const setActiveStatus = async (
  uuid: string,
  status: boolean,
): Promise<IEvents[]> => {
  let deleteClause = status ? ", deleted_at = NULL" : ", deleted_at = NOW()";

  const query = `
    UPDATE "events"
    SET "is_active" = $2 ${deleteClause}, "updated_at" = NOW()
    WHERE uuid = $1
    RETURNING *
`;

  const result: QueryResult<IEvents> = await db.query(query, [uuid, status]);
  return result.rows;
};
