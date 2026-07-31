export interface IOrderItemsBody {
  order_uuid: string;
  package_uuid: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface IOrderItems extends IOrderItemsBody {
  id: number;
  uuid: string;
  created_at: Date;
  updated_at: string;
}

export interface IOrderItemsParams {
  uuid: string;
}
