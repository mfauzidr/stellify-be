export interface IMidtransError extends Error {
  name: string;
  httpStatusCode: number;
  ApiResponse?: {
    error_messages?: string[];
  };
  rawHttpClientData?: unknown;
}

export const isMidtransError = (
  error: unknown,
): error is IMidtransError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "httpStatusCode" in error &&
    "ApiResponse" in error
  );
};