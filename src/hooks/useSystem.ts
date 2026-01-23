import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';
import { db } from '../db/DatabaseProvider';
import {
    customers,
    expenses,
    notifications,
    payments,
    productCategories,
    products,
    salesOrderItems,
    salesOrders,
    stockLevels,
    stockLocations,
    users
} from '../db/schema';

export const useSystem = () => {
    const router = useRouter();

    const factoryReset = async () => {
        try {
            // In SQLite, we can just delete from all tables or drop/recreate.
            // Using a transaction to clear everything except maybe the system itself?
            // Actually, a true factory reset should probably delete the DB file and restart.

            await db.transaction(async (tx) => {
                await tx.delete(salesOrderItems);
                await tx.delete(payments);
                await tx.delete(salesOrders);
                await tx.delete(stockLevels);
                await tx.delete(products);
                await tx.delete(expenses);
                await tx.delete(customers);
                await tx.delete(notifications);
                await tx.delete(productCategories);
                await tx.delete(stockLocations);
                await tx.delete(users);
            });

            Alert.alert(
                'System Reset',
                'All data has been cleared. The app will now restart to re-seed default settings.',
                [{ text: 'OK', onPress: () => Updates.reloadAsync() }]
            );
            return true;
        } catch (error) {
            console.error('Factory reset failed:', error);
            Alert.alert('Error', 'Failed to reset system data.');
            return false;
        }
    };

    const importDatabase = async () => {
        if (Platform.OS === 'web') {
            Alert.alert('Not Supported', 'Database import is only supported on mobile devices.');
            return false;
        }

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/x-sqlite3', // Standard for .db or .sqlite files
                copyToCacheDirectory: true,
            });

            if (result.canceled) return false;

            const pickedFile = result.assets[0];

            // Expo SQLite database location on Android/iOS
            const dbFolder = `${FileSystem.documentDirectory}SQLite/`;
            const dbPath = `${dbFolder}stock.db`;

            // Ensure the directory exists
            const info = await FileSystem.getInfoAsync(dbFolder);
            if (!info.exists) {
                await FileSystem.makeDirectoryAsync(dbFolder, { intermediates: true });
            }

            // Copy the picked file to the internal database location
            await FileSystem.copyAsync({
                from: pickedFile.uri,
                to: dbPath,
            });

            Alert.alert(
                'Import Successful',
                'Business workspace has been restored. The application will restart to load the new data.',
                [{ text: 'Restart Now', onPress: () => Updates.reloadAsync() }]
            );
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            Alert.alert('Import Failed', 'The selected file is not a valid workspace database.');
            return false;
        }
    };

    return {
        factoryReset,
        importDatabase,
    };
};
