import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("cheki_packages", (table) => {
    table.renameColumn("price_single", "po_price_single");
    table.renameColumn("price_group", "po_price_group");

    table
      .decimal("ots_price_single", 12, 2)
      .notNullable();

    table
      .decimal("ots_price_group", 12, 2)
      .notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("cheki_packages", (table) => {
    table.dropColumn("ots_price_single");
    table.dropColumn("ots_price_group");

    table.renameColumn("po_price_single", "price_single");
    table.renameColumn("po_price_group", "price_group");
  });
}