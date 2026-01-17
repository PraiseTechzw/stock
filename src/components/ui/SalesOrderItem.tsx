import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

interface SalesOrderItemProps {
    orderId: number;
    customerName: string;
    totalAmount: number;
    status?: string;
}

export const SalesOrderItem: React.FC<SalesOrderItemProps> = ({
    orderId,
    customerName,
    totalAmount,
    status
}) => {
    const router = useRouter();
    const theme = useTheme();

    return (
        <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push(`/sales/${orderId}` as any)}
        >
            <Card.Title
                title={`Order #${orderId}`}
                titleStyle={{ fontWeight: 'bold', color: theme.colors.onSurface }}
                subtitle={customerName}
                subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
                right={() => (
                    <Text variant="titleMedium" style={[styles.amount, { color: theme.colors.primary }]}>
                        ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Text>
                )}
            />
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 8,
        borderRadius: 12,
        elevation: 1,
    },
    amount: {
        marginRight: 16,
        fontWeight: 'bold',
    },
});
