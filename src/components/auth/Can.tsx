import { useAuth } from '@/src/hooks/useAuth';
import React from 'react';

interface CanProps {
    perform: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Component to conditionally render children based on user permissions.
 * Example: <Can perform="delete-product"> <Button ... /> </Can>
 */
export const Can: React.FC<CanProps> = ({ perform, children, fallback = null }) => {
    const hasPermission = useAuth(state => state.hasPermission(perform));

    if (hasPermission) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
