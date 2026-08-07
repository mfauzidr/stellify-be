import { findByUuid, findPendingClosedPayment } from "src/modules/payments/payments.repo";
import {
  expirePayment,
  syncPaymentStatus,
} from "../modules/payments/midtrans/midtrans.service";
import { logger } from "../shared/logger/logger";

export const poClosingJob = async () => {
  try {
    const payments = await findPendingClosedPayment();

    if (payments.length === 0) {
      return;
    }

    logger.info(
      `[Scheduler] Processing ${payments.length} PO closing payment(s)`,
    );

    for (const payment of payments) {
      try {
        await syncPaymentStatus(payment.uuid);

        const [updatedPayment] = await findByUuid(payment.uuid);

        if (updatedPayment.status !== "pending") {
          continue;
        }

        await expirePayment(payment.uuid);
      } catch (error) {
        logger.error(error);
      }
    }
  } catch (error) {
    logger.error(error);
  }
};