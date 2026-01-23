import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface SubHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    rightAction?: React.ReactNode;
    style?: ViewStyle;
}

export const SubHeader: React.FC<SubHeaderProps> = ({
    title,
    subtitle,
    onBack,
    rightAction,
    style
}) => {
    const theme = useTheme();
    const router = useRouter();

    const handleBack = onBack || (() => router.back());

    return (
        <View style={[styles.headerContainer, style]}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={handleBack} style={styles.headerTitleGroup}>
                    <View style={styles.backBtnBox}>
                        <HugeiconsIcon icon={ArrowLeft02Icon} size={28} color="#000" />
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text variant="headlineMedium" style={styles.title} numberOfLines={1}>{title}</Text>
                        {subtitle && <Text variant="bodyLarge" style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
                    </View>
                </TouchableOpacity>
                {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    headerTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backBtnBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -10, // Pull closer to edge for better visual alignment
    },
    title: {
        fontWeight: '900',
        letterSpacing: -0.5,
        color: '#000',
    },
    subtitle: {
        color: '#64748b',
        fontWeight: '600',
        marginTop: -2,
    },
    rightAction: {
        marginLeft: 12,
    },
});
