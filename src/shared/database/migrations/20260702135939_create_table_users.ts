import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.bigIncrements("id").primary();

    table
      .uuid("uuid")
      .notNullable()
      .unique()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table.string("first_name", 100);
    table.string("last_name", 100);

    table.string("email", 255).notNullable().unique();

    table.text("password");

    table.string("provider", 20).notNullable().defaultTo("local");

    table.string("provider_id", 255);

    table.string("role", 20).notNullable().defaultTo("user");

    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
}