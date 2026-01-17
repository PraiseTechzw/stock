import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '../db/DatabaseProvider';
import { customers } from '../db/schema';

export const useCustomers = () => {
    const { data: allCustomers } = useLiveQuery(db.select().from(customers));

    const addCustomer = async (customer: typeof customers.$inferInsert) => {
        try {
            await db.insert(customers).values(customer);
        } catch (error) {
            console.error('Error adding customer:', error);
            throw error;
        }
    };

    const updateCustomer = async (id: number, customer: Partial<typeof customers.$inferInsert>) => {
        try {
            await db.update(customers)
                .set({ ...customer, updated_at: new Date().toISOString() })
                .where(eq(customers.id, id));
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    };

    const deleteCustomer = async (id: number) => {
        try {
            await db.delete(customers).where(eq(customers.id, id));
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    };

    return {
        customers: allCustomers || [],
        isLoading: allCustomers === undefined,
        addCustomer,
        updateCustomer,
        deleteCustomer,
    };
};
