export type MidtransTransactionStatus =
  | "capture"
  | "settlement"
  | "pending"
  | "deny"
  | "cancel"
  | "expire"
  | "failure";

  export type MidtransFraudStatus =
  | "accept"
  | "challenge"
  | "deny";

export interface IMidtransNotification {
  transaction_time: string;
  transaction_status: MidtransTransactionStatus;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: MidtransFraudStatus;
}

export interface ISnapTransaction {
  token: string;
  redirect_url: string;
}

export interface ICreateSnapTransactionBody {
  order_number: string;
  gross_amount: number;

  customer: {
    first_name: string;
    email: string;
    phone: string;
  };
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
}

export interface IMidtransNotificationBody {
  order_id: string;
  transaction_id: string;
  transaction_status: MidtransTransactionStatus;
  status_code: string;
  status_message?: string;
  gross_amount: string;
  currency?: string;
  payment_type: string;
  transaction_time: string;
  signature_key: string;
  fraud_status?: MidtransFraudStatus;
  merchant_id?: string;
}
