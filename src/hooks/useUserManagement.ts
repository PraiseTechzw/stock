import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import * as Crypto from 'expo-crypto';
import { db } from '../db/DatabaseProvider';
import { users } from '../db/schema';

export const useUserManagement = () => {
    const { data: allUsers } = useLiveQuery(db.select().from(users));

    const addUser = async (username: string, fullName: string, password: string, role: 'admin' | 'manager' | 'staff') => {
        const passwordHash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            password
        );

        return await db.insert(users).values({
            username: username.toLowerCase(),
            fullName,
            passwordHash,
            role,
        });
    };

    const deleteUser = async (id: number) => {
        return await db.delete(users).where(eq(users.id, id));
    };

    const updateUserRole = async (id: number, role: 'admin' | 'manager' | 'staff') => {
        return await db.update(users)
            .set({ role })
            .where(eq(users.id, id));
    };

    const updatePassword = async (id: number, newPassword: string) => {
        const passwordHash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            newPassword
        );

        return await db.update(users)
            .set({ passwordHash })
            .where(eq(users.id, id));
    };

    return {
        users: allUsers || [],
        addUser,
        deleteUser,
        updateUserRole,
        updatePassword,
    };
};
