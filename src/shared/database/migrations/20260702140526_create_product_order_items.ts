import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("product_order_items", (table) => {
    table.bigIncrements("id").primary();

    table
      .uuid("product_order_uuid")
      .notNullable()
      .references("uuid")
      .inTable("product_orders")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    table
      .uuid("product_uuid")
      .notNullable()
      .references("uuid")
      .inTable("products")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");

    table.decimal("price", 12, 2).notNullable();

    table.integer("qty").notNullable().defaultTo(1);

    table.decimal("subtotal", 12, 2).notNullable();

    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());

    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());

    table.index(["product_order_uuid"]);
    table.index(["product_uuid"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("product_order_items");
}