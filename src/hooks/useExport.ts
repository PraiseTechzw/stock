import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { db } from '../db/DatabaseProvider';
import { products, salesOrders } from '../db/schema';

export const useExport = () => {
    const convertToCSV = (data: any[]) => {
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const headerRow = headers.join(',');

        const rows = data.map(obj =>
            headers.map(header => {
                const val = (obj as any)[header];
                if (val === null || val === undefined) return '';
                const stringVal = String(val);
                // Escape quotes and wrap in quotes
                return `"${stringVal.replace(/"/g, '""')}"`;
            }).join(',')
        ).join('\n');

        return `${headerRow}\n${rows}`;
    };

    const exportProducts = async () => {
        try {
            const productList = await db.select().from(products);
            const csvContent = convertToCSV(productList);

            // Bypass lint for environment-specific type issues
            const documentDir = (FileSystem as any).documentDirectory;
            if (!documentDir) throw new Error('Document directory not available');

            const fileUri = `${documentDir}inventory_export_${Date.now()}.csv`;

            await (FileSystem as any).writeAsStringAsync(fileUri, csvContent);
            await Sharing.shareAsync(fileUri);
            return true;
        } catch (error) {
            console.error('Export error:', error);
            return false;
        }
    };

    const exportSales = async () => {
        try {
            const salesList = await db.select().from(salesOrders);
            const csvContent = convertToCSV(salesList);

            const documentDir = (FileSystem as any).documentDirectory;
            if (!documentDir) throw new Error('Document directory not available');

            const fileUri = `${documentDir}sales_export_${Date.now()}.csv`;

            await (FileSystem as any).writeAsStringAsync(fileUri, csvContent);
            await Sharing.shareAsync(fileUri);
            return true;
        } catch (error) {
            console.error('Export error:', error);
            return false;
        }
    };

    return {
        exportProducts,
        exportSales
    };
};
