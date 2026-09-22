import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/UI/PrimaryButton';
import { useUserStore } from '../store/useUserStore';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Tap Away Arrows',
    description: 'Tap an arrow and watch it follow its winding line before it slips away.',
  },
  {
    id: 2,
    title: 'Find the Free Path',
    description: 'An arrow can leave only when the route ahead of its tip is clear.',
  },
  {
    id: 3,
    title: 'Clear the Board',
    description: 'Clear all arrows to win the level! Watch out, blocked taps cost you hearts.',
  }
];

export const OnboardingScreen = ({ navigation }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const setHasSeenOnboarding = useUserStore(state => state.setHasSeenOnboarding);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setHasSeenOnboarding(true);
    navigation.replace('Home');
  };

  const slide = SLIDES[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          key={slide.id}
          entering={FadeInRight} 
          exiting={FadeOutLeft}
          style={styles.slide}
        >
          <View style={styles.imagePlaceholder}>
            <View style={styles.orbit} />
            <LottieView source={require('../assets/animations/onboarding-cdn.json')}
              autoPlay loop style={styles.cdnAccent} />
            <LottieView
              source={require('../assets/animations/arrow.json')}
              autoPlay loop style={styles.lottie}
            />
            <Text style={styles.slideNumber}>0{slide.id} / 03</Text>
          </View>
          
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View 
              key={index} 
              style={[styles.dot, currentIndex === index && styles.dotActive]} 
            />
          ))}
        </View>
        <PrimaryButton 
          title={currentIndex === SLIDES.length - 1 ? "Let's Play" : "Next"} 
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8ff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    width: width,
    padding: 32,
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: width - 64,
    height: 250,
    backgroundColor: '#101b3c',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  orbit: { position: 'absolute', width: 190, height: 190, borderRadius: 95, borderWidth: 1, borderColor: '#34466d' },
  cdnAccent: { position: 'absolute', top: 15, width: '90%', height: 38, opacity: 0.35 },
  lottie: { width: 200, height: 175 },
  slideNumber: { position: 'absolute', bottom: 22, color: '#8da8ee', fontWeight: '900', letterSpacing: 2 },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 32,
    paddingBottom: 48,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  dotActive: {
    backgroundColor: '#3b82f6',
    width: 24,
  },
  skipButton: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    marginTop: 8,
  },
  skipText: {
    color: '#94a3b8',
    fontSize: 16,
  }
});
