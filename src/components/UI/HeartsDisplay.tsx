import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

interface HeartsDisplayProps {
  hearts: number; // 0 to 3
}

export const HeartsDisplay: React.FC<HeartsDisplayProps> = ({ hearts }) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map(index => (
        <Heart key={index} active={hearts >= index} />
      ))}
    </View>
  );
};

const Heart: React.FC<{ active: boolean }> = ({ active }) => {
  const scale = useSharedValue(active ? 1 : 0.3);
  
  React.useEffect(() => {
    if (!active) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 100 }),
        withTiming(0, { duration: 200 })
      );
    } else {
      scale.value = withSpring(1);
    }
  }, [active, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: active ? 1 : 0.3,
  }));

  return (
    <Animated.View style={[styles.heart, style]}>
      <Svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#ef4444" : "#94a3b8"}>
        <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </Svg>
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
    gap: 4,
  },
  heart: {
    width: 24,
    height: 24,
  },
});
