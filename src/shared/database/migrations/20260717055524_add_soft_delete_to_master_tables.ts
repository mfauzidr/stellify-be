import { Knex } from "knex";

const tables = [
  "users",
  "idol_groups",
  "members",
  "events",
  "cheki_packages",
  "products",
];

export async function up(knex: Knex): Promise<void> {
  for (const tableName of tables) {
    const hasIsActive = await knex.schema.hasColumn(tableName, "is_active");
    const hasDeletedAt = await knex.schema.hasColumn(tableName, "deleted_at");

    await knex.schema.alterTable(tableName, (table) => {
      if (!hasIsActive) {
        table.boolean("is_active").notNullable().defaultTo(true);
      }

      if (!hasDeletedAt) {
        table.timestamp("deleted_at", { useTz: true }).nullable();
      }
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  for (const tableName of [...tables].reverse()) {
    const hasIsActive = await knex.schema.hasColumn(tableName, "is_active");
    const hasDeletedAt = await knex.schema.hasColumn(tableName, "deleted_at");

    await knex.schema.alterTable(tableName, (table) => {
      if (hasDeletedAt) {
        table.dropColumn("deleted_at");
      }

      if (hasIsActive && tableName !== "products") {
        table.dropColumn("is_active");
      }
    });
  }
}