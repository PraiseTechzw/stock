import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface FadeViewProps {
    children: React.ReactNode;
    delay?: number;
    style?: ViewStyle;
    scale?: boolean; // If true, adds a scale animation
    duration?: number;
}

export const FadeView = ({
    children,
    delay = 0,
    style,
    scale = false,
    duration = 500,
}: FadeViewProps) => {
    const opacity = useSharedValue(0);
    const scaleValue = useSharedValue(scale ? 0.9 : 1);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration }));
        if (scale) {
            scaleValue.value = withDelay(delay, withSpring(1));
        }
    }, [delay, duration, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scaleValue.value }],
    }));

    return (
        <Animated.View style={[style, animatedStyle]}>
            {children}
        </Animated.View>
    );
};
