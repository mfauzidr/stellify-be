import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    DO $$
    BEGIN
      CREATE TYPE payment_method AS ENUM (
        'midtrans',
        'cash',
        'bank_transfer'
      );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END
    $$;
  `);

  await knex.schema.alterTable("orders", (table) => {
    table
      .specificType("payment_method", "payment_method")
      .notNullable()
      .defaultTo("midtrans");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("orders", (table) => {
    table.dropColumn("payment_method");
  });

  await knex.raw(`
    DROP TYPE IF EXISTS payment_method;
  `);
}