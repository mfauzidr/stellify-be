import dayjs from "dayjs";
import { PoolClient } from "pg";

import { findLastOrderNumber } from "src/modules/orders/orders.repo";

export const generateOrderNumber = async (
  prefix: "CHK" | "PROD",
  client?: PoolClient,
): Promise<string> => {
  const today = dayjs().format("YYMMDD");

  const lastOrderNumber = await findLastOrderNumber(prefix, client);

  if (!lastOrderNumber) {
    return `${prefix}${today}0001`;
  }

  const lastSequence = Number(lastOrderNumber.slice(prefix.length + 6));
  if (
    !Number.isSafeInteger(lastSequence) ||
    lastSequence < 0 ||
    !Number.isSafeInteger(lastSequence + 1)
  ) {
    throw new Error("Stored order number sequence is invalid");
  }

  return `${prefix}${today}${String(lastSequence + 1).padStart(4, "0")}`;
};