import { Colors } from '@/src/theme/colors';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Card, Text, useTheme } from 'react-native-paper';

interface SalesChartProps {
    title: string;
    data: {
        name: string;
        value: number;
        color?: string;
    }[];
    style?: any;
}

const DASHBOARD_COLORS = [
    Colors.primary,
    Colors.secondary,
    Colors.accent,
    Colors.success,
    Colors.info,
    Colors.warning,
];

export const SalesChart: React.FC<SalesChartProps> = ({ title, data, style }) => {
    const theme = useTheme();
    const chartData = useMemo(() => {
        return data.map((item, index) => ({
            value: item.value,
            text: item.name,
            color: item.color || DASHBOARD_COLORS[index % DASHBOARD_COLORS.length],
        }));
    }, [data]);

    if (data.length === 0) return null;

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }, style]}>
            <Card.Content>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{title}</Text>
                <View style={styles.chartContainer}>
                    <View style={styles.chartWrapper}>
                        <PieChart
                            data={chartData}
                            donut
                            radius={70}
                            innerRadius={50}
                            innerCircleColor={theme.colors.surface}
                            centerLabelComponent={() => (
                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Total</Text>
                                    <Text variant="titleSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                                        {data.reduce((acc, curr) => acc + curr.value, 0)}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                    <View style={styles.chartLegend}>
                        {chartData.map((item: any, i: number) => (
                            <View key={i} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                <View>
                                    <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>{item.text}</Text>
                                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.value} units</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 24,
        borderRadius: 16,
        elevation: 2,
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    chartWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    chartLegend: {
        flex: 1,
        paddingLeft: 24,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 4,
        marginRight: 10,
    },
});
