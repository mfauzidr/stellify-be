export interface IMembers extends IMemberBody {
  id: number;
  uuid: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IMemberParams {
    uuid: string;
    name?: string;
}

export interface IMemberQueryParams {
    name?: string;
    member_status?: string;
    generation?: number;
    idol_group_uuid?: string;
}

export interface IMemberBody {
    idol_group_uuid: string;
    name: string;
    jiko: string;
    birthday: Date;
    image?: string;
    generation: number;
    member_status: string;
}