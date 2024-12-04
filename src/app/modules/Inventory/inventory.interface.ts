import { Types } from "mongoose";

export interface IInventory {
    product: Types.ObjectId
    quantity: number;
    restock_alert: number;
    last_restocked: Date;
}