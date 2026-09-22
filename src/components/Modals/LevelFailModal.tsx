import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import { PrimaryButton } from '../UI/PrimaryButton';
import Svg, { Path } from 'react-native-svg';

interface LevelFailModalProps {
  visible: boolean;
  onRetry: () => void;
  onHome: () => void;
}

export const LevelFailModal: React.FC<LevelFailModalProps> = ({
  visible, onRetry, onHome
}) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
        <Animated.View entering={SlideInDown.springify()} style={styles.container}>
          <Svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
            <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <Path d="M12 9v4"/>
            <Path d="M12 17h.01"/>
          </Svg>
          
          <Text style={styles.title}>Out of Moves!</Text>
          <Text style={styles.subtitle}>You've lost all your hearts.</Text>

          <View style={styles.buttons}>
            <PrimaryButton title="Try Again" onPress={onRetry} style={{ marginBottom: 12 }} />
            <PrimaryButton title="Exit to Home" type="secondary" onPress={onHome} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  buttons: {
    width: '100%',
  },
});
