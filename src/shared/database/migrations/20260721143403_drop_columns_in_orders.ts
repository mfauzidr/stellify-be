import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE orders
    DROP COLUMN IF EXISTS status;
  `);

  await knex.raw(`
    DROP TYPE IF EXISTS order_status;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DO $$
    BEGIN
      CREATE TYPE order_status AS ENUM (
        'pending',
        'paid',
        'completed',
        'cancelled'
      );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await knex.raw(`
    ALTER TABLE orders
    ADD COLUMN status order_status
    NOT NULL DEFAULT 'pending';
  `);
}