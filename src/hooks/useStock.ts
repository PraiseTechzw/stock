import { and, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';
import { db } from '../db/DatabaseProvider';
import { products as productsSchema, stockLevels, stockLocations } from '../db/schema';

export const useStock = () => {
    const { data: locations } = useLiveQuery(db.select().from(stockLocations));
    const { data: products } = useLiveQuery(db.select().from(productsSchema));

    const getStockForProduct = (productId: number) => {
        return useLiveQuery(
            db.select()
                .from(stockLevels)
                .where(eq(stockLevels.productId, productId))
        );
    };

    const adjustStock = async (productId: number, locationId: number, quantity: number, reason: string) => {
        console.log(`[useStock] Adjusting: Pid=${productId}, Loc=${locationId}, Qty=${quantity}`);
        try {
            const results = await db.select()
                .from(stockLevels)
                .where(and(eq(stockLevels.productId, productId), eq(stockLevels.locationId, locationId)));

            const existing = results[0];
            console.log('[useStock] Existing record:', existing);

            if (existing) {
                await db.update(stockLevels)
                    .set({
                        quantity: existing.quantity + quantity,
                        updated_at: new Date().toISOString()
                    })
                    .where(eq(stockLevels.id, existing.id));
                console.log('[useStock] Updated existing');
            } else {
                await db.insert(stockLevels).values({
                    productId,
                    locationId,
                    quantity,
                });
                console.log('[useStock] Inserted new');
            }
            // logic for logging the adjustment in a history table could go here
        } catch (error) {
            console.error('Error adjusting stock:', error);
            throw error;
        }
    };

    const transferStock = async (productId: number, fromLocationId: number, toLocationId: number, quantity: number) => {
        try {
            // 1. Decrease from source
            await adjustStock(productId, fromLocationId, -quantity, `Transfer to ${toLocationId}`);
            // 2. Increase in destination
            await adjustStock(productId, toLocationId, quantity, `Transfer from ${fromLocationId}`);
        } catch (error) {
            console.error('Error transferring stock:', error);
            throw error;
        }
    };

    const addLocation = async (name: string, description?: string) => {
        return await db.insert(stockLocations).values({ name, description });
    };

    const { data: allStock } = useLiveQuery(db.select().from(stockLevels));

    const lowStockProducts = useMemo(() => {
        if (!products || !allStock) return [];

        return products.filter((product: any) => {
            const totalStock = allStock
                .filter(s => s.productId === product.id)
                .reduce((sum, s) => sum + (s.quantity || 0), 0);

            return product.minStockLevel !== null && totalStock < product.minStockLevel;
        });
    }, [products, allStock]);

    return {
        locations: locations || [],
        lowStockProducts,
        getStockForProduct,
        adjustStock,
        transferStock,
        addLocation,
    };
};
