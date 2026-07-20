import { PoolClient, QueryResult } from "pg";
import db from "../../shared/config/pg";
import { IEvents, IEventsBody } from "./events.model";

type QueryValue = string | number | Date | boolean | string[] | null;

export const findAll = async (): Promise<IEvents[]> => {
  const query = `
    SELECT 
      "e".*,
      json_agg("m"."name" ORDER BY "m"."name") AS "member_lineups"
    FROM "events" "e"
    LEFT JOIN "event_members" "em" ON "e"."uuid" = "em"."event_uuid"
    LEFT JOIN "members" "m" ON "em"."member_uuid" = "m"."uuid"
    WHERE "e"."is_active" = true
    GROUP BY "e"."id"
  `;
  const result: QueryResult<IEvents> = await db.query(query);
  return result.rows;
};

export const findByUuid = async (uuid: string): Promise<IEvents[]> => {
  const query = `
    SELECT 
      "e".*,
      json_agg("m"."name" ORDER BY "m"."name") AS "member_lineups"
    FROM "events" "e"
    LEFT JOIN "event_members" "em" ON "e"."uuid" = "em"."event_uuid"
    LEFT JOIN "members" "m" ON "em"."member_uuid" = "m"."uuid"
    WHERE "e"."uuid" = $1
    GROUP BY "e"."id"
  `;
  const result: QueryResult<IEvents> = await db.query(query, [uuid]);
  return result.rows;
};

const insertEventMembers = async (
  client: PoolClient,
  event_uuid: string,
  member_uuids: string[],
) => {
  for (const member_uuid of member_uuids) {
    await client.query(
      `
            INSERT INTO "event_members"
            ("event_uuid", "member_uuid")
            VALUES ($1, $2)
            `,
      [event_uuid, member_uuid],
    );
  }
};

export const insert = async (data: IEventsBody): Promise<IEvents[]> => {
  const { member_uuids, ...eventData } = data;

  const columns: QueryValue[] = [];
  const values: QueryValue[] = [];
  for (const [key, value] of Object.entries(eventData)) {
    values.push(value);
    columns.push(`"${key}"`);
  }

  const insertedValues = values.map((_, index) => `$${index + 1}`).join(", ");

  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const query = `
          INSERT INTO "events"
          (${columns.join(", ")})
          VALUES
          (${insertedValues})
          RETURNING 

      `;

    const result: QueryResult<IEvents> = await client.query(query, values);

    const event = result.rows[0];

    await insertEventMembers(client, event.uuid, member_uuids);

    await client.query("COMMIT");
    return result.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const update = async (
  uuid: string,
  data: Partial<IEventsBody>,
): Promise<IEvents[]> => {
  const { member_uuids, ...eventData } = data;

  const columns: QueryValue[] = [];
  const values: QueryValue[] = [uuid];

  for (const [key, value] of Object.entries(eventData)) {
    values.push(value);
    columns.push(`"${key}" = $${values.length}`);
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    let result: QueryResult<IEvents>;
    if (columns.length > 0) {
      const query = `
        UPDATE "events"
        SET
          ${columns.join(", ")},
          "updated_at" = NOW()
        WHERE "uuid" = $1
        RETURNING *
      `;

      result = await client.query(query, values);
    } else {
      result = await client.query(
        `
        SELECT *
        FROM "events"
        WHERE "uuid" = $1
        `,
        [uuid],
      );
    }

    if (member_uuids) {
      await client.query(
        `
        DELETE FROM "event_members"
        WHERE "event_uuid" = $1
        `,
        [uuid],
      );

      await insertEventMembers(client, uuid, member_uuids);
    }

    await client.query("COMMIT");

    return result.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const remove = async (uuid: string): Promise<IEvents[]> => {
  const query = `
        DELETE FROM "events"
        WHERE uuid = $1
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
    SET "is_active" = $2 ${deleteClause}
    WHERE uuid = $1
    RETURNING *
`;

  const result: QueryResult<IEvents> = await db.query(query, [uuid, status]);
  return result.rows;
};
