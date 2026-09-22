import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

interface MoveCounterProps {
  moves: number;
}

export const MoveCounter: React.FC<MoveCounterProps> = ({ moves }) => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withSpring(1)
    );
  }, [moves, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 12h14M12 5l7 7-7 7" />
      </Svg>
      <Text style={styles.text}>{moves}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
});
