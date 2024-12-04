import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProductServices } from "./product.service";


const createProduct = catchAsync(async (req, res) => {

    const data = req.body;

    const result = await ProductServices.insertProductIntoDB(data);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product Created Successfully",
        data: result
    });
});


export const ProductControllers = {
    createProduct,

}