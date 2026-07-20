import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE events
        ALTER COLUMN event_date
        TYPE TIMESTAMPTZ
        USING event_date::timestamptz;
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE events
        ALTER COLUMN event_date
        TYPE DATE
        USING event_date::date;
    `);
}