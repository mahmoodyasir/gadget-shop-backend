import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { OrderServices } from "./order.service";
import sendResponse from "../../utils/sendResponse";
import config from "../../config";


const createOrder = catchAsync(async (req, res) => {

    const { id } = req.user;

    const orderData = req.body;

    const host = req.get('host');

    const result: any = await OrderServices.createOrderIntoDB(id, orderData, host);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Order created successfully",
        payment_type: result?.payment_type,
        data: result
    });

});


const getAllOrder = catchAsync(async (req, res) => {

    const result: any = await OrderServices.getAllOrderFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Order fetched successfully",
        data: result
    });

});


const getAllOrderByUser = catchAsync(async (req, res) => {

    const { id, email } = req.user;

    const result: any = await OrderServices.getAllOrderByUserFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Order for user ${email} is fetched successfully`,
        data: result
    });

});


const receiveSSLCommerzResponse = catchAsync(async (req, res) => {

    const data = req.body;

    if (data?.status === "VALID") {

        res.redirect(`${config.frontend_url}/payment/success`);
    }

    else {
        res.redirect(`${config.frontend_url}/payment/failed`);
    }


    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Received response from sslcommerz",
        data: req.body
    });

});



export const OrderControllers = {
    createOrder,
    getAllOrder,
    getAllOrderByUser,
    receiveSSLCommerzResponse,
}