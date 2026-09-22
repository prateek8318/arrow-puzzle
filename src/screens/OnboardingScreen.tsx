import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { PrimaryButton } from '../components/UI/PrimaryButton';
import { useUserStore } from '../store/useUserStore';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Tap Away Arrows',
    description: 'Tap an arrow to clear it from the board. It will fly in the direction it points.',
  },
  {
    id: 2,
    title: 'Find the Free Path',
    description: 'An arrow can only be removed if its path is completely unblocked by other pieces.',
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
          {/* Placeholder for animation/image */}
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageText}>[Animation {slide.id}]</Text>
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
        <PrimaryButton 
          title="Skip" 
          type="secondary"
          onPress={handleComplete}
          style={styles.skipButton}
          textStyle={styles.skipText}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    width: 200,
    height: 200,
    backgroundColor: '#f1f5f9',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  imageText: {
    color: '#94a3b8',
    fontWeight: 'bold',
  },
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
