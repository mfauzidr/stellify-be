import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    DO $$
    BEGIN
      CREATE TYPE payment_status AS ENUM (
        'pending',
        'paid',
        'expired'
      );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await knex.raw(`
    ALTER TABLE orders
    RENAME COLUMN total_price TO total_amount;
  `);

  await knex.raw(`
    ALTER TABLE orders
    ADD COLUMN payment_status payment_status
    NOT NULL DEFAULT 'pending';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE orders
    DROP COLUMN IF EXISTS payment_status;
  `);

  await knex.raw(`
    ALTER TABLE orders
    RENAME COLUMN total_amount TO total_price;
  `);

  await knex.raw(`
    DROP TYPE IF EXISTS payment_status;
  `);
}