import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE payment_order_type AS ENUM (
      'cheki',
      'product'
    );
  `);

  await knex.raw(`
    CREATE TYPE payment_status AS ENUM (
      'pending',
      'paid',
      'expired',
      'cancelled',
      'failed'
    );
  `);

  await knex.schema.createTable("payments", (table) => {
    table.bigIncrements("id").primary();

    table
      .uuid("uuid")
      .notNullable()
      .unique()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table
      .enu("order_type", ["cheki", "product"], {
        useNative: true,
        enumName: "payment_order_type",
      })
      .notNullable();

    table
      .uuid("order_uuid")
      .notNullable();

    table
      .string("provider", 30)
      .notNullable()
      .defaultTo("midtrans");

    table.string("transaction_id", 255);

    table.text("snap_token");

    table.string("payment_type", 50);

    table.decimal("gross_amount", 12, 2).notNullable();

    table
      .enu(
        "status",
        ["pending", "paid", "expired", "cancelled", "failed"],
        {
          useNative: true,
          enumName: "payment_status",
        }
      )
      .notNullable()
      .defaultTo("pending");

    table.string("fraud_status", 30);

    table.timestamp("expired_at", { useTz: true });

    table.timestamp("paid_at", { useTz: true });

    table.jsonb("raw_response");

    table.timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index(["order_type"]);
    table.index(["reference_uuid"]);
    table.index(["transaction_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("payments");

  await knex.raw(`
    DROP TYPE IF EXISTS payment_status;
  `);

  await knex.raw(`
    DROP TYPE IF EXISTS payment_reference_type;
  `);
}