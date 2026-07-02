import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("order_item_members", (table) => {
    table.bigIncrements("id").primary();

    table
      .uuid("order_item_uuid")
      .notNullable()
      .references("uuid")
      .inTable("order_items")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    table
      .uuid("member_uuid")
      .notNullable()
      .references("uuid")
      .inTable("members")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    table.unique(["order_item_uuid", "member_uuid"]);

    table.index(["order_item_uuid"]);
    table.index(["member_uuid"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("order_item_members");
}