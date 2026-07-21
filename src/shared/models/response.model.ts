import { ICheki } from "src/modules/cheki/cheki.models";
import { IEvents } from "src/modules/events/events.model";
import { IIdolGroups } from "src/modules/idol_groups/idol_groups.model";
import { IMembers } from "src/modules/members/members.model";
import { IProducts } from "src/modules/products/product.model";

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
  results?: ICheki[]
}

export interface IProductResponse extends IBasicResponse {
  results?: IProducts[]
}

export interface IErrResponse {
  code?: string;
  column?: string;
  detail?: string;
  message?: string;
}
