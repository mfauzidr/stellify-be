import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE formation_type AS ENUM (
      'single',
      'group'
    );
  `);

  await knex.schema.createTable("order_items", (table) => {
    table.bigIncrements("id").primary();

    table
      .uuid("uuid")
      .notNullable()
      .unique()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("order_uuid")
      .notNullable()
      .references("uuid")
      .inTable("orders")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    table
      .uuid("package_uuid")
      .notNullable()
      .references("uuid")
      .inTable("cheki_packages")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    table
      .enu("formation_type", ["single", "group"], {
        useNative: true,
        enumName: "formation_type",
      })
      .notNullable();

    table.integer("qty").notNullable().defaultTo(1);

    table.decimal("price", 12, 2).notNullable();

    table.decimal("subtotal", 12, 2).notNullable();

    table.index(["order_uuid"]);
    table.index(["package_uuid"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("order_items");

  await knex.raw(`
    DROP TYPE IF EXISTS formation_type;
  `);
}