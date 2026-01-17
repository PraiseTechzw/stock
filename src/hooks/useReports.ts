import { isAfter, parseISO, startOfDay, startOfMonth, startOfWeek, startOfYear } from 'date-fns';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';
import { db } from '../db/DatabaseProvider';
import { expenses as expensesTable, products, salesOrderItems, salesOrders, stockLevels } from '../db/schema';

export type ReportFilter = 'today' | 'week' | 'month' | 'year' | 'all';

export const useReports = (filter: ReportFilter = 'all') => {
    const { data: allSales } = useLiveQuery(db.select().from(salesOrders));
    const { data: allSalesItems } = useLiveQuery(db.select().from(salesOrderItems));
    const { data: allProducts } = useLiveQuery(db.select().from(products));
    const { data: allExpensesData } = useLiveQuery(db.select().from(expensesTable));
    const { data: allStockLevels } = useLiveQuery(db.select().from(stockLevels));

    const getFilterDate = (range: ReportFilter) => {
        const now = new Date();
        switch (range) {
            case 'today': return startOfDay(now);
            case 'week': return startOfWeek(now);
            case 'month': return startOfMonth(now);
            case 'year': return startOfYear(now);
            default: return null;
        }
    };

    const financialMetrics = useMemo(() => {
        if (!allSales || !allSalesItems || !allProducts || !allExpensesData || !allStockLevels) return null;

        const filterDate = getFilterDate(filter);

        // Filter Sales
        const filteredSales = filter === 'all' ? allSales : allSales.filter(s => {
            const date = s.created_at ? parseISO(s.created_at.replace(' ', 'T')) : new Date();
            return isAfter(date, filterDate!);
        });

        const filteredOrderIds = new Set(filteredSales.map(s => s.id));
        const filteredSalesItems = allSalesItems.filter(item => filteredOrderIds.has(item.salesOrderId));

        // Filter Expenses
        const filteredExpenses = filter === 'all' ? allExpensesData : allExpensesData.filter(e => {
            const date = parseISO(e.date);
            return isAfter(date, filterDate!);
        });

        const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

        // COGS = sum(quantity * costPrice) for each item sold in filtered orders
        const cogs = filteredSalesItems.reduce((sum, item) => {
            const product = allProducts.find(p => p.id === item.productId);
            return sum + (item.quantity * (product?.costPrice || 0));
        }, 0);

        const grossProfit = totalRevenue - cogs;
        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const netProfit = grossProfit - totalExpenses;

        // Accurate low stock count
        const lowStockCount = allProducts.filter(p => {
            if (!p.isActive) return false;
            const currentStock = allStockLevels
                .filter(sl => sl.productId === p.id)
                .reduce((sum, sl) => sum + (sl.quantity || 0), 0);
            return currentStock < (p.minStockLevel || 0);
        }).length;

        return {
            totalRevenue,
            cogs,
            grossProfit,
            totalExpenses,
            netProfit,
            margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
            totalProducts: allProducts.filter(p => p.isActive).length,
            lowStockCount,
        };
    }, [allSales, allSalesItems, allProducts, allExpensesData, allStockLevels, filter]);

    // Sales by category for charts
    const salesByCategory = useMemo(() => {
        if (!allSalesItems || !allProducts || !allSales) return [];

        const filterDate = getFilterDate(filter);
        const filteredSales = filter === 'all' ? allSales : allSales.filter(s => {
            const date = s.created_at ? parseISO(s.created_at.replace(' ', 'T')) : new Date();
            return isAfter(date, filterDate!);
        });
        const filteredOrderIds = new Set(filteredSales.map(s => s.id));
        const filteredSalesItems = allSalesItems.filter(item => filteredOrderIds.has(item.salesOrderId));

        const categories: Record<string, number> = {};
        filteredSalesItems.forEach(item => {
            const product = allProducts.find(p => p.id === item.productId);
            const catName = product?.categoryId ? `Cat ${product.categoryId}` : 'Uncategorized';
            categories[catName] = (categories[catName] || 0) + (item.price * item.quantity);
        });

        return Object.keys(categories).map(name => ({
            name,
            value: categories[name],
        }));
    }, [allSalesItems, allProducts, allSales, filter]);

    return {
        metrics: financialMetrics,
        salesByCategory,
        isLoading: !financialMetrics,
    };
};
