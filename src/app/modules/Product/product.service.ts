import { IInventory } from "../Inventory/inventory.interface";
import { Inventory } from "../Inventory/inventory.model";
import { IProduct } from "./product.interface";
import { Category, Product } from "./product.model";


const insertProductIntoDB = async (payload: Partial<IProduct>) => {


    const { category, inventory_product, ...restProductData } = payload;

    let existingCategory = await Category.findOne({ name: category });
    let newInventory;

    if (!existingCategory) {
        existingCategory = new Category({ name: category });
    }

    const newProduct = new Product({
        ...restProductData,
        category: existingCategory?.id
    });

    if (inventory_product) {
        newInventory = new Inventory({
            ...inventory_product,
            product: newProduct?.id
        });

        newProduct.inventory_product = newInventory as IInventory;
    }


    await Promise.all([existingCategory.save(), newProduct.save(), newInventory && newInventory.save()]);

    return newProduct.populate([
        {
            path: 'category',
            select: "name",
        },
        {
            path: 'inventory_product',
        }
    ])
};


const getAllProductFromDB = async () => {

    const allProducts = await Product.find().populate([
        {
            path: 'category',
            select: "name",
        },
        {
            path: 'inventory_product',
        }
    ]);

    return allProducts;
};


const getSingleProductFromDB = async (productId: string) => {

    const product = await Product.findById(productId).populate([
        {
            path: 'category',
            select: "name",
        },
        {
            path: 'inventory_product',
        }
    ]);

    return product;
};


const updateProductImagesToDB = async (productId: string, imageUrls: string[]) => {
    if (!productId || !imageUrls) {
        throw new Error("Product ID and image URLs are required.");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { image_urls: imageUrls },
        { new: true }
    ).populate([
        { path: "category", select: "name" },
        { path: "inventory_product" },
    ]);

    if (!updatedProduct) {
        throw new Error("Product not found or update failed.");
    }

    return updatedProduct;
};



const filterProductsFromDB = async ({
    skip = 0,
    limit = 10,
    name = "",
    category = "",
    key_features = {},
    min_price,
    max_price,
}: {
    skip: number;
    limit: number;
    name: string;
    category: string;
    key_features: Record<string, string[]>;
    min_price?: number;
    max_price?: number;
}) => {

    const query: any = { isActive: true };

    if (name) {
        query.name = { $regex: name, $options: "i" };
    }

    if (category) {
        const matchingCategories = await Category.find({
            name: { $regex: category, $options: "i" },
        }).select("_id");

        if (matchingCategories.length > 0) {
            query.category = { $in: matchingCategories.map((cat) => cat._id) };
        }
    }

    if (key_features && Object.keys(key_features).length > 0) {
        query["key_features"] = {
            $all: Object.entries(key_features).map(([key, values]) => ({
                $elemMatch: {
                    name: key,
                    value: { $in: values },
                },
            })),
        };
    }

    if (min_price !== undefined || max_price !== undefined) {
        const priceFilter: any = {};

        if (min_price !== undefined) {
            priceFilter.$gte = min_price;
        }
        if (max_price !== undefined) {
            priceFilter.$lte = max_price;
        }

        // Applying filtering logic based on the existence of discount_price
        query.$or = [
            { discount_price: { ...priceFilter } }, // Use discount_price if available
            { discount_price: { $exists: false }, price: { ...priceFilter } } // Fallback to price
        ];
    }


    skip = (skip - 1) * limit;

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate([
            { path: "category", select: "name" },
            { path: "inventory_product" },
        ]);

    const totalPages = Math.ceil(total / limit);

    return {
        total,
        totalPages,
        products,
    };
};



const getKeyFeatureFromDB = async () => {


    const category = await Category.find();

    const features = await Product.aggregate([
        { $unwind: "$key_features" },

        // Group by feature name and collect all unique values for each feature
        {
            $group: {
                _id: "$key_features.name",  // Group by feature name (dynamic keys)
                values: { $addToSet: "$key_features.value" }  // Collect unique values
            }
        },

        // Flatten the nested arrays in values using $reduce to ensure flat structure
        {
            $project: {
                _id: 0,
                name: "$_id",  // Rename _id to name
                values: {
                    $reduce: {
                        input: "$values",
                        initialValue: [],
                        in: { $concatArrays: ["$$value", "$$this"] }  // Merge arrays into a flat structure
                    }
                }
            }
        },

        // Remove any duplicates if they exist at this point
        {
            $project: {
                name: 1,
                values: { $setUnion: ["$values", "$values"] }  // Ensure only unique values are kept
            }
        },

        // Group all the features together into a single document
        {
            $group: {
                _id: null,  // Group everything together into one document
                features: { $push: { k: "$name", v: "$values" } }
            }
        },

        // Convert the "features" array into a document with dynamic keys
        {
            $replaceRoot: {
                newRoot: {
                    $arrayToObject: {
                        $map: {
                            input: "$features",
                            as: "item",
                            in: ["$$item.k", "$$item.v"]
                        }
                    }
                }
            }
        }
    ]);

    const finalResponse = {
        category: category,
        features: features
    }


    return finalResponse;
}



export const ProductServices = {
    insertProductIntoDB,
    getAllProductFromDB,
    getSingleProductFromDB,
    updateProductImagesToDB,
    filterProductsFromDB,
    getKeyFeatureFromDB,
};