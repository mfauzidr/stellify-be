export interface IEvents extends IEventsBody {
    id: number;
    uuid: string;
    title: string;
    created_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
}

export interface IEventsParams {
    uuid: string;
    name?: string;
    event_date?: string;
}

export interface IEventsBody {
    idol_group_uuid: string;
    title: string;
    description?: string;
    banner?: string;
    event_date: string;
    po_start: string;
    po_end: string;
    allow_pickup?: boolean;
    status?: "draft" | "published" | "archived";
}
