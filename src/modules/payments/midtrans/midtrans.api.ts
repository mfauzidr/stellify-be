import { AppError } from "../../../shared/helper/appError";
import { IMidtransNotificationBody, MidtransFraudStatus } from "./midtrans.model";
import { MidtransTransactionStatus } from "./midtrans.model";

const getBaseUrl = () =>
  process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";

const getAuthorization = () =>
  `Basic ${Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString(
    "base64",
  )}`;

const requestMidtrans = async <T>(
  endpoint: string,
  method: "GET" | "POST",
  body?: unknown,
): Promise<T> => {
  const response = await fetch(`${getBaseUrl()}${endpoint}`, {
    method,
    headers: {
      Authorization: getAuthorization(),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json();

  if (!response.ok) {
    throw {
      name: "MidtransApiError",
      statusCode: response.status,
      response: result,
    };
  }

  return result as T;
};

export const getTransactionStatus = (
  orderId: string,
): Promise<IMidtransNotificationBody> =>
  requestMidtrans(`/v2/${orderId}/status`, "GET");

export const cancelTransaction = (
  orderId: string,
): Promise<IMidtransNotificationBody> =>
  requestMidtrans(`/v2/${orderId}/cancel`, "POST");

export const expireTransaction = (
  orderId: string,
): Promise<IMidtransNotificationBody> =>
  requestMidtrans(`/v2/${orderId}/expire`, "POST");
