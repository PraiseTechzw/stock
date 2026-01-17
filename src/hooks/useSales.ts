import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '../db/DatabaseProvider';
import { payments, salesOrderItems, salesOrders } from '../db/schema';

export interface SaleItem {
    productId: number;
    quantity: number;
    price: number;
    discount: number;
}

export const useSales = () => {
    const { data: allOrders } = useLiveQuery(db.select().from(salesOrders));

    const createSalesOrder = async (customerId: number, items: SaleItem[], discountAmount: number = 0) => {
        try {
            const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity) - item.discount, 0) - discountAmount;

            // Perform as a transaction
            return await db.transaction(async (tx) => {
                const [insertedOrder] = await tx.insert(salesOrders).values({
                    customerId,
                    totalAmount,
                    discountAmount,
                    status: 'confirmed',
                }).returning();

                for (const item of items) {
                    await tx.insert(salesOrderItems).values({
                        salesOrderId: insertedOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        discount: item.discount,
                    });

                    // Logic to decrease stock could also go here
                    // For now, we'll assume stock is updated separately or we add it here
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
