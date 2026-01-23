import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';
import { db } from '../db/DatabaseProvider';
import { products, stockLevels } from '../db/schema';

export interface ProductWithStock {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    categoryId: number | null;
    barcode: string | null;
    unitOfMeasure: string | null;
    costPrice: number | null;
    sellingPrice: number | null;
    minStockLevel: number | null;
    maxStockLevel: number | null;
    imageUri: string | null;
    isActive: boolean | null;
    isFavorite: boolean | null;
    created_at: string | null;
    updated_at: string | null;
    sync_status: string | null;
    totalQuantity: number;
}

export const useProducts = () => {
    // Fetch products
    const { data: allProducts, error: productsError } = useLiveQuery(db.select().from(products));

    // Fetch stock levels
    const { data: allStock, error: stockError } = useLiveQuery(db.select().from(stockLevels));

    // Consolidate data
    const productsWithStock = useMemo(() => {
        if (!allProducts) return [];

        return allProducts.map(product => {
            const productStock = allStock
                ? allStock
                    .filter(s => s.productId === product.id)
                    .reduce((sum, s) => sum + (s.quantity || 0), 0)
                : 0;

            return {
                ...product,
                totalQuantity: productStock
            } as ProductWithStock;
        });
    }, [allProducts, allStock]);

    /* if (productsError || stockError) {
        console.error('Error fetching inventory data:', productsError || stockError);
    } */

    const addProduct = async (product: typeof products.$inferInsert) => {
        try {
            const result = await db.insert(products).values(product);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const updateProduct = async (id: number, product: Partial<typeof products.$inferInsert>) => {
        try {
            await db.update(products)
                .set({ ...product, updated_at: new Date().toISOString() })
                .where(eq(products.id, id));
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            await db.delete(products).where(eq(products.id, id));
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    };

    return {
        products: productsWithStock,
        isLoading: allProducts === undefined,
        error: productsError || stockError,
        addProduct,
        updateProduct,
        deleteProduct,
    };
};
