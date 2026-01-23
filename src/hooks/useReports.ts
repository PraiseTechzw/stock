import { PackageIcon, ShoppingBag01Icon, Wallet01Icon } from '@hugeicons/core-free-icons';
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

    console.log('[useReports] Data Status:', {
        sales: allSales?.length,
        items: allSalesItems?.length,
        products: allProducts?.length,
        expenses: allExpensesData?.length,
    });

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

        // UNCOLLECTED DEBTS (Street Vendor specific)
        const totalDebts = allSales
            .filter(s => s.paymentStatus === 'credit' || s.paymentStatus === 'partial')
            .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

        // Accurate low stock count
        const lowStockCount = allProducts.filter(p => {
            if (!p.isActive) return false;
            const currentStock = allStockLevels
                .filter(sl => sl.productId === p.id)
                .reduce((sum, sl) => sum + (sl.quantity || 0), 0);
            return currentStock < (p.minStockLevel || 0);
        }).length;

        // INNOVATIVE: Business Health Score (0-100)
        // Based on Margin, Revenue Presence, and Stock Levels
        const marginScore = Math.min(Math.max(netProfit > 0 ? (netProfit / totalRevenue) * 50 : 0, 0), 50);
        const stockScore = allProducts.length > 0 ? ((allProducts.length - lowStockCount) / allProducts.length) * 50 : 0;
        const healthScore = Math.round(marginScore + stockScore);

        return {
            totalRevenue,
            cogs,
            grossProfit,
            totalExpenses,
            netProfit,
            totalDebts,
            margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
            totalProducts: allProducts.filter(p => p.isActive).length,
            lowStockCount,
            healthScore,
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

    // Recent Activity Feed
    const recentActivities = useMemo(() => {
        const activities: any[] = [];

        if (allSales) {
            allSales.forEach(s => {
                let date: Date;
                if (s.created_at) {
                    const isoStr = s.created_at.includes('T') ? s.created_at : s.created_at.replace(' ', 'T');
                    date = parseISO(isoStr);
                    if (isNaN(date.getTime())) date = new Date();
                } else {
                    date = new Date();
                }

                activities.push({
                    id: `sale-${s.id}`,
                    type: 'sale',
                    title: 'New Sale',
                    subtitle: `$${s.totalAmount?.toFixed(2)}`,
                    date,
                    icon: ShoppingBag01Icon,
                });
            });
        }

        if (allExpensesData) {
            allExpensesData.forEach(e => {
                let date = parseISO(e.date);
                if (isNaN(date.getTime())) date = new Date();

                activities.push({
                    id: `expense-${e.id}`,
                    type: 'expense',
                    title: 'Expense Recorded',
                    subtitle: `${e.category}: -$${e.amount.toFixed(2)}`,
                    date,
                    icon: Wallet01Icon,
                });
            });
        }

        if (allProducts) {
            allProducts.forEach(p => {
                let date: Date;
                if (p.created_at) {
                    const isoStr = p.created_at.includes('T') ? p.created_at : p.created_at.replace(' ', 'T');
                    date = parseISO(isoStr);
                    if (isNaN(date.getTime())) date = new Date();
                } else {
                    date = new Date();
                }

                activities.push({
                    id: `product-${p.id}`,
                    type: 'product',
                    title: 'Product Added',
                    subtitle: p.name,
                    date,
                    icon: PackageIcon,
                });
            });
        }

        const sorted = activities
            .sort((a, b) => {
                const bTime = isNaN(b.date.getTime()) ? 0 : b.date.getTime();
                const aTime = isNaN(a.date.getTime()) ? 0 : a.date.getTime();
                return bTime - aTime;
            })
            .slice(0, 5);

        console.log('[useReports] Generated activities:', sorted.length);
        return sorted;
    }, [allSales, allExpensesData, allProducts]);

    return {
        metrics: financialMetrics,
        salesByCategory,
        recentActivities,
        isLoading: !financialMetrics,
    };
};
