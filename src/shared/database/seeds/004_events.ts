import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("events").del();

  const group = await knex("idol_groups")
    .where({ name: "Stellify Team" })
    .first();

  await knex("events").insert([
    {
      idol_group_uuid: group.uuid,
      title: "Stellify Summer Mini Live",
      description:
        "Mini live performance and cheki session with all members.",
      banner: "https://placehold.co/1200x500",
      location: "Jakarta Convention Center",
      event_date: "2026-08-20",
      po_start: "2026-08-01 00:00:00",
      po_end: "2026-08-18 23:59:59",
      allow_pickups: true,
      status: "published",
    },
    {
      idol_group_uuid: group.uuid,
      title: "Stellify Birthday Festival",
      description:
        "Special birthday event with exclusive photocard pickup.",
      banner: "https://placehold.co/1200x500",
      location: "Bandung",
      event_date: "2026-10-12",
      po_start: "2026-09-20 00:00:00",
      po_end: "2026-10-10 23:59:59",
      allow_pickups: true,
      status: "draft",
    },
  ]);
}