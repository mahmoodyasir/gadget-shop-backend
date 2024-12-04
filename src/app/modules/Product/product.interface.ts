import { Types } from "mongoose";
import { IInventory } from "../Inventory/inventory.interface";

export interface ICategory {
    name: string;
}

export interface IKeyFeature {
    name: string;
    value: string[];
};


export interface ISpecification {
    category: string;
    name: string;
    value: string[];
}

export interface IProduct {
    name: string;
    price: number;
    discount_price?: number | null;
    product_code: string;
    brand: string;
    category: Types.ObjectId;
    description: string;
    image_urls: string[];
    isActive: boolean;
    isHighlighted: boolean;
    key_features: IKeyFeature[];
    specifications: ISpecification[];
    inventory_product?: IInventory;
}