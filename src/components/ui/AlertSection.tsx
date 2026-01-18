import { HugeiconsIcon } from '@hugeicons/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

interface AlertSectionProps {
    title: string;
    description: string;
    icon: any; // Hugeicons icon object
    color?: string;
    backgroundColor?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: any;
}

export const AlertSection: React.FC<AlertSectionProps> = ({
    title,
    description,
    icon,
    color,
    backgroundColor,
    actionLabel,
    onAction,
    style,
}) => {
    const theme = useTheme();
    const activeColor = color || theme.colors.error;
    const activeBgColor = backgroundColor || theme.colors.errorContainer;

    return (
        <Card
            style={[styles.card, { backgroundColor: activeBgColor, borderColor: activeColor + '30' }, style]}
            onPress={onAction}
            mode="outlined"
        >
            <Card.Content style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: activeColor + '20' }]}>
                    <HugeiconsIcon icon={icon} size={20} color={activeColor} />
                </View>
                <View style={styles.textContainer}>
                    <Text variant="titleSmall" style={{ color: activeColor, fontWeight: 'bold' }}>
                        {title}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{description}</Text>
                </View>
                {actionLabel && (
                    <Button
                        mode="contained"
                        onPress={onAction}
                        style={{ borderRadius: 8, backgroundColor: activeColor }}
                        labelStyle={{ color: '#fff', fontSize: 12 }}
                        compact
                    >
                        {actionLabel}
                    </Button>
                )}
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 24,
        borderRadius: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
    },
});
