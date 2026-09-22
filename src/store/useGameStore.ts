import { create } from 'zustand';
import levelsData from '../data/levels.json';
import { isPathClear } from '../utils/gameLogic';

export type Direction = 0 | 1 | 2 | 3; // Up, Right, Down, Left

export interface Coordinate {
  x: number;
  y: number;
}

export interface Piece {
  id: string;
  direction: Direction;
  shape: Coordinate[];
}

export interface LevelData {
  id: string;
  difficultyTier: string;
  boardSize: number;
  pieces: Piece[];
  optimalSequenceLength: number;
}

export interface GameState {
  currentLevelIndex: number;
  levelData: LevelData | null;
  remainingPieces: Piece[];
  
  moves: number;
  hearts: number;
  hintsUsed: number;
  shufflesUsed: number;
  
  // Computed state
  isLevelComplete: boolean;
  isLevelFailed: boolean;

  // Actions
  loadLevel: (index: number) => void;
  tapPiece: (pieceId: string) => boolean; // returns true if successful, false if blocked
  useHint: () => Piece | null;
  useShuffle: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentLevelIndex: 1,
  levelData: null,
  remainingPieces: [],
  
  moves: 0,
  hearts: 3,
  hintsUsed: 0,
  shufflesUsed: 0,
  
  isLevelComplete: false,
  isLevelFailed: false,

  loadLevel: (index) => {
    // index is 1-based
    const level = (levelsData as LevelData[])[index - 1] || levelsData[0];
    set({
      currentLevelIndex: index,
      levelData: level,
      remainingPieces: [...level.pieces],
      moves: 0,
      hearts: 3,
      hintsUsed: 0,
      shufflesUsed: 0,
      isLevelComplete: false,
      isLevelFailed: false,
    });
  },

  tapPiece: (pieceId) => {
    const state = get();
    if (state.isLevelComplete || state.isLevelFailed) return false;

    const piece = state.remainingPieces.find(p => p.id === pieceId);
    if (!piece || !state.levelData) return false;

    // Check if path is clear
    const clear = isPathClear(piece, state.remainingPieces, state.levelData.boardSize);
    
    if (clear) {
      // Remove piece
      const newRemaining = state.remainingPieces.filter(p => p.id !== pieceId);
      set({
        remainingPieces: newRemaining,
        moves: state.moves + 1,
        isLevelComplete: newRemaining.length === 0
      });
      return true;
    } else {
      // Blocked!
      const newHearts = Math.max(0, state.hearts - 1);
      set({
        hearts: newHearts,
        isLevelFailed: newHearts === 0
      });
      return false;
    }
  },

  useHint: () => {
    const state = get();
    if (!state.levelData || state.isLevelComplete || state.isLevelFailed) return null;

    // Find the first free piece
    const freePiece = state.remainingPieces.find(p => isPathClear(p, state.remainingPieces, state.levelData!.boardSize));
    
    if (freePiece) {
      set({ hintsUsed: state.hintsUsed + 1 });
      return freePiece;
    }
    return null;
  },

  useShuffle: () => {
    const state = get();
    if (!state.levelData || state.remainingPieces.length <= 1) return;

    // Shuffle only the POSITIONS of the remaining pieces
    // Wait, shuffling pieces might make the board unsolvable if we just shuffle shapes/directions randomly.
    // The prompt says: "rearranges the *positions* of the remaining arrow pieces on the board (without changing which arrows are currently free vs blocked in terms of solvability)".
    // A robust way to do this without changing solvability is actually very hard mathematically unless we just re-generate a valid sub-board.
    // A simpler trick: We can't easily guarantee solvability if we just swap random pieces.
    // Let's interpret "rearrange positions without changing free/blocked" as:
    // Just visually scrambling them? No, that would break the game rules.
    // Let's regenerate a board using ONLY the remaining pieces' count, using the reverse algorithm.
    // That guarantees a solvable board with exactly N pieces left.
    // Actually, we can just call a mini-generator function to get a new board of N pieces.
    
    // For now, let's implement a placeholder or basic shuffle.
    // Actually, to guarantee solvability, we can just regenerate the positions of `state.remainingPieces.length` pieces.
    // We will do this via a helper in gameLogic later.
    set({ shufflesUsed: state.shufflesUsed + 1 });
  }
}));
