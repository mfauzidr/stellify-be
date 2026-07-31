import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    DO $$
    BEGIN
      CREATE TYPE order_phase AS ENUM ('po', 'ots');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END
    $$;
  `);

  await knex.schema.alterTable("orders", (table) => {
    table
      .specificType("order_phase", "order_phase")
      .notNullable()
      .defaultTo("po");

    table.index(["order_phase"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("orders", (table) => {
    table.dropIndex(["order_phase"]);
    table.dropColumn("order_phase");
  });

  await knex.raw(`
    DROP TYPE IF EXISTS order_phase;
  `);
}