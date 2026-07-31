export type PaymentStatus = "pending" | "paid" | "expired";
export type PaymentMethods = "midtrans" | "cash" | "bank_transfer";
export type UpdatePaymentStatus = Exclude<PaymentStatus, "pending">;

export interface IOrderBody {
  order_number: string;
  user_uuid?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method: PaymentMethods;
  total_amount: number;
  notes?: string;
  event_uuid?: string;
  order_phase?: string
}

export interface IOrders extends IOrderBody {
  id: number;
  uuid: string;
  order_number: string;
  created_at: Date;
  updated_at: Date;
}

export interface IOrderParams {
  uuid: string;
}

export interface IOrderQueryParams {
  search?: string;
  page?: string;
  limit?: string;
  payment_status?: PaymentStatus;
  user_uuid?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface ICreateOrderBody {
  user_uuid?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method: PaymentMethods;
  items: ICreateOrderItemBody[];
  notes?: string
}

export interface ICreateOrderItemBody {
  cheki_package_uuid: string;
  qty: number;
  member_uuids: string[];
}

export interface IOrderList {
  uuid: string;
  order_number: string;
  order_type: string;
  order_status: string;
  total_amount: number;
  total_items:number;
  payment_status: PaymentStatus;
  payment_method?: string;
  event_uuid?: string;
  event_title?: string;
  event_banner?: string;
  created_at: Date;
}