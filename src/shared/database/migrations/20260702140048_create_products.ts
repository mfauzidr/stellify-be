import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("products", (table) => {
    table.bigIncrements("id").primary();

    table
      .uuid("uuid")
      .notNullable()
      .unique()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("member_uuid")
      .nullable()
      .references("uuid")
      .inTable("members")
      .onUpdate("CASCADE")
      .onDelete("SET NULL");

    table.string("name", 150).notNullable();

    table.text("image");

    table.decimal("price", 12, 2).notNullable();

    table.integer("stock").notNullable().defaultTo(0);

    table.boolean("is_active").notNullable().defaultTo(true);

    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index(["member_uuid"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("products");
}