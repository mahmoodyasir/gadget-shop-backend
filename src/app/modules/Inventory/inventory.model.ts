import { model, Schema } from "mongoose";
import { IInventory } from "./inventory.interface";


const InventorySchema = new Schema<IInventory>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        restock_alert: {
            type: Number,
            required: true,
        },
        last_restocked: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);


export const Inventory = model<IInventory>("Inventory", InventorySchema);