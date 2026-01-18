import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

interface SectionHeaderProps {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, actionLabel, onAction }) => {
    const theme = useTheme();
    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                {title}
            </Text>
            {actionLabel && (
                <Button mode="text" onPress={onAction} labelStyle={styles.actionLabel} compact>
                    {actionLabel}
                </Button>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 16,
        paddingHorizontal: 4,
    },
    title: {
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    actionLabel: {
        fontSize: 14,
    },
});
