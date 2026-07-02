import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("members", (table) => {
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

    table.string("name", 100).notNullable();

    table.string("jiko", 100).notNullable();

    table.date("birthday");

    table.text("image");

    table
      .enu("member_status", ["core", "trainee", "graduated"], {
        useNative: true,
        enumName: "member_status",
      })
      .notNullable()
      .defaultTo("core");

    table.integer("generation").notNullable().defaultTo(1);

    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index(["idol_group_uuid"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("members");

  await knex.raw(`
    DROP TYPE IF EXISTS member_status;
  `);
}