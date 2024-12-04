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




export const ProductServices = {
    insertProductIntoDB,

};