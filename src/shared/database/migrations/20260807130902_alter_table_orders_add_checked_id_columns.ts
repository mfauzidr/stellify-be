import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("orders", (table) => {
    table.timestamp("checked_in_at").nullable();

    table
      .uuid("checked_in_by")
      .nullable()
      .references("uuid")
      .inTable("users")
      .onDelete("SET NULL");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("orders", (table) => {
    table.dropForeign(["checked_in_by"]);
    table.dropColumn("checked_in_by");
    table.dropColumn("checked_in_at");
  });
}