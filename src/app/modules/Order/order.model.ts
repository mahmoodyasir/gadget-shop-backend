import { model, Schema } from "mongoose";
import { IOnlinePayment, IOrder, IOrderItem } from "./order.interface";

const OrderItemSchema = new Schema<IOrderItem>({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product", required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    sub_total: {
        type: Number,
        required: true
    },
});

const OnlinePaymentSchema = new Schema<IOnlinePayment>({
    transaction_id: { type: String },
    card_brand: { type: String },
    card_issuer: { type: String },
    total_paid: { type: Number },
    currency: { type: String },
});

const OrderSchema = new Schema<IOrder>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        order_ID: { type: String },
        shipping_address: { type: String },
        payment_complete: { type: Boolean, default: false },
        payment_type: { type: String, default: "cash" },
        total: { type: Number },
        status: {
            type: String,
            enum: ["pending", "processing", "on_the_way", "completed", "shipped", "cancelled"],
            default: "pending",
        },
        items: { type: [OrderItemSchema], required: true },
        online_payment: { type: OnlinePaymentSchema },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);


OrderSchema.pre<IOrder>("save", function (next) {
    if (!this.order_ID) {
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const timestamp = new Date().toISOString().replace(/[-:.T]/g, "").slice(0, 14);
        this.order_ID = `${randomSuffix}-${timestamp}`;
    }
    next();
});


export const Order = model<IOrder>("Order", OrderSchema);