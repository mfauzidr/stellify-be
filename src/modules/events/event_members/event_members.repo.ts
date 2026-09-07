import { PoolClient } from "pg";

export const insertEventMembers = async (
  event_uuid: string,
  member_uuids: string[],
  client: PoolClient,
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

export const deleteEventMembers = async (
  event_uuid: string,
  client: PoolClient,
) => {
  await client.query(
    `
            DELETE FROM "event_members"
            WHERE "event_uuid" = $1 
            `,
    [event_uuid],
  );
};
