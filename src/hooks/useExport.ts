import { documentDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { db } from '../db/DatabaseProvider';
import { products, salesOrders } from '../db/schema';

export const useExport = () => {
    const convertToCSV = (data: any[]) => {
        if (data.length === 0) return '';
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj =>
            Object.values(obj).map(val =>
                typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
            ).join(',')
        ).join('\n');
        return `${headers}\n${rows}`;
    };

    const exportProducts = async () => {
        try {
            const productList = await db.select().from(products);
            const csvContent = convertToCSV(productList);
            const fileUri = `${documentDirectory}inventory_export_${Date.now()}.csv`;

            await writeAsStringAsync(fileUri, csvContent);
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
            const fileUri = `${documentDirectory}sales_export_${Date.now()}.csv`;

            await writeAsStringAsync(fileUri, csvContent);
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
