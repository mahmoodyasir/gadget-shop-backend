import { Types, Document } from "mongoose";

export interface IInventory extends Document {
    product: Types.ObjectId
    quantity: number;
    restock_alert: number;
    last_restocked: Date;
}