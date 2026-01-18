import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '../db/DatabaseProvider';
import { expenses } from '../db/schema';

export const useExpenses = () => {
    const { data: allExpenses } = useLiveQuery(db.select().from(expenses));

    const addExpense = async (expense: typeof expenses.$inferInsert) => {
        try {
            await db.insert(expenses).values(expense);
        } catch (error) {
            console.error('Error adding expense:', error);
            throw error;
        }
    };

    const updateExpense = async (id: number, expense: Partial<typeof expenses.$inferInsert>) => {
        try {
            await db.update(expenses)
                .set({ ...expense, updated_at: new Date().toISOString() })
                .where(eq(expenses.id, id));
        } catch (error) {
            console.error('Error updating expense:', error);
            throw error;
        }
    };

    const deleteExpense = async (id: number) => {
        try {
            await db.delete(expenses).where(eq(expenses.id, id));
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    };

    return {
        expenses: allExpenses || [],
        isLoading: allExpenses === undefined,
        addExpense,
        updateExpense,
        deleteExpense,
    };
};
