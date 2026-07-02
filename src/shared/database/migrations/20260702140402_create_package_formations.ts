import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE cheki_package_status AS ENUM (
      'active',
      'inactive'
    );
  `);

  await knex.schema.createTable("cheki_packages", (table) => {
    table.bigIncrements("id").primary();

    table
      .uuid("uuid")
      .notNullable()
      .unique()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("event_uuid")
      .notNullable()
      .references("uuid")
      .inTable("events")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    table.string("title", 150).notNullable();

    table.text("image");

    table.decimal("price_single", 12, 2).notNullable();
    table.decimal("price_group", 12, 2).notNullable();

    table.boolean("allow_single").notNullable().defaultTo(true);
    table.boolean("allow_group").notNullable().defaultTo(true);

    table
      .enu("status", ["active", "inactive"], {
        useNative: true,
        enumName: "cheki_package_status",
      })
      .notNullable()
      .defaultTo("active");

    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());

    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());

    table.index(["event_uuid"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("cheki_packages");

  await knex.raw(`
    DROP TYPE IF EXISTS cheki_package_status;
  `);
}
