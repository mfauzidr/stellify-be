import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("idol_groups").del();

  await knex("idol_groups").insert([
    {
      name: "Stellify Team",
      description:
        "Bersinar Bersama, Menjadi Bintang",
      logo: "https://placehold.co/300x300",
      banner: "https://placehold.co/1200x400",
    },
    {
      name: "Stellify Generation Zero",
      description:
        "The trainee generation preparing for their official debut.",
      logo: "https://placehold.co/300x300",
      banner: "https://placehold.co/1200x400",
    },
  ]);
}