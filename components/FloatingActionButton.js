import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, withDelay, withSpring, withTiming } from 'react-native-reanimated';

export default function FloatingActionButton({ isExpanded, index, buttonLabel, onPress }) {
    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
    const OFFSET = 60;
    const SPRING_CONFIG = {
        duration: 1200,
        overshootClamping: true,
        dampingRatio: 0.8
    };

    const animatedStyles = useAnimatedStyle(() => {
        const moveDistance = isExpanded.value ? OFFSET * index : 0;
        const translateValue = withSpring(-moveDistance, SPRING_CONFIG);
        const delay = index * 100;
        const scaleValue = isExpanded.value ? 1 : 0;

        return {
            transform: [
                { translateY: translateValue },
                { scale: withDelay(delay, withTiming(scaleValue)) }
            ]
        };
    });

    return (
        <AnimatedPressable
            onPress={onPress}
            style={[animatedStyles, styles.shadow, styles.button]}
        >
            <Text style={styles.content}>{buttonLabel}</Text>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#171717',
        shadowOffset: { width: -0.5, height: 3.5 },
        shadowOpacity: 0.2,
        shadowRadius: 3
    },
    button: {
        width: 120,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#06402BBF',
        color: '#f8f9ff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        zIndex: 1
    }
});
