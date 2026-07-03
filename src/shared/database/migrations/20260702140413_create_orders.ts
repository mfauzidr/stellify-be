import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {

  await knex.schema.createTable("orders", (table) => {
    table.bigIncrements("id").primary();

    table
      .uuid("uuid")
      .notNullable()
      .unique()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table.string("order_number", 50).notNullable().unique();

    table
      .uuid("user_uuid")
      .nullable()
      .references("uuid")
      .inTable("users")
      .onUpdate("CASCADE")
      .onDelete("SET NULL");

    table.string("customer_name", 100).notNullable();

    table.string("customer_email", 255).notNullable();

    table.string("customer_phone", 20).notNullable();

    table.decimal("total_price", 12, 2).notNullable();

    table
      .enu(
        "status",
        ["pending", "paid", "completed", "cancelled", "expired"],
        {
          useNative: true,
          enumName: "order_status",
        }
      )
      .notNullable()
      .defaultTo("pending");

    table.text("notes");

    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());

    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());

    table.index(["user_uuid"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("orders");

  await knex.raw(`
    DROP TYPE IF EXISTS order_status;
  `);
}