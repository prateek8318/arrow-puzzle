import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, Switch, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useUserStore } from '../store/useUserStore';
import { PrimaryButton } from '../components/UI/PrimaryButton';
import { SoundManager } from '../utils/SoundManager';

export const SettingsScreen = ({ navigation }: any) => {
  const settings = useUserStore(state => state.settings);
  const updateSettings = useUserStore(state => state.updateSettings);
  const resetProgress = useUserStore(state => state.resetProgress);

  const handleReset = () => {
    Alert.alert(
      "Reset Progress",
      "Are you sure you want to reset all your unlocked levels and stars? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: () => {
            resetProgress();
            SoundManager.playClick();
          }
        }
      ]
    );
  };

  const SettingRow = ({ label, value, onToggle }: any) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch 
        value={value} 
        onValueChange={onToggle}
        trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M19 12H5M12 19l-7-7 7-7"/>
          </Svg>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <SettingRow 
            label="Sound Effects" 
            value={settings.soundEnabled} 
            onToggle={(val: boolean) => {
              updateSettings({ soundEnabled: val });
              SoundManager.setSfxEnabled(val);
            }} 
          />
          <View style={styles.divider} />
          <SettingRow 
            label="Background Music" 
            value={settings.musicEnabled} 
            onToggle={(val: boolean) => {
              updateSettings({ musicEnabled: val });
              SoundManager.setMusicEnabled(val);
            }} 
          />
          <View style={styles.divider} />
          <SettingRow 
            label="Haptic Feedback" 
            value={settings.hapticsEnabled} 
            onToggle={(val: boolean) => updateSettings({ hapticsEnabled: val })} 
          />
        </View>

        <View style={styles.section}>
          <PrimaryButton 
            title="Reset Progress" 
            type="danger" 
            onPress={handleReset} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    padding: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  }
});
