import crypto from "crypto";
import { MidtransTransactionStatus } from "src/modules/payments/midtrans/midtrans.model";
import { PaymentStatus } from "src/modules/orders/orders.model";
import { AppError } from "src/shared/helper/appError";

interface IVerifySignatureParams {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}

export const verifySignature = ({
  order_id,
  status_code,
  gross_amount,
  signature_key,
}: IVerifySignatureParams): void => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    throw new AppError(
      "CONFIG_ERROR",
      "Midtrans server key is not configured",
      500,
    );
  }

  const generatedSignature = crypto
    .createHash("sha512")
    .update(order_id + status_code + gross_amount + serverKey)
    .digest("hex");

  if (generatedSignature !== signature_key) {
    throw new AppError(
      "INVALID_SIGNATURE",
      "Invalid Midtrans signature",
      401,
    );
  }
};

export const mapMidtransStatus = (
  status: MidtransTransactionStatus,
): PaymentStatus => {
  switch (status) {
    case "capture":
    case "settlement":
      return "paid";

    case "pending":
      return "pending";

    case "expire":
      return "expired";

    case "cancel":
      return "cancelled";

    case "deny":
      return "failed";

    default:
      throw new AppError(
        "INVALID_STATUS",
        `Unknown transaction status: ${status}`,
        400,
      );
  }
};