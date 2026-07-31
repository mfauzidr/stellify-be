export interface IChekiBody {
    title: string;
    event_uuid: string
    po_price_single?: number;
    po_price_group?: number
    ots_price_single?: number;
    ots_price_group?: number
    allow_single?: boolean
    allow_group?: boolean
}

export interface ICheki extends IChekiBody {
    id: number;
    uuid: string;
    status: string;
    created_at: Date;
    is_active: boolean
    updated_at?: Date;
    deleted_at?: Date;
}

export interface IChekiParams {
    uuid: string;
    title?: string
}