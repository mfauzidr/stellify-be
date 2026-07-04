import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("products").del();

  const auuryza = await knex("members")
    .where({ name: "Auuryza" })
    .first();

  const raven = await knex("members")
    .where({ name: "Raven" })
    .first();

  await knex("products").insert([
    {
      member_uuid: auuryza.uuid,
      name: "Auuryza Summer Photocard",
      image: "https://placehold.co/600x600",
      price: 50000,
      stock: 100,
      is_active: true,
    },
    {
      member_uuid: raven.uuid,
      name: "Raven Debut Photocard",
      image: "https://placehold.co/600x600",
      price: 45000,
      stock: 50,
      is_active: true,
    },
  ]);
}