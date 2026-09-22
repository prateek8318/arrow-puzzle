import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { PrimaryButton } from '../components/UI/PrimaryButton';
import Svg, { Path } from 'react-native-svg';
import { useUserStore } from '../store/useUserStore';
import { SoundManager } from '../utils/SoundManager';
import { Haptics } from '../utils/Haptics';

export const HomeScreen = ({ navigation }: any) => {
  const settings = useUserStore(state => state.settings);
  const updateSettings = useUserStore(state => state.updateSettings);

  const toggleSound = () => {
    const newState = !settings.soundEnabled;
    updateSettings({ soundEnabled: newState });
    SoundManager.setSfxEnabled(newState);
    Haptics.triggerSelection(settings.hapticsEnabled);
  };

  const playClick = () => {
    SoundManager.playClick();
    Haptics.triggerSelection(settings.hapticsEnabled);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Simple Logo Placeholder */}
        <View style={styles.logoContainer}>
          <Svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 2L12 22M12 2L5 9M12 2L19 9" />
          </Svg>
          <Text style={styles.title}>Tap Away{'\n'}Arrows</Text>
        </View>

        <View style={styles.buttons}>
          <PrimaryButton 
            title="PLAY" 
            onPress={() => {
              playClick();
              navigation.navigate('Gameplay', { levelId: useUserStore.getState().unlockedLevels });
            }}
            style={styles.mainButton}
          />
          <PrimaryButton 
            title="LEVELS" 
            type="secondary"
            onPress={() => {
              playClick();
              navigation.navigate('LevelSelect');
            }}
            style={styles.subButton}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={toggleSound} style={styles.iconButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={settings.soundEnabled ? "#3b82f6" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {settings.soundEnabled ? (
              <Path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>
            ) : (
              <Path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>
            )}
          </Svg>
        </Pressable>

        <Pressable onPress={() => {
          playClick();
          navigation.navigate('Settings');
        }} style={styles.iconButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
            <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
          </Svg>
        </Pressable>
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
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 52,
  },
  buttons: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  mainButton: {
    paddingVertical: 20,
  },
  subButton: {
    paddingVertical: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
  },
  iconButton: {
    width: 56,
    height: 56,
    backgroundColor: '#f1f5f9',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
