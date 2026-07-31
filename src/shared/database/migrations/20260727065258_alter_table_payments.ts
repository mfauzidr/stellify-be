import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("payments", (table) => {
    table.string("provider_order_id", 255).notNullable();

    table.index(
      ["provider_order_id"],
      "payments_provider_order_id_index"
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("payments", (table) => {
    table.dropIndex(
      ["provider_order_id"],
      "payments_provider_order_id_index"
    );

    table.dropColumn("provider_order_id");
  });
}