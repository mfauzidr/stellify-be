import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("cheki_packages").del();

  const event = await knex("events")
    .where({ title: "Stellify Summer Mini Live" })
    .first();

  await knex("cheki_packages").insert([
    {
      event_uuid: event.uuid,
      title: "Regular Cheki",
      image: "https://placehold.co/500x500",
      price_single: 30000,
      price_group: 45000,
      status: "active",
    },
  ]);
}