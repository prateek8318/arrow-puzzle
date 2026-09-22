import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  darkMode: boolean | 'system';
}

export interface UserState {
  hasSeenOnboarding: boolean;
  unlockedLevels: number;
  levelStars: Record<string, number>; // levelId -> stars (1-3)
  settings: UserSettings;
  
  // Actions
  setHasSeenOnboarding: (val: boolean) => void;
  unlockLevel: (levelIndex: number) => void;
  setLevelStars: (levelId: string, stars: number) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetProgress: () => void;
}

const defaultSettings: UserSettings = {
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
  darkMode: 'system',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      unlockedLevels: 1,
      levelStars: {},
      settings: defaultSettings,

      setHasSeenOnboarding: (val) => set({ hasSeenOnboarding: val }),
      
      unlockLevel: (levelIndex) => set((state) => ({
        unlockedLevels: Math.max(state.unlockedLevels, levelIndex)
      })),
      
      setLevelStars: (levelId, stars) => set((state) => ({
        levelStars: {
          ...state.levelStars,
          [levelId]: Math.max(state.levelStars[levelId] || 0, stars)
        }
      })),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      resetProgress: () => set({
        unlockedLevels: 1,
        levelStars: {},
      }),
    }),
    {
      name: 'arrow-puzzle-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
