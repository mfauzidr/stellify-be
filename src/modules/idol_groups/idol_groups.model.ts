export interface IIdolGroups extends IIdolGroupsBody {
    id: number;
    uuid: string;
    name: string;
    created_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
}

export interface IIdolGroupsParams {
    uuid: string;
    name?: string;
}

// export interface IIdolGroupsQueryParams {
//     search?: string;
//     sortBy?: string;
//     order?: string;
//     page?: string;
//     limit?: string;
// }

export interface IIdolGroupsBody {
    name: string;
    jiko?: string;
    description?: string;
    logo?: string;
    banner?: string;
}
