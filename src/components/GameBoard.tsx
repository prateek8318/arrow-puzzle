import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { ArrowPiece } from './ArrowPiece';
import { Piece } from '../store/useGameStore';

const { width } = Dimensions.get('window');
const DIRECTIONS = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
function segmentDistanceSquared(px: number, py: number, a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return (px - a.x - t * dx) ** 2 + (py - a.y - t * dy) ** 2;
}
function findArrowAt(pieces: Piece[], x: number, y: number, cellSize: number): Piece | undefined {
  let closest: Piece | undefined;
  let closestDistance = Math.max(6, cellSize * 0.2) ** 2;
  const center = (c: { x: number; y: number }) => ({ x: (c.x + 0.5) * cellSize, y: (c.y + 0.5) * cellSize });
  for (const piece of pieces) {
    const points = [...piece.shape].reverse().map(center);
    const head = center(piece.shape[0]);
    const dir = DIRECTIONS[piece.direction];
    const tip = { x: head.x + dir.x * cellSize * 0.35, y: head.y + dir.y * cellSize * 0.35 };
    points.push(tip);
    const side = { x: -dir.y, y: dir.x };
    const wing = (sign: number) => ({ x: tip.x - dir.x * cellSize * 0.26 + side.x * cellSize * 0.16 * sign, y: tip.y - dir.y * cellSize * 0.26 + side.y * cellSize * 0.16 * sign });
    for (let i = 1; i < points.length; i++) {
      const distance = segmentDistanceSquared(x, y, points[i - 1], points[i]);
      if (distance < closestDistance) { closestDistance = distance; closest = piece; }
    }
    for (const end of [wing(1), wing(-1)]) {
      const distance = segmentDistanceSquared(x, y, tip, end);
      if (distance < closestDistance) { closestDistance = distance; closest = piece; }
    }
  }
  return closest;
}

export const GameBoard: React.FC = () => {
  const remainingPieces = useGameStore(state => state.remainingPieces);
  const levelData = useGameStore(state => state.levelData);
  const tapPiece = useGameStore(state => state.tapPiece);
  const [exitingPieces, setExitingPieces] = useState<typeof remainingPieces>([]);
  const [failedTap, setFailedTap] = useState({ id: '', count: 0 });
  useEffect(() => { setExitingPieces([]); }, [levelData?.id]);

  const handleTap = (pieceId: string) => {
    const piece = remainingPieces.find(item => item.id === pieceId);
    const cleared = tapPiece(pieceId);
    if (cleared && piece) {
      setExitingPieces(current => [...current, piece]);
      setTimeout(() => setExitingPieces(current => current.filter(item => item.id !== pieceId)), 500);
    }
    if (!cleared) setFailedTap(current => ({ id: pieceId, count: current.count + 1 }));
    return cleared;
  };

  const boardSize = levelData?.boardSize || 5;

  // Calculate cell size based on screen width with some padding
  const padding = 20;
  const boardDisplaySize = width - (padding * 2);
  const cellSize = boardDisplaySize / boardSize;

  // Render the dot grid background
  const renderDotGrid = () => {
    const dots = [];
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        dots.push(
          <View
            key={`dot-${r}-${c}`}
            style={[
              styles.dot,
              {
                left: c * cellSize + cellSize / 2 - 2,
                top: r * cellSize + cellSize / 2 - 2,
              }
            ]}
          />
        );
      }
    }
    return dots;
  };

  return (
    <View
      style={[styles.container, { width: boardDisplaySize, height: boardDisplaySize }]}
      onStartShouldSetResponder={event => !!findArrowAt(remainingPieces, event.nativeEvent.locationX, event.nativeEvent.locationY, cellSize)}
      onResponderRelease={event => {
        const piece = findArrowAt(remainingPieces, event.nativeEvent.locationX, event.nativeEvent.locationY, cellSize);
        if (piece) handleTap(piece.id);
      }}
    >
      {renderDotGrid()}
      
      {[...remainingPieces, ...exitingPieces].map(piece => (
        <ArrowPiece
          key={piece.id}
          piece={piece}
          cellSize={cellSize}
          isHinted={false} // Todo hook up hint state
          isExiting={exitingPieces.some(item => item.id === piece.id)}
          failedTap={failedTap.id === piece.id ? failedTap.count : 0}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden', // to hide flying pieces gracefully if needed, or leave visible
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0', // light grey dots
  },
});
