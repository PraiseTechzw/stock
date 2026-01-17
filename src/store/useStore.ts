import { create } from 'zustand';

interface User {
    id: number;
    username: string;
    role: 'admin' | 'sales' | 'warehouse';
}

interface AppState {
    user: User | null;
    currentLocationId: number | null;
    setUser: (user: User | null) => void;
    setCurrentLocationId: (id: number | null) => void;
    logout: () => void;
}

export const useStore = create<AppState>((set) => ({
    user: null, // Default to null for now, implement login later
    currentLocationId: null,
    setUser: (user) => set({ user }),
    setCurrentLocationId: (id) => set({ currentLocationId: id }),
    logout: () => set({ user: null, currentLocationId: null }),
}));
