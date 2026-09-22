import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useUserStore } from '../store/useUserStore';
import levelsData from '../data/levels.json';
import { SoundManager } from '../utils/SoundManager';

export const LevelSelectScreen = ({ navigation }: any) => {
  const unlockedLevels = useUserStore(state => state.unlockedLevels);
  const levelStars = useUserStore(state => state.levelStars);

  const handleLevelPress = (index: number) => {
    if (index <= unlockedLevels) {
      SoundManager.playClick();
      navigation.navigate('Gameplay', { levelId: index });
    } else {
      SoundManager.playError();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M19 12H5M12 19l-7-7 7-7"/>
          </Svg>
        </Pressable>
        <Text style={styles.title}>Select Level</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {levelsData.map((level, i) => {
          const index = i + 1;
          const isUnlocked = index <= unlockedLevels;
          const stars = levelStars[level.id] || 0;

          return (
            <Pressable
              key={level.id}
              style={[styles.levelCard, !isUnlocked && styles.levelCardLocked]}
              onPress={() => handleLevelPress(index)}
            >
              <Text style={[styles.levelText, !isUnlocked && styles.levelTextLocked]}>
                {index}
              </Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3].map(s => (
                  <Svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= stars ? "#fbbf24" : (isUnlocked ? "#cbd5e1" : "transparent")}>
                    {isUnlocked && <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>}
                  </Svg>
                ))}
              </View>
              {!isUnlocked && (
                <View style={styles.lockOverlay}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z"></Path>
                    <Path d="M7 11V7a5 5 0 0110 0v4"></Path>
                  </Svg>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#f1f5f9',
    borderRadius: 22,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
    justifyContent: 'center',
  },
  levelCard: {
    width: 80,
    height: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  levelCardLocked: {
    backgroundColor: '#f8fafc',
    borderColor: '#f1f5f9',
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  levelTextLocked: {
    color: '#cbd5e1',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
  }
});
