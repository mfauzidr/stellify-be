type PaymentProvider = "manual" | "midtrans";

export type PaymentOrderType = "cheki" | "product";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "expired"
  | "failed"
  | "cancelled";

export interface IMidtransPaymentFields {
  transaction_id?: string;
  snap_token?: string;
  fraud_status?: string;
  expired_at?: Date;
  paid_at?: Date;
  raw_response?: Record<string, unknown>;
}

export interface IPaymentBody extends IMidtransPaymentFields {
  order_type: PaymentOrderType;
  order_uuid: string;
  provider: PaymentProvider;
  provider_order_id: string;
  gross_amount: number;
  status?: PaymentStatus;
}

export interface IPayment extends IPaymentBody {
  id: number;
  uuid: string;
  status: PaymentStatus;
  created_at: Date;
  updated_at: Date;
}

export interface IPaymentParams {
  uuid: string;
}

export interface IPaymentQueryParams {
  search?: string;
  provider?: PaymentProvider;
  order_type?: PaymentOrderType;
  status?: PaymentStatus;
  page?: string;
  limit?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface IUpdateCashPaymentBody {
  status: Extract<PaymentStatus, "paid" | "cancelled">;
}

export interface IUpdateMidtransPaymentBody extends IMidtransPaymentFields {
  status: PaymentStatus;
}
