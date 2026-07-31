import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("orders", (table) => {
    table.uuid("event_uuid").nullable();

    table
      .foreign("event_uuid")
      .references("uuid")
      .inTable("events")
      .onUpdate("CASCADE")
      .onDelete("SET NULL");

    table.index(["event_uuid"], "orders_event_uuid_index");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("orders", (table) => {
    table.dropIndex(["event_uuid"], "orders_event_uuid_index");
    table.dropForeign(["event_uuid"]);
    table.dropColumn("event_uuid");
  });
}