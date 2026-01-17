import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '../db/DatabaseProvider';
import { products } from '../db/schema';

export const useProducts = () => {
    const { data: allProducts } = useLiveQuery(db.select().from(products));

    const addProduct = async (product: typeof products.$inferInsert) => {
        try {
            await db.insert(products).values(product);
        } catch (error) {
            console.error('Error adding product:', error);
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
        products: allProducts || [],
        isLoading: allProducts === undefined,
        addProduct,
        updateProduct,
        deleteProduct,
    };
};
