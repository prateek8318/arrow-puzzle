import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { useUserStore } from '../store/useUserStore';

export const SplashScreen = ({ navigation }: any) => {
  const hasSeenOnboarding = useUserStore(state => state.hasSeenOnboarding);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Navigate after 2 seconds or when animation finishes
    const timer = setTimeout(() => {
      finishSplash();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const finishSplash = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (hasSeenOnboarding) {
        navigation.replace('Home');
      } else {
        navigation.replace('Onboarding');
      }
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* 
        Note: The actual lottie file should be placed at src/assets/animations/splash-logo.json 
        Using a fallback render if it fails or requires actual JSON.
      */}
      <LottieView
        source={require('../assets/animations/splash-logo.json')}
        autoPlay
        loop={false}
        onAnimationFinish={finishSplash}
        style={styles.animation}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  }
});
