import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("users").del();

  await knex("users").insert([
    {
      first_name: "Admin",
      last_name: "Stellify",
      email: "admin@stellify.id",
      password: "admin123",
      provider: "local",
      role: "admin",
    },
    {
      first_name: "Demo",
      last_name: "User",
      email: "user@stellify.id",
      password: "user123",
      provider: "local",
      role: "user",
    },
  ]);
}