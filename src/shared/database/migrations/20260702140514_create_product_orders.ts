import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {

  await knex.schema.createTable("product_orders", (table) => {
    table.bigIncrements("id").primary();

    table
      .uuid("uuid")
      .notNullable()
      .unique()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table.string("order_number", 50).notNullable().unique();

    table
      .uuid("user_uuid")
      .notNullable()
      .references("uuid")
      .inTable("users")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    table
      .uuid("event_uuid")
      .notNullable()
      .references("uuid")
      .inTable("events")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table.decimal("total_price", 12, 2).notNullable();

    table
      .enu(
        "status",
        ["pending", "paid", "completed", "cancelled", "expired"],
        {
          useNative: true,
          enumName: "product_order_status",
        }
      )
      .notNullable()
      .defaultTo("pending");

    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());

    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());

    table.index(["user_uuid"]);
    table.index(["event_uuid"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("product_orders");

  await knex.raw(`
    DROP TYPE IF EXISTS product_order_status;
  `);
}