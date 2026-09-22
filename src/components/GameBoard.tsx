import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useGameStore } from '../store/useGameStore';
import { ArrowPiece } from './ArrowPiece';
import { Piece } from '../store/useGameStore';
import { isInsideMask } from '../utils/boardGeometry';

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
function exitDistance(piece: Piece, boardSize: number) {
  if (piece.direction === 0) return Math.max(...piece.shape.map(cell => cell.y)) + 2;
  if (piece.direction === 1) return boardSize - Math.min(...piece.shape.map(cell => cell.x)) + 1;
  if (piece.direction === 2) return boardSize - Math.min(...piece.shape.map(cell => cell.y)) + 1;
  return Math.max(...piece.shape.map(cell => cell.x)) + 2;
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
      setTimeout(() => setExitingPieces(current => current.filter(item => item.id !== pieceId)), 800);
    }
    if (!cleared) setFailedTap(current => ({ id: pieceId, count: current.count + 1 }));
    return cleared;
  };

  const boardSize = levelData?.boardSize || 5;

  // Calculate cell size based on screen width with some padding
  const padding = 20;
  const boardDisplaySize = width - (padding * 2);
  const cellSize = boardDisplaySize / boardSize;
  const zoom = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const pinchStartZoom = useSharedValue(1);
  const pinchStartX = useSharedValue(0);
  const pinchStartY = useSharedValue(0);
  const panStartX = useSharedValue(0);
  const panStartY = useSharedValue(0);

  useEffect(() => {
    zoom.value = 1;
    offsetX.value = 0;
    offsetY.value = 0;
  }, [levelData?.id, zoom, offsetX, offsetY]);

  const zoomGesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .onStart(() => {
        pinchStartZoom.value = zoom.value;
        pinchStartX.value = offsetX.value;
        pinchStartY.value = offsetY.value;
      })
      .onUpdate(event => {
        const next = Math.max(1, Math.min(3, pinchStartZoom.value * event.scale));
        const ratio = next / pinchStartZoom.value;
        const limit = (next - 1) * boardDisplaySize / 2;
        offsetX.value = Math.max(-limit, Math.min(limit, pinchStartX.value + (1 - ratio) * (event.focalX - boardDisplaySize / 2 - pinchStartX.value)));
        offsetY.value = Math.max(-limit, Math.min(limit, pinchStartY.value + (1 - ratio) * (event.focalY - boardDisplaySize / 2 - pinchStartY.value)));
        zoom.value = next;
      });
    const pan = Gesture.Pan()
      .minPointers(2)
      .onStart(() => {
        panStartX.value = offsetX.value;
        panStartY.value = offsetY.value;
      })
      .onUpdate(event => {
        const limit = (zoom.value - 1) * boardDisplaySize / 2;
        offsetX.value = Math.max(-limit, Math.min(limit, panStartX.value + event.translationX));
        offsetY.value = Math.max(-limit, Math.min(limit, panStartY.value + event.translationY));
      });
    return Gesture.Simultaneous(pinch, pan);
  }, [boardDisplaySize, zoom, offsetX, offsetY, pinchStartZoom, pinchStartX, pinchStartY, panStartX, panStartY]);
  const zoomStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }, { scale: zoom.value }],
  }));
  const changeZoom = (factor: number) => {
    const next = Math.max(1, Math.min(3, zoom.value * factor));
    const limit = (next - 1) * boardDisplaySize / 2;
    offsetX.value = withTiming(Math.max(-limit, Math.min(limit, offsetX.value)), { duration: 180 });
    offsetY.value = withTiming(Math.max(-limit, Math.min(limit, offsetY.value)), { duration: 180 });
    zoom.value = withTiming(next, { duration: 180 });
  };

  // Render the dot grid background
  const dots = useMemo(() => {
    const cells = [];
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (!levelData?.mask || !isInsideMask(levelData.mask, c, r)) continue;
        cells.push(
          <View
            key={`dot-${r}-${c}`}
            pointerEvents="none"
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
    return cells;
  }, [levelData, boardSize, cellSize]);

  return (
    <View style={styles.boardShell}>
      <GestureDetector gesture={zoomGesture}>
        <Animated.View collapsable={false} style={[styles.viewport, { width: boardDisplaySize, height: boardDisplaySize }]}>
          <Animated.View style={[{ width: boardDisplaySize, height: boardDisplaySize }, zoomStyle]}>
            <View
              style={[styles.container, { width: boardDisplaySize, height: boardDisplaySize }]}
              onStartShouldSetResponder={event => !!findArrowAt(remainingPieces, event.nativeEvent.locationX, event.nativeEvent.locationY, cellSize)}
              onResponderRelease={event => {
                const piece = findArrowAt(remainingPieces, event.nativeEvent.locationX, event.nativeEvent.locationY, cellSize);
                if (piece) handleTap(piece.id);
              }}
            >
              {dots}
              {[...remainingPieces, ...exitingPieces].map((piece, index) => (
                <ArrowPiece
                  key={`${levelData?.id}-${piece.id}`}
                  piece={piece}
                  cellSize={cellSize}
                  exitDistance={exitDistance(piece, boardSize)}
                  entranceDelay={Math.min((levelData?.pieces.findIndex(item => item.id === piece.id) ?? index) * 12, 500)}
                  isHinted={false}
                  isExiting={exitingPieces.some(item => item.id === piece.id)}
                  failedTap={failedTap.id === piece.id ? failedTap.count : 0}
                />
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
      <View style={styles.zoomControls}>
        <Pressable accessibilityRole="button" accessibilityLabel="Zoom out" onPress={() => changeZoom(1 / 1.4)} style={styles.zoomButton}><Text style={styles.zoomText}>−</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Reset zoom" onPress={() => {
          zoom.value = withTiming(1, { duration: 180 });
          offsetX.value = withTiming(0, { duration: 180 });
          offsetY.value = withTiming(0, { duration: 180 });
        }} style={styles.zoomReset}><Text style={styles.zoomResetText}>1×</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Zoom in" onPress={() => changeZoom(1.4)} style={styles.zoomButton}><Text style={styles.zoomText}>+</Text></Pressable>
      </View>
      <Text style={styles.zoomHelp}>Pinch to zoom · use two fingers to move</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  boardShell: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  viewport: {
    overflow: 'hidden',
  },
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    color: '#1e40af',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 28,
  },
  zoomReset: {
    minWidth: 46,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomResetText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  zoomHelp: {
    marginTop: 6,
    color: '#94a3b8',
    fontSize: 11,
  },
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0', // light grey dots
  },
});
