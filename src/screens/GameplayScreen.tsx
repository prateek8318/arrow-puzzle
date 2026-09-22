import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Pressable, Text } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { GameBoard } from '../components/GameBoard';
import { HeartsDisplay } from '../components/UI/HeartsDisplay';
import { MoveCounter } from '../components/UI/MoveCounter';
import { LevelCompleteModal } from '../components/Modals/LevelCompleteModal';
import { PauseModal } from '../components/Modals/PauseModal';
import { LevelFailModal } from '../components/Modals/LevelFailModal';
import Svg, { Path } from 'react-native-svg';
import { SoundManager } from '../utils/SoundManager';
import { Haptics } from '../utils/Haptics';

export const GameplayScreen = ({ navigation, route }: any) => {
  const levelId = route.params?.levelId || 1;
  const loadLevel = useGameStore(state => state.loadLevel);
  const hearts = useGameStore(state => state.hearts);
  const moves = useGameStore(state => state.moves);
  const levelData = useGameStore(state => state.levelData);
  const isLevelComplete = useGameStore(state => state.isLevelComplete);
  const isLevelFailed = useGameStore(state => state.isLevelFailed);
  
  const setLevelStars = useUserStore(state => state.setLevelStars);
  const unlockLevel = useUserStore(state => state.unlockLevel);
  const settings = useUserStore(state => state.settings);

  const [pauseVisible, setPauseVisible] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (!isLevelComplete) {
      setShowComplete(false);
      return;
    }
    const timer = setTimeout(() => setShowComplete(true), 520);
    return () => clearTimeout(timer);
  }, [isLevelComplete]);

  useEffect(() => {
    loadLevel(levelId);
  }, [levelId, loadLevel]);

  useEffect(() => {
    if (isLevelComplete) {
      SoundManager.playWin();
      Haptics.triggerSuccess(settings.hapticsEnabled);
      setLevelStars(levelData!.id, hearts);
      unlockLevel(levelId + 1);
    }
    if (isLevelFailed) {
      SoundManager.playFail();
      Haptics.triggerError(settings.hapticsEnabled);
    }
  }, [isLevelComplete, isLevelFailed, hearts, levelData, levelId, setLevelStars, settings.hapticsEnabled, unlockLevel]);

  const handleNextLevel = () => {
    navigation.replace('Gameplay', { levelId: levelId + 1 });
  };

  const handleReplay = () => {
    setPauseVisible(false);
    loadLevel(levelId);
  };

  const handleHome = () => {
    setPauseVisible(false);
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M19 12H5M12 19l-7-7 7-7"/>
            </Svg>
          </Pressable>
          <MoveCounter moves={moves} />
        </View>

        <HeartsDisplay hearts={hearts} />

        <View style={styles.headerRight}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{levelData?.difficultyTier || 'Easy'}</Text>
          </View>
          <Pressable onPress={() => setPauseVisible(true)} style={styles.iconButton}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
              <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
            </Svg>
          </Pressable>
        </View>
      </View>

      <View style={styles.boardContainer}>
        <GameBoard />
      </View>

      {/* Footer controls (Hint/Shuffle) could go here */}

      <LevelCompleteModal 
        visible={showComplete} 
        moves={moves} 
        heartsRemaining={hearts}
        onNextLevel={handleNextLevel}
        onReplay={handleReplay}
        onHome={handleHome}
      />
      <LevelFailModal
        visible={isLevelFailed}
        onRetry={handleReplay}
        onHome={handleHome}
      />
      <PauseModal
        visible={pauseVisible}
        onResume={() => setPauseVisible(false)}
        onRestart={handleReplay}
        onHome={handleHome}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#4338ca',
    fontWeight: 'bold',
    fontSize: 12,
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
