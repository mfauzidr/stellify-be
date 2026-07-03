import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {

  await knex.schema.createTable("events", (table) => {
    table.bigIncrements("id").primary();

    table
      .uuid("uuid")
      .notNullable()
      .unique()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("idol_group_uuid")
      .notNullable()
      .references("uuid")
      .inTable("idol_groups")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    table.string("title", 150).notNullable();

    table.text("description");

    table.text("banner");

    table.string("location", 255);

    table.date("event_date").notNullable();

    table.timestamp("po_start", { useTz: true }).notNullable();

    table.timestamp("po_end", { useTz: true }).notNullable();

    table.boolean("allow_pickups").notNullable().defaultTo(false);

    table
      .enu("status", ["draft", "published", "finished", "cancelled"], {
        useNative: true,
        enumName: "event_status",
      })
      .notNullable()
      .defaultTo("draft");

    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());

    table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());

    table.index(["idol_group_uuid"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("events");

  await knex.raw(`
    DROP TYPE IF EXISTS event_status;
  `);
}
