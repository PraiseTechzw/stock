import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import * as Crypto from 'expo-crypto';
import { openDatabaseSync } from 'expo-sqlite';
import React, { createContext, useContext, useEffect } from 'react';
import migrations from '../../drizzle/migrations';
import { stockLocations, users } from './schema';

interface DatabaseContextType {
    db: ExpoSQLiteDatabase<typeof schema> | null;
    success: boolean;
    error?: Error;
}

const DatabaseContext = createContext<DatabaseContextType>({
    db: null,
    success: false,
});

export const useDatabase = () => useContext(DatabaseContext);

import * as schema from './schema';

const expoDb = openDatabaseSync('stock.db');
export const db = drizzle(expoDb, { schema });

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => {
    const { success, error } = useMigrations(db, migrations);

    useEffect(() => {
        if (success) {
            (async () => {
                // Seed Locations
                const locations = await db.select().from(stockLocations);
                if (locations.length === 0) {
                    await db.insert(stockLocations).values({
                        name: 'Main Warehouse',
                        description: 'Default storage location',
                    });
                }

                // Seed Default Admin
                const userList = await db.select().from(users);
                if (userList.length === 0) {
                    const passwordHash = await Crypto.digestStringAsync(
                        Crypto.CryptoDigestAlgorithm.SHA256,
                        'admin123'
                    );
                    await db.insert(users).values({
                        username: 'admin',
                        fullName: 'System Administrator',
                        passwordHash: passwordHash,
                        role: 'admin',
                    });
                }
            })();
        }
    }, [success]);

    if (!success) {
        // You might want to show a loading screen or error here
        return null;
    }

    if (error) {
        // Handle migration error
    }

    return (
        <DatabaseContext.Provider value={{ db, success, error }}>
            {children}
        </DatabaseContext.Provider>
    );
};
