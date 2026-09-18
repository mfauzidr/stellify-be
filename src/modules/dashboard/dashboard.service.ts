import {
  IDashboardCheckInOverview,
  IDashboardEvent,
  IDashboardEventOverview,
  IDashboardOrderPhaseOverview,
  IDashboardPaymentOverview,
  IDashboardSummary,
} from "./dashboard.model";
import {
  findCheckInOverview,
  findEventOverview,
  findOrderPhaseOverview,
  findPaymentOverview,
  findSummary,
} from "./dashboard.repo";

export const getSummary = async (): Promise<IDashboardSummary> => {
  return await findSummary();
};

export const getPaymentOverview =
  async (): Promise<IDashboardPaymentOverview> => {
    return await findPaymentOverview();
  };

export const getCheckInOverview =
  async (): Promise<IDashboardCheckInOverview> => {
    return await findCheckInOverview();
  };

export const getOrderPhaseOverview =
  async (): Promise<IDashboardOrderPhaseOverview> => {
    return await findOrderPhaseOverview();
  };

export const getEventOverview =
  async (): Promise<IDashboardEventOverview> => {
    const events = await findEventOverview();

    return {
      ended: events.filter((event) => event.status === "ended"),
      current: events.filter((event) => event.status === "current"),
      upcoming: events.filter((event) => event.status === "upcoming"),
    };
  };
