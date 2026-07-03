import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("members").del();

  const groups = await knex("idol_groups")
    .select("uuid", "name")
    .orderBy("id");

  const stellify = groups.find(
    (group) => group.name === "Stellify Team"
  );

  const trainee = groups.find(
    (group) => group.name === "Stellify Generation Zero"
  );

  await knex("members").insert([
    {
      idol_group_uuid: stellify?.uuid,
      name: "Auuryza",
      jiko: "Dari A sampai Z, yang kamu cari ada di sini~! Haloo namaku Auuryza! Panggil aku Auuuu~",
      birthday: "2001-03-23",
      image: "https://placehold.co/600x800",
      member_status: "core",
    },
    {
      idol_group_uuid: trainee?.uuid,
      name: "Raven",
      jiko: "Dari A sampai Z, yang kamu cari ada di sini~! Haloo namaku Raven!",
      birthday: "2001-03-23",
      image: "https://placehold.co/600x800",
      member_status: "trainee",
    },
  ]);
}