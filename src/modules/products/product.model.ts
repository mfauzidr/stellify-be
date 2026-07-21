
export interface IProductsBody {
    member_uuid:string
    name:string
    image?: string
    price:number
    stock:number
}

export interface IProducts extends IProductsBody {
    id: number
    uuid: string
    is_active?: boolean
    created_at?:Date
    updated_at?:Date
    deleted_at?:Date
}

export interface IProductParams {
    uuid:string
}

export interface IProductQueryParams {
    search?: string
    member_uuid?: string
    sortBy?: string
    order?: string
    is_active?:boolean
    page?:string
    limit?: string
}