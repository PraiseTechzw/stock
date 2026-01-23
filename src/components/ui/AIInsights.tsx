import { ChartBreakoutSquareIcon, MagicWand01Icon, PackageIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface AIInsightsProps {
    metrics: any;
}

export const AIInsights = ({ metrics }: AIInsightsProps) => {
    const theme = useTheme();

    const insights = useMemo(() => {
        if (!metrics) return [];

        const list = [];

        // 1. Profitability Insight
        if (metrics.margin > 30) {
            list.push({
                title: 'High Margin Detected',
                description: `Your ${metrics.margin.toFixed(0)}% margin is 12% higher than average for this category.`,
                icon: ChartBreakoutSquareIcon,
                color: '#10b981'
            });
        }

        // 2. Stock Health
        if (metrics.lowStockCount > 0) {
            list.push({
                title: 'Inventory Alert',
                description: `${metrics.lowStockCount} items are nearing stockout. Reorder now to avoid lost sales.`,
                icon: MagicWand01Icon,
                color: '#f59e0b'
            });
        } else {
            list.push({
                title: 'Optimal Stocking',
                description: 'Your inventory levels are healthy. No immediate risk of stockouts.',
                icon: SparklesIcon,
                color: '#6366f1'
            });
        }

        // 3. Revenue Velocity
        if (metrics.totalRevenue > 1000) {
            list.push({
                title: 'Strong Revenue Growth',
                description: 'Total revenue has crossed a major milestone. Consider scaling your operations.',
                icon: PackageIcon,
                color: '#8b5cf6'
            });
        }

        return list;
    }, [metrics]);

    if (insights.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <HugeiconsIcon icon={SparklesIcon} size={18} color={theme.colors.primary} />
                <Text variant="labelLarge" style={[styles.headerText, { color: theme.colors.primary }]}>AI BUSINESS INSIGHTS</Text>
            </View>

            <View style={styles.insightsList}>
                {insights.map((insight, index) => (
                    <Animated.View
                        key={index}
                        entering={FadeInRight}
                    >
                        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
                            <Card.Content style={styles.cardContent}>
                                <View style={[styles.iconBox, { backgroundColor: insight.color + '15' }]}>
                                    <HugeiconsIcon icon={insight.icon} size={20} color={insight.color} />
                                </View>
                                <View style={styles.textBox}>
                                    <Text variant="titleSmall" style={styles.title}>{insight.title}</Text>
                                    <Text variant="bodySmall" style={styles.description}>{insight.description}</Text>
                                </View>
                            </Card.Content>
                        </Card>
                    </Animated.View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    headerText: {
        fontWeight: '900',
        letterSpacing: 1.2,
        fontSize: 10,
    },
    insightsList: {
        gap: 12,
    },
    card: {
        borderRadius: 20,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textBox: {
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    description: {
        opacity: 0.7,
        fontSize: 12,
    }
});
