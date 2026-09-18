export interface IDashboardSummary {
  total_orders: number;
  total_revenue: number;
  paid_orders: number;
  upcoming_events: number;
}

export interface IDashboardPaymentOverview {
  pending: number;
  paid: number;
  expired: number;
  failed: number;
  cancelled: number;
}

export interface IDashboardCheckInOverview {
  checked_in: number;
  not_checked_in: number;
}

export interface IDashboardOrderPhaseOverview {
  po: number;
  ots: number;
}

export type DashboardEventStatus =
  | "ended"
  | "current"
  | "upcoming";

export interface IDashboardEvent {
  uuid: string;
  title: string;
  event_date: Date;
  status: DashboardEventStatus;
  order_count: number;
  revenue: number;
}

export interface IDashboardEventOverview {
  ended: IDashboardEvent[];
  current: IDashboardEvent[];
  upcoming: IDashboardEvent[];
}