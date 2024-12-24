import { Types } from "mongoose";
import { Product } from "../Product/product.model";
import { TOrderCreation } from "./order.interface";
import { Order } from "./order.model";
import { Inventory } from "../Inventory/inventory.model";

const createOrderIntoDB = async (id: string, orderData: TOrderCreation) => {

    const { shipping_address, payment_type, products } = orderData;

    let total = 0;
    const orderItems = [];

    if (payment_type === "cash") {
        for (const [productId, quantity] of Object.entries(products)) {

            const product = await Product.findById(productId).populate([
                {
                    path: "inventory_product"
                }
            ]);

            console.log(product)

            if (!product) {
                throw new Error(`Product with ID ${productId} not found`);
            };

            const price = product.discount_price && product.discount_price > 0 ? product.discount_price : product.price;
            const subTotal = price * quantity;
            total += subTotal;

            if (product.inventory_product && product.inventory_product.quantity < quantity) {
                throw new Error(`Not enough stock for product ${product.name}. Available: ${product.inventory_product.quantity}`);
            }

            if (product.inventory_product) {
                await Inventory.findByIdAndUpdate(product.inventory_product._id, {
                    $inc: { quantity: -quantity },
                });
            }

            await product.save();

            orderItems.push({
                product: new Types.ObjectId(productId),
                quantity,
                sub_total: subTotal,
            });
        }

        const order = new Order({
            user: new Types.ObjectId(id),
            shipping_address,
            payment_type,
            total,
            items: orderItems
        });

        await order.save();

        return order;

    }

    return "";
}


export const OrderServices = {
    createOrderIntoDB,
}