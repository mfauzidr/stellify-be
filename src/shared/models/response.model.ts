import { ICheki } from "src/modules/cheki/cheki.models";
import {
  IDashboardCheckInOverview,
  IDashboardEvent,
  IDashboardEventOverview,
  IDashboardOrderPhaseOverview,
  IDashboardPaymentOverview,
  IDashboardSummary,
} from "src/modules/dashboard/dashboard.model";
import { IEvents } from "src/modules/events/events.model";
import { IIdolGroups } from "src/modules/idol_groups/idol_groups.model";
import { IMembers } from "src/modules/members/members.model";
import { IOrderItems } from "src/modules/order_items/order_items.model";
import {
  IOrderDetail,
  IOrderList,
  IOrders,
} from "src/modules/orders/orders.model";
import { IPayment } from "src/modules/payments/payments.model";
import { IProducts } from "src/modules/products/product.model";
import { IUser } from "src/modules/users/users.model";

interface IPaginationMeta {
  totalData?: number;
  currentPage?: number;
  totalPage?: number;
  nextPage?: string | null;
  prevPage?: string | null;
}

interface IBasicResponse {
  success?: boolean;
  message: string;
  err?: string;
  warning?: string;
  meta?: IPaginationMeta;
}

export interface IIdolGroupsResponse extends IBasicResponse {
  results?: IIdolGroups[];
}

export interface IMemberResponse extends IBasicResponse {
  results?: IMembers[];
}

export interface IEventsResponse extends IBasicResponse {
  results?: IEvents[];
}

export interface IChekiResponse extends IBasicResponse {
  results?: ICheki[];
}

export interface IProductResponse extends IBasicResponse {
  results?: IProducts[];
}

export interface IUserResponse extends IBasicResponse {
  results?: IUser[];
}

export interface IAuthResponse extends IBasicResponse {
  results?: { token: string }[];
  uuid?: string;
}

export interface IOrderResponse extends IBasicResponse {
  results?: IOrders[];
}
export interface IOrderDetailResponse extends IBasicResponse {
  results?: IOrderDetail[];
}

export interface IOrderListResponse extends IBasicResponse {
  results?: IOrderList[];
}

export interface ICreateOrderResponse {
  success: boolean;
  message: string;
  results: {
    order: IOrders;
    payment: IPayment;
  };
}

export interface IOrderItemsResponse extends IBasicResponse {
  results?: IOrderItems[];
}

export interface IPaymentsResponse extends IBasicResponse {
  results?: IPayment[];
}

export interface IDashboardResponse extends IBasicResponse {
  results?: IDashboardSummary;
}

export interface IDashboardPaymentResponse extends IBasicResponse {
  results?: IDashboardPaymentOverview;
}

export interface IDashboardCheckInResponse extends IBasicResponse {
  results?: IDashboardCheckInOverview;
}

export interface IDashboardOrderPhaseResponse extends IBasicResponse {
  results?: IDashboardOrderPhaseOverview;
}

export interface IDashboardEventOverviewResponse extends IBasicResponse {
  results?: IDashboardEventOverview;
}
export interface IErrResponse {
  code?: string;
  column?: string;
  detail?: string;
  message?: string;
}
