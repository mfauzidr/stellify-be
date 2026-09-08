export interface IEvents extends IEventsBody {
    id: number;
    uuid: string;
    title: string;
    is_active: boolean;
    created_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
    member_lineups?: string[];
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
    location?: string;
    event_date: string;
    po_start: string;
    po_end: string;
    allow_pickups?: boolean;
    status?: "draft" | "published" | "finished" | "cancelled";
}

export interface IEventRequest {
    idol_group_uuid: string;
    title: string;
    description?: string;
    banner?: string;
    location?: string;
    event_date: string;
    po_start: string;
    po_end: string;
    allow_pickups?: boolean;
    status?: "draft" | "published" | "finished" | "cancelled";
}
