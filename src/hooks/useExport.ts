import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
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

    const downloadFileWeb = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportProducts = async () => {
        try {
            const productList = await db.select().from(products);
            const csvContent = convertToCSV(productList);
            const fileName = `inventory_export_${Date.now()}.csv`;

            if (Platform.OS === 'web') {
                downloadFileWeb(csvContent, fileName);
                return true;
            }

            const baseDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory;
            if (!baseDir) throw new Error('No storage directory available on this device');

            const fileUri = `${baseDir}${fileName}`;
            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                encoding: (FileSystem as any).EncodingType.UTF8
            });
            await Sharing.shareAsync(fileUri);
            return true;
        } catch (error) {
            console.error('Export error:', error);
            return false;
        }
    };

    const exportSales = async () => {
        try {
            const salesOrderList = await db.select().from(salesOrders);
            const csvContent = convertToCSV(salesOrderList);
            const fileName = `sales_export_${Date.now()}.csv`;

            if (Platform.OS === 'web') {
                downloadFileWeb(csvContent, fileName);
                return true;
            }

            const baseDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory;
            if (!baseDir) throw new Error('No storage directory available on this device');

            const fileUri = `${baseDir}${fileName}`;
            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                encoding: (FileSystem as any).EncodingType.UTF8
            });
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
