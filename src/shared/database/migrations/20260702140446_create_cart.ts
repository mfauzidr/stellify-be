import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("cart", (table) => {
    table.bigIncrements("id").primary();

    table
      .uuid("user_uuid")
      .notNullable()
      .references("uuid")
      .inTable("users")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    table
      .uuid("product_uuid")
      .notNullable()
      .references("uuid")
      .inTable("products")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    table.integer("qty").notNullable().defaultTo(1);

    table.decimal("subtotal", 12, 2).notNullable();

    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());

    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());

    table.unique(["user_uuid", "product_uuid"]);

    table.index(["user_uuid"]);
    table.index(["product_uuid"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("cart");
}