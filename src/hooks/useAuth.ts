import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
    id: number;
    username: string;
    fullName: string | null;
    role: UserRole;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
    hasPermission: (permission: string) => boolean;
}

export const useAuth = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
            hasPermission: (permission) => {
                const user = get().user;
                if (!user) return false;

                // Admin has all permissions
                if (user.role === 'admin') return true;

                const permissions: Record<UserRole, string[]> = {
                    admin: ['*'],
                    manager: [
                        'view-reports',
                        'manage-inventory',
                        'create-sales',
                        'view-customers',
                        'add-expense'
                    ],
                    staff: [
                        'view-inventory',
                        'create-sales',
                        'view-customers'
                    ],
                };

                const userPermissions = permissions[user.role] || [];
                return userPermissions.includes(permission) || userPermissions.includes('*');
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
