import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import { PrimaryButton } from '../UI/PrimaryButton';

interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  visible, onResume, onRestart, onHome
}) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
        <Animated.View entering={SlideInDown.springify()} style={styles.container}>
          <Text style={styles.title}>Paused</Text>
          <View style={styles.buttons}>
            <PrimaryButton title="Resume" onPress={onResume} style={{ marginBottom: 12 }} />
            <PrimaryButton title="Restart" type="secondary" onPress={onRestart} style={{ marginBottom: 12 }} />
            <PrimaryButton title="Exit to Home" type="danger" onPress={onHome} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
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
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 32,
  },
  buttons: {
    width: '100%',
  },
});
