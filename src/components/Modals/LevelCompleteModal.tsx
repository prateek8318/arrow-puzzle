import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { PrimaryButton } from '../UI/PrimaryButton';
import Svg, { Path } from 'react-native-svg';

interface LevelCompleteModalProps {
  visible: boolean;
  moves: number;
  heartsRemaining: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  visible, moves, heartsRemaining, onNextLevel, onReplay, onHome
}) => {
  if (!visible) return null;

  const stars = heartsRemaining; // 3 hearts = 3 stars, 2 = 2, 1 = 1. (0 = failed, wouldn't show this modal)

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
        <Animated.View entering={SlideInDown.springify()} style={styles.container}>
          <Text style={styles.title}>Level Complete!</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3].map(index => (
              <Animated.View key={index} entering={ZoomIn.delay(index * 200).springify()}>
                <Svg width="48" height="48" viewBox="0 0 24 24" fill={stars >= index ? "#fbbf24" : "#e2e8f0"}>
                  <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </Svg>
              </Animated.View>
            ))}
          </View>
          
          <Text style={styles.stats}>Moves: {moves}</Text>

          <View style={styles.buttons}>
            <PrimaryButton title="Next Level" onPress={onNextLevel} style={{ marginBottom: 12 }} />
            <View style={styles.row}>
              <PrimaryButton title="Replay" type="secondary" onPress={onReplay} style={{ flex: 1, marginRight: 6 }} />
              <PrimaryButton title="Home" type="secondary" onPress={onHome} style={{ flex: 1, marginLeft: 6 }} />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  stats: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 32,
    fontWeight: '600',
  },
  buttons: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  }
});
