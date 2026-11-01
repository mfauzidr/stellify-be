import { QueryResult } from "pg";
import db from "src/shared/config/pg";
import {
  IDashboardCheckInOverview,
  IDashboardEvent,
  IDashboardOrderPhaseOverview,
  IDashboardPaymentOverview,
  IDashboardSummary,
} from "./dashboard.model";

export const findSummary = async (): Promise<IDashboardSummary> => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM orders) AS total_orders,

      (
        SELECT COALESCE(SUM(p.gross_amount), 0)
        FROM payments p
        WHERE p.status = 'paid'
      ) AS total_revenue,

      (
        SELECT COUNT(DISTINCT o.uuid)
        FROM orders o
        INNER JOIN payments p
          ON p.order_uuid = o.uuid
        WHERE p.status = 'paid'
      ) AS paid_orders,

      (
        SELECT COUNT(*)
        FROM events e
        WHERE e.is_active = true
          AND e.status = 'published'
          AND e.event_date >= CURRENT_DATE
      ) AS upcoming_events;
  `;

  const result: QueryResult<IDashboardSummary> = await db.query(query);

  const row = result.rows[0];
  return {
    total_orders: Number(row.total_orders),
    total_revenue: Number(row.total_revenue),
    paid_orders: Number(row.paid_orders),
    upcoming_events: Number(row.upcoming_events),
  };
};

export const findPaymentOverview =
  async (): Promise<IDashboardPaymentOverview> => {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'paid') AS paid,
        COUNT(*) FILTER (WHERE status = 'expired') AS expired,
        COUNT(*) FILTER (WHERE status = 'failed') AS failed,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled
      FROM payments
    `;

    const result: QueryResult<IDashboardPaymentOverview> =
      await db.query(query);

    const row = result.rows[0];
    return {
      pending: Number(row.pending),
      paid: Number(row.paid),
      expired: Number(row.expired),
      failed: Number(row.failed),
      cancelled: Number(row.cancelled),
    };
  };

export const findCheckInOverview =
  async (): Promise<IDashboardCheckInOverview> => {
    const query = `
      SELECT
        COUNT(DISTINCT o.uuid) FILTER (
            WHERE o.checked_in_at IS NOT NULL
        ) AS checked_in,
        COUNT(DISTINCT o.uuid) FILTER (
            WHERE o.checked_in_at IS NULL
        ) AS not_checked_in
    FROM orders o
    INNER JOIN payments p
    ON p.order_uuid = o.uuid
    WHERE p.status = 'paid';
    `;

    const result: QueryResult<IDashboardCheckInOverview> =
      await db.query(query);

    const row = result.rows[0];
    return {
      checked_in: Number(row.checked_in),
      not_checked_in: Number(row.not_checked_in),
    };
  };

export const findOrderPhaseOverview =
  async (): Promise<IDashboardOrderPhaseOverview> => {
    const query = `
      SELECT
        COUNT(*) FILTER (
          WHERE order_phase = 'po'
        ) AS po,
        COUNT(*) FILTER (
          WHERE order_phase = 'ots'
        ) AS ots
      FROM orders;
    `;

    const result: QueryResult<IDashboardOrderPhaseOverview> =
      await db.query(query);

    const row = result.rows[0];
    return { po: Number(row.po), ots: Number(row.ots) };
  };

export const findEventOverview = async (): Promise<IDashboardEvent[]> => {
  const query = `
    SELECT
      e.uuid,
      e.title,
      e.event_date,
      CASE
        WHEN e.status = 'finished' OR e.event_date < CURRENT_DATE THEN 'ended'
        WHEN e.event_date = CURRENT_DATE THEN 'current'
        ELSE 'upcoming'
      END AS status,
      COUNT(DISTINCT o.uuid) AS order_count,
      COALESCE(SUM(p.paid_revenue), 0) AS revenue
    FROM events e
    LEFT JOIN orders o
      ON o.event_uuid = e.uuid
    LEFT JOIN (
      SELECT "order_uuid", SUM("gross_amount") AS paid_revenue
      FROM "payments"
      WHERE "status" = 'paid'
      GROUP BY "order_uuid"
    ) p ON p.order_uuid = o.uuid
    WHERE e.is_active = true
      AND e.status NOT IN ('draft', 'cancelled')
    GROUP BY e.uuid, e.title, e.event_date
    ORDER BY e.event_date ASC;
  `;

  const result: QueryResult<IDashboardEvent> =
    await db.query(query);

  return result.rows.map((event) => ({
    ...event,
    order_count: Number(event.order_count),
    revenue: Number(event.revenue),
  }));
};
