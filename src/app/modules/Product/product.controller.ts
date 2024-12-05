import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProductServices } from "./product.service";
import { uploadImageToS3 } from "../../utils/uploadImageToS3";
import path from "path";


const createProduct = catchAsync(async (req, res) => {

    const { files, body } = req;

    const { key_features, specifications, inventory_product, price, discount_price } = req.body;

    const parsedKeyFeatures = JSON.parse(key_features || "[]");
    const parsedSpecifications = JSON.parse(specifications || "[]");
    const parsedInventory = inventory_product ? JSON.parse(inventory_product) : null;

    const imageFiles = Array.isArray(files) ? files : [];

    const imageUrls = [];

    for (const file of imageFiles) {
        // const fileExtension = path.extname(file.originalname);
        // const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
        const url = await uploadImageToS3(file);
        imageUrls.push(url);
    }

    const productPayload = {
        ...body,
        price: parseFloat(price),
        discount_price: parseFloat(discount_price),
        key_features: parsedKeyFeatures,
        specifications: parsedSpecifications,
        inventory_product: parsedInventory,
        image_urls: imageUrls,
    };


    const result = await ProductServices.insertProductIntoDB(productPayload);

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