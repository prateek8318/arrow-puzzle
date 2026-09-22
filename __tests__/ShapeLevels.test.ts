import levels from '../src/data/levels.json';
import { useGameStore } from '../src/store/useGameStore';
import { isPathClear } from '../src/utils/gameLogic';
import { LevelData } from '../src/store/useGameStore';

test('heart board handles blocked taps and clears to the mask boundary', () => {
  const allLevels = levels as unknown as LevelData[];
  const heartIndex = allLevels.findIndex(level => level.shapeTemplate === 'heart' &&
    level.pieces.some(piece => !isPathClear(piece, level.pieces, level.mask)));
  expect(heartIndex).toBeGreaterThanOrEqual(0);
  const level = allLevels[heartIndex];
  useGameStore.getState().loadLevel(heartIndex + 1);
  const blocked = level.pieces.find(piece => !isPathClear(piece, level.pieces, level.mask));
  expect(blocked).toBeDefined();
  expect(useGameStore.getState().tapPiece(blocked!.id)).toBe(false);
  expect(useGameStore.getState().hearts).toBe(2);
  expect(useGameStore.getState().isLevelFailed).toBe(false);

  for (const piece of level.pieces) {
    expect(isPathClear(piece, useGameStore.getState().remainingPieces, level.mask)).toBe(true);
    expect(useGameStore.getState().tapPiece(piece.id)).toBe(true);
  }
  expect(useGameStore.getState().remainingPieces).toHaveLength(0);
  expect(useGameStore.getState().isLevelComplete).toBe(true);
  expect(useGameStore.getState().moves).toBe(level.pieces.length);
});
