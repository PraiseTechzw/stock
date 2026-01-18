import { eq, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '../db/DatabaseProvider';
import { payments, salesOrderItems, salesOrders, stockLevels } from '../db/schema';

export interface SaleItem {
    productId: number;
    quantity: number;
    price: number;
    discount: number;
}

export const useSales = () => {
    const { data: allOrders } = useLiveQuery(db.select().from(salesOrders));

    const createSalesOrder = async (
        customerId: number | null,
        items: SaleItem[],
        discountAmount: number = 0,
        paymentStatus: 'paid' | 'partial' | 'credit' = 'paid',
        dueDate?: string
    ) => {
        try {
            const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity) - item.discount, 0) - discountAmount;

            return await db.transaction(async (tx) => {
                // 1. Create the Order
                const [insertedOrder] = await tx.insert(salesOrders).values({
                    customerId,
                    totalAmount,
                    discountAmount,
                    status: 'confirmed',
                    paymentStatus,
                    dueDate,
                }).returning();

                for (const item of items) {
                    // 2. Add Order Items
                    await tx.insert(salesOrderItems).values({
                        salesOrderId: insertedOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        discount: item.discount,
                    });

                    // 3. SECURE STOCK REDUCTION
                    // Find existing stock in the first available location
                    const existingStock = await tx.select()
                        .from(stockLevels)
                        .where(eq(stockLevels.productId, item.productId))
                        .get();

                    if (existingStock) {
                        await tx.update(stockLevels)
                            .set({
                                quantity: sql`${stockLevels.quantity} - ${item.quantity}`,
                                updated_at: new Date().toISOString()
                            })
                            .where(eq(stockLevels.id, existingStock.id));
                    }
                }

                // 4. Create initial payment if fully paid
                if (paymentStatus === 'paid') {
                    await tx.insert(payments).values({
                        salesOrderId: insertedOrder.id,
                        amount: totalAmount,
                        paymentMethod: 'cash', // Default to cash
                    });
                }

                return insertedOrder;
            });
        } catch (error) {
            console.error('Error creating sales order:', error);
            throw error;
        }
    };

    const getOrderItems = (orderId: number) => {
        return useLiveQuery(
            db.select()
                .from(salesOrderItems)
                .where(eq(salesOrderItems.salesOrderId, orderId))
        );
    };

    const getPaymentsForOrder = (orderId: number) => {
        return useLiveQuery(
            db.select()
                .from(payments)
                .where(eq(payments.salesOrderId, orderId))
        );
    };

    const addPayment = async (orderId: number, amount: number, method: string) => {
        try {
            await db.insert(payments).values({
                salesOrderId: orderId,
                amount,
                paymentMethod: method,
            });
        } catch (error) {
            console.error('Error adding payment:', error);
            throw error;
        }
    };

    return {
        orders: allOrders || [],
        createSalesOrder,
        getOrderItems,
        getPaymentsForOrder,
        addPayment,
    };
};
