import dayjs from "dayjs";

import { findLastOrderNumber } from "src/modules/orders/orders.repo";

export const generateOrderNumber = async (
  prefix: "CHK" | "PROD",
): Promise<string> => {
  const today = dayjs().format("YYMMDD");

  const lastOrderNumber = await findLastOrderNumber(prefix);

  if (!lastOrderNumber) {
    return `${prefix}${today}0001`;
  }

  const lastSequence = Number(lastOrderNumber.slice(-4));

  return `${prefix}${today}${String(lastSequence + 1).padStart(4, "0")}`;
};