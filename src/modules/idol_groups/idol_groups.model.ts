export interface IIdolGroups {
    id: number;
    uuid: string;
    name: string;
    createdAt: Date;
    updatedAt?: Date;
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
