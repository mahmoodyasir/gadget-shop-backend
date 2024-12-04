import { model, Schema, Query } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ICategory, IKeyFeature, IProduct, ISpecification } from "./product.interface";

const generateProductCode = (): string => {
    const now = new Date();
    const monthYear = now.toLocaleString("en-US", { month: "short", year: "numeric" }).replace(" ", "");
    const uniqueId = uuidv4().slice(0, 8);
    return `${uniqueId}${monthYear}`;
};


const keyFeatureSchema = new Schema<IKeyFeature>({
    name: { type: String, required: true },
    value: [{ type: String, required: true }],
});


const specificationSchema = new Schema<ISpecification>({
    category: { type: String, required: true },
    name: { type: String, required: true },
    value: [{ type: String, required: true }],
});



const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        discount_price: {
            type: Number,
            default: null
        },
        product_code: {
            type: String,
            unique: true,
            default: generateProductCode,
            immutable: true,
        },
        brand: {
            type: String,
            required: true
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        description: {
            type: String,
            required: true
        },
        image_urls: [{ type: String }],
        isActive: {
            type: Boolean,
            default: true
        },
        isHighlighted: {
            type: Boolean,
            default: false
        },
        key_features: {
            type: [keyFeatureSchema],
            default: [],
        },
        specifications: {
            type: [specificationSchema],
            default: [],
        },
        inventory_product: {
            type: Schema.Types.ObjectId,
            ref: "Inventory",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);



productSchema.pre<Query<any, any>>(/^find/, async function (next) {
    this.populate("category");
    next();
});


const categorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

export const Category = model<ICategory>("Category", categorySchema);
export const Product = model<IProduct>("Product", productSchema);