import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("event_members", (table) => {
        table.bigIncrements("id").primary();

        table
            .uuid("uuid")
            .notNullable()
            .defaultTo(knex.raw("gen_random_uuid()"))
            .unique();

        table
            .uuid("event_uuid")
            .notNullable()
            .references("uuid")
            .inTable("events")
            .onUpdate("CASCADE")
            .onDelete("CASCADE");

        table
            .uuid("member_uuid")
            .notNullable()
            .references("uuid")
            .inTable("members")
            .onUpdate("CASCADE")
            .onDelete("CASCADE");

        table.timestamps(true, true);

        table.unique(["event_uuid", "member_uuid"]);

        table.index("event_uuid");
        table.index("member_uuid");
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("event_members");
}