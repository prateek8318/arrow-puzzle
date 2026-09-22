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
        <View style={styles.logoContainer}>
          <Text style={styles.eyebrow}>THE ULTIMATE PATH PUZZLE</Text>
          <View style={styles.hero}>
            <View style={styles.heroRing} />
            <Svg width="220" height="220" viewBox="0 0 220 220" fill="none" stroke="#dce7ff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M37 162V72H104V143H177V59M160 76L177 59L194 76" />
              <Path d="M60 183H126V105H76V42M60 59L76 42L92 59" stroke="#8daaff" />
              <Path d="M134 180H185V124M169 140L185 124L201 140" stroke="#58d3bd" />
            </Svg>
            <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>↗  500 LEVELS</Text></View>
          </View>
          <Text style={styles.title}>TAP AWAY{'\n'}<Text style={styles.titleAccent}>ARROWS</Text></Text>
          <Text style={styles.subtitle}>Trace the path. Find the exit. Clear the maze.</Text>
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
    backgroundColor: '#f6f8ff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  eyebrow: { color: '#5064a1', fontSize: 11, fontWeight: '900', letterSpacing: 2.4, marginBottom: 24 },
  hero: { width: 270, height: 270, backgroundColor: '#111d42', borderRadius: 46, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 30, transform: [{ rotate: '-3deg' }], elevation: 12, shadowColor: '#14255a', shadowOpacity: 0.2, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } },
  heroRing: { position: 'absolute', width: 320, height: 320, borderRadius: 160, borderWidth: 1, borderColor: '#334675' },
  heroBadge: { position: 'absolute', bottom: 18, right: 18, backgroundColor: '#e2f9ec', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14 },
  heroBadgeText: { color: '#195b55', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 46,
  },
  titleAccent: { color: '#475fe5' },
  subtitle: { color: '#64718e', marginTop: 12, fontSize: 14, textAlign: 'center' },
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
