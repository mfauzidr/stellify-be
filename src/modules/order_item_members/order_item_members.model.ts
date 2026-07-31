export interface IOrderItemMemberBody {
    order_item_uuid: string
    member_uuid: string
}

export interface IOrderItemMembers extends IOrderItemMemberBody{
    id: number
}

