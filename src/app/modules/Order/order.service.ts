import { Types } from "mongoose";
import { Product } from "../Product/product.model";
import { TOrderCreation } from "./order.interface";
import { Order } from "./order.model";
import { Inventory } from "../Inventory/inventory.model";
import { v4 as uuidv4 } from "uuid";
import redis_client from "../../utils/redisClient";
import { SSLCSession } from "../../utils/sslcommerz";
import config from "../../config";
import { User } from "../User/user.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const handleSSLComerz = async (data: { user_id: string, order_data: TOrderCreation, host: any }, redis_key: string) => {

    const { shipping_address, payment_type, products } = data?.order_data;

    let total = 0;
    let num_of_item = 0;


    for (const [productId, quantity] of Object.entries(products)) {

        num_of_item += quantity;

        const product = await Product.findById(productId).populate([
            {
                path: "inventory_product"
            }
        ]);


        if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
        };

        const price = product.discount_price && product.discount_price > 0 ? product.discount_price : product.price;
        const subTotal = price * quantity;
        total += subTotal;

        if (product.inventory_product && product.inventory_product.quantity < quantity) {
            throw new Error(`Not enough stock for product ${product.name}. Available: ${product.inventory_product.quantity}`);
        }
    };

    const user = await User.findById(data?.user_id);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User Not Found !');
    }

    const mypayment = new SSLCSession(true, config.store_id, config.store_pass);

    const status_url = `https://${data.host}/orders/process`;

    mypayment.setUrls(status_url, status_url, status_url, status_url);

    mypayment.setProductIntegration(total, 'BDT', 'User Product', 'None', num_of_item, 'Physical Address', 'None' );

    mypayment.setCustomerInfo(`${user?.first_name} ${user?.last_name}`, user?.email, user?.address || "", "", "", "", "Bangladesh", user?.phone_number || "");

    mypayment.setShippingInfo(user?.email, shipping_address, 'None', 'None', "Bangladesh");

    mypayment.setAdditionalValues(redis_key, '', '', '');

    const response_data = mypayment.initPayment();

    return response_data;

}


const receiveResponseFromSSLCommerz = async () => {

}

const createOrderIntoDB = async (id: string, orderData: TOrderCreation, host: any) => {

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

            // console.log(product);

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

    else if (payment_type === "online") {

        const unique_redis_key = uuidv4();

        const data = {
            user_id: id,
            order_data: orderData,
            host: host,
        };

        await redis_client.set(unique_redis_key, JSON.stringify(data), "EX", 30 * 60);

        const received_response = handleSSLComerz(data, unique_redis_key);

        return received_response;

    }

    return "Gese ga uradhura";
}


const getAllOrderFromDB = async () => {

    const result = await Order.find().sort({ createdAt: -1 }).populate([
        { path: "user", select: "-password" },
        { path: "items.product", select: "" },
    ]);

    return result;
}

const getAllOrderByUserFromDB = async (id: string) => {

    const result = await Order.find({ user: id }).sort({ createdAt: -1 }).populate([
        { path: "user", select: "-password" },
        { path: "items.product", select: "" },
    ]);

    return result;
}


export const OrderServices = {
    createOrderIntoDB,
    getAllOrderFromDB,
    getAllOrderByUserFromDB,
    receiveResponseFromSSLCommerz,
}