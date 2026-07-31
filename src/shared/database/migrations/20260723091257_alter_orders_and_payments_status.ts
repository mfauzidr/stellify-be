import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("orders", (table) => {
    table.dropColumn("payment_status");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE "orders"
    ADD COLUMN "payment_status" "payment_status"
    NOT NULL DEFAULT 'pending';
  `);
}