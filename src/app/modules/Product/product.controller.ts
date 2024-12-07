import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProductServices } from "./product.service";
import { uploadImageToS3 } from "../../utils/uploadImageToS3";


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


const createRawProduct = catchAsync(async (req, res) => {

    const result = await ProductServices.insertProductIntoDB(req.body)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product Created Successfully",
        data: result
    });
});

const getAllProduct = catchAsync(async (req, res) => {

    const result = await ProductServices.getAllProductFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All Products fetched Successfully",
        data: result
    });
});


const getProductDetails = catchAsync(async (req, res) => {

    const { productId } = req.params;

    const result = await ProductServices.getSingleProductFromDB(productId)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Fetched product details successfully",
        data: result
    });
});

const filterProducts = catchAsync(async (req, res) => {

    const { skip = 0, limit = 10 } = req.query;

    const { name = "", category = "", key_features = {}, min_price, max_price } = req.body;

    const filters = {
        skip: parseInt(skip as string),
        limit: parseInt(limit as string),
        name,
        category,
        key_features,
        min_price,
        max_price,
    };

    const result = await ProductServices.filterProductsFromDB(filters);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Filtered products fetched successfully.",
        page: filters.skip,
        page_size: filters.limit,
        total: result.total,
        total_page: result.totalPages,
        data: result.products,
    });

});


const updateProductImages = catchAsync(async (req, res) => {

    const { files, params } = req;

    const { productId } = params;

    const imageFiles = Array.isArray(files) ? files : [];

    const imageUrls = [];

    for (const file of imageFiles) {
        const url = await uploadImageToS3(file);
        imageUrls.push(url);
    }


    const result = await ProductServices.updateProductImagesToDB(productId, imageUrls)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product Created Successfully",
        data: result
    });
});


const getKeyFeature = catchAsync(async (req, res) => {

    const result = await ProductServices.getKeyFeatureFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Feature and Category Fetched",
        data: {
            category: result.category,
            features: result.features[0]
        }
    });

})


export const ProductControllers = {
    createProduct,
    createRawProduct,
    getAllProduct,
    getProductDetails,
    updateProductImages,
    filterProducts,
    getKeyFeature,
}