import { Types } from "mongoose";

export interface IOrderItem {
    product: Types.ObjectId;
    quantity: number;
    sub_total: number;
};

export interface IOnlinePayment {
    transaction_id?: string;
    card_brand?: string;
    card_issuer?: string;
    total_paid?: number;
    currency?: string;
};

export interface IOrder {
    user: Types.ObjectId;
    order_ID?: string;
    shipping_address?: string;
    payment_complete: boolean;
    payment_type: string;
    total?: number;
    status: "pending" | "processing" | "on_the_way" | "completed" | "shipped" | "cancelled";
    items: IOrderItem[];
    online_payment?: IOnlinePayment;
};

export type TOrderCreation = {
    shipping_address: string;
    payment_type: string;
    products: Record<string, number>;
}