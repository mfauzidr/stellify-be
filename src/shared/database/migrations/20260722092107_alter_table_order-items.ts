import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE order_items
    DROP COLUMN IF EXISTS formation_type;
  `);

  await knex.raw(`
    DROP TYPE IF EXISTS formation_type;
  `);

  await knex.raw(`
    ALTER TABLE order_items
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
  `);

  await knex.raw(`
    ALTER TABLE order_items
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DO $$
    BEGIN
      CREATE TYPE formation_type AS ENUM (
        'solo',
        'duo',
        'trio',
        'group'
      );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await knex.raw(`
    ALTER TABLE order_items
    ADD COLUMN formation_type formation_type NOT NULL;
  `);

  await knex.raw(`
    ALTER TABLE order_items
    DROP COLUMN IF EXISTS created_at;
  `);

  await knex.raw(`
    ALTER TABLE order_items
    DROP COLUMN IF EXISTS updated_at;
  `);
}