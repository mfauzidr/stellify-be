import cron from "node-cron";
import { paymentTimeoutJob } from "../jobs/paymentTimeout.job";
import { poClosingJob } from "../jobs/poClosing.job";
import { logger } from "../shared/logger/logger";

export const startScheduler = () => {
  cron.schedule(
    process.env.PAYMENT_TIMEOUT_SCHEDULER_INTERVAL || "*/5 * * * *",
    async () => {
      logger.info("[Scheduler] Running Payment Timeout Job");
      await paymentTimeoutJob();
    },
  );

  cron.schedule(
    process.env.PO_CLOSING_SCHEDULER_INTERVAL || "*/5 * * * *",
    async () => {
      logger.info("[Scheduler] Running PO Closing Job");
      await poClosingJob();
    },
  );

  logger.info("[Scheduler] Started successfully");
};