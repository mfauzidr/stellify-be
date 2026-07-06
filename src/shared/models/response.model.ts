import { IIdolGroups } from "src/modules/idol_groups/idol_groups.model";
import { IMembers } from "src/modules/members/members.model";

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

export interface IErrResponse {
  code?: string;
  column?: string;
  detail?: string;
  message?: string;
}
