import { HugeiconsIcon } from '@hugeicons/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

interface MetricCardProps {
    title: string;
    value: string | number;
    label: string;
    icon: any; // Hugeicons icon object
    color?: string;
    onPress?: () => void;
    style?: any;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    label,
    icon,
    color,
    onPress,
    style
}) => {
    const theme = useTheme();
    const primaryColor = color || theme.colors.primary;

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }, style]} onPress={onPress}>
            <Card.Content style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: primaryColor + '15' }]}>
                    <HugeiconsIcon icon={icon} size={20} color={primaryColor} />
                </View>
                <Text variant="headlineSmall" style={[styles.value, { color: theme.colors.onSurface }]}>{value}</Text>
                <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    content: {
        padding: 16,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    value: {
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    label: {
        marginTop: 2,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontSize: 10,
    },
});
