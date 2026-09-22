import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Piece } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { SoundManager } from '../utils/SoundManager';
import { Haptics } from '../utils/Haptics';

interface ArrowPieceProps {
  piece: Piece;
  cellSize: number;
  isHinted: boolean;
  isExiting: boolean;
  failedTap: number;
}

// Direction mapped to rotation in degrees
const DIRECTIONS = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];

export const ArrowPiece: React.FC<ArrowPieceProps> = ({ piece, cellSize, isHinted, isExiting, failedTap }) => {
  const settings = useUserStore(state => state.settings);
  
  // The origin of the piece (its head)
  const head = piece.shape[0];
  const minX = Math.min(...piece.shape.map(cell => cell.x));
  const minY = Math.min(...piece.shape.map(cell => cell.y));
  const maxX = Math.max(...piece.shape.map(cell => cell.x));
  const maxY = Math.max(...piece.shape.map(cell => cell.y));
  const margin = cellSize * 0.5;
  const width = (maxX - minX + 1) * cellSize + margin * 2;
  const height = (maxY - minY + 1) * cellSize + margin * 2;
  const center = (cell: { x: number; y: number }) => ({ x: (cell.x - minX + 0.5) * cellSize + margin, y: (cell.y - minY + 0.5) * cellSize + margin });
  const tip = center(head);
  const direction = DIRECTIONS[piece.direction];
  const end = { x: tip.x + direction.x * cellSize * 0.35, y: tip.y + direction.y * cellSize * 0.35 };
  const points = [...piece.shape].reverse().map(center);
  const midpoint = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  let shaft = `M${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length - 1; index++) {
    const before = midpoint(points[index - 1], points[index]);
    const after = midpoint(points[index], points[index + 1]);
    shaft += ` L${before.x} ${before.y} Q${points[index].x} ${points[index].y} ${after.x} ${after.y}`;
  }
  if (points.length > 1) shaft += ` L${points[points.length - 1].x} ${points[points.length - 1].y}`;
  shaft += ` L${end.x} ${end.y}`;
  const side = { x: -direction.y, y: direction.x };
  const wing = (sign: number) => `${end.x - direction.x * cellSize * 0.26 + side.x * cellSize * 0.16 * sign} ${end.y - direction.y * cellSize * 0.26 + side.y * cellSize * 0.16 * sign}`;
  const arrowhead = `M${wing(1)} L${end.x} ${end.y} L${wing(-1)}`;
  
  // Animation states
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isHinted) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0, { duration: 500 })
        ),
        -1, // infinite
        true
      );
    } else {
      glowOpacity.value = withTiming(0);
    }
  }, [isHinted, glowOpacity]);

  useEffect(() => {
    if (isExiting) {
      SoundManager.playWhoosh();
      Haptics.triggerSelection(settings.hapticsEnabled);
      const FLY_DIST = cellSize * 24;
      let dx = 0; let dy = 0;
      if (piece.direction === 0) dy = -FLY_DIST;
      if (piece.direction === 1) dx = FLY_DIST;
      if (piece.direction === 2) dy = FLY_DIST;
      if (piece.direction === 3) dx = -FLY_DIST;

      translateX.value = withTiming(dx, { duration: 480, easing: Easing.inOut(Easing.cubic) });
      translateY.value = withTiming(dy, { duration: 480, easing: Easing.inOut(Easing.cubic) });
      opacity.value = withSequence(withTiming(1, { duration: 260 }), withTiming(0, { duration: 220 }));
    }
  }, [isExiting, cellSize, piece.direction, settings.hapticsEnabled, translateX, translateY, opacity]);

  useEffect(() => {
    if (failedTap > 0) {
      SoundManager.playError();
      Haptics.triggerError(settings.hapticsEnabled);
      const SHAKE_DIST = 5;
      const originalX = translateX.value;
      const originalY = translateY.value;
      
      if (piece.direction === 1 || piece.direction === 3) {
        // Shake X
        translateX.value = withSequence(
          withTiming(originalX - SHAKE_DIST, { duration: 40 }),
          withTiming(originalX + SHAKE_DIST, { duration: 40 }),
          withTiming(originalX - SHAKE_DIST, { duration: 40 }),
          withTiming(originalX, { duration: 40 })
        );
      } else {
        // Shake Y
        translateY.value = withSequence(
          withTiming(originalY - SHAKE_DIST, { duration: 40 }),
          withTiming(originalY + SHAKE_DIST, { duration: 40 }),
          withTiming(originalY - SHAKE_DIST, { duration: 40 }),
          withTiming(originalY, { duration: 40 })
        );
      }
    }
  }, [failedTap, piece.direction, settings.hapticsEnabled, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: minX * cellSize - margin,
          top: minY * cellSize - margin,
          width,
          height,
        },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <Animated.View pointerEvents="none" style={[styles.glow, { left: tip.x - cellSize / 2, top: tip.y - cellSize / 2, width: cellSize, height: cellSize }, glowStyle]} />
      <Svg width={width} height={height} pointerEvents="none">
        <Path d={shaft} stroke="#1a202c" strokeWidth={Math.max(1, cellSize * 0.07)} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d={arrowhead} stroke="#1a202c" strokeWidth={Math.max(1, cellSize * 0.07)} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(56, 189, 248, 0.4)', // light blue glow
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#38bdf8',
  },
});
