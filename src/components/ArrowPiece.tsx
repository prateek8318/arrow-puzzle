import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  useAnimatedProps,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Piece } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import { SoundManager } from '../utils/SoundManager';
import { Haptics } from '../utils/Haptics';
import { movingSegmentPath, polylineLength } from '../utils/snakePath';

interface ArrowPieceProps {
  piece: Piece;
  cellSize: number;
  isHinted: boolean;
  isExiting: boolean;
  failedTap: number;
  exitDistance: number;
  entranceDelay: number;
}

// Direction mapped to rotation in degrees
const DIRECTIONS = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
const AnimatedPath = Animated.createAnimatedComponent(Path);

const ArrowPieceComponent: React.FC<ArrowPieceProps> = ({ piece, cellSize, isHinted, isExiting, failedTap, exitDistance, entranceDelay }) => {
  const settings = useUserStore(state => state.settings);
  
  // The origin of the piece (its head)
  const head = piece.shape[0];
  const center = (cell: { x: number; y: number }) => ({ x: (cell.x + 0.5) * cellSize, y: (cell.y + 0.5) * cellSize });
  const tip = center(head);
  const direction = DIRECTIONS[piece.direction];
  const end = { x: tip.x + direction.x * cellSize * 0.35, y: tip.y + direction.y * cellSize * 0.35 };
  const points = [...piece.shape].reverse().map(center);
  const shaftPoints = [...points, end];
  const pathLength = polylineLength(shaftPoints);
  const travel = cellSize * exitDistance;
  const route = [...shaftPoints, { x: end.x + direction.x * travel, y: end.y + direction.y * travel }];
  const viewportLeft = Math.min(...route.map(point => point.x)) - cellSize * 0.6;
  const viewportTop = Math.min(...route.map(point => point.y)) - cellSize * 0.6;
  const viewportWidth = Math.max(...route.map(point => point.x)) - viewportLeft + cellSize * 0.6;
  const viewportHeight = Math.max(...route.map(point => point.y)) - viewportTop + cellSize * 0.6;
  const shaft = movingSegmentPath(route, 0, pathLength);
  const side = { x: -direction.y, y: direction.x };
  const wing = (sign: number) => `${end.x - direction.x * cellSize * 0.26 + side.x * cellSize * 0.16 * sign} ${end.y - direction.y * cellSize * 0.26 + side.y * cellSize * 0.16 * sign}`;
  const arrowhead = `M${wing(1)} L${end.x} ${end.y} L${wing(-1)}`;
  
  // Animation states
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const retract = useSharedValue(pathLength);
  const flash = useSharedValue(0);
  const snakeProgress = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(entranceDelay, withTiming(1, { duration: 280 }));
    retract.value = withDelay(entranceDelay, withTiming(0, { duration: 360, easing: Easing.out(Easing.cubic) }));
  }, [entranceDelay, opacity, retract]);

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
      retract.value = 0;
      opacity.value = 1;
      snakeProgress.value = withTiming(travel, { duration: 700, easing: Easing.inOut(Easing.cubic) });
      opacity.value = withDelay(680, withTiming(0, { duration: 100 }));
    }
  }, [isExiting, travel, settings.hapticsEnabled, opacity, retract, snakeProgress]);

  useEffect(() => {
    if (failedTap > 0) {
      SoundManager.playError();
      Haptics.triggerError(settings.hapticsEnabled);
      flash.value = withSequence(withTiming(1, { duration: 75 }), withTiming(0, { duration: 260 }));
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
  }, [failedTap, piece.direction, settings.hapticsEnabled, translateX, translateY, flash]);

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
  const shaftProps = useAnimatedProps(() => ({
    d: movingSegmentPath(route, snakeProgress.value, pathLength),
    strokeDashoffset: retract.value,
    stroke: interpolateColor(flash.value, [0, 1], ['#1a202c', '#ef4444']),
  }));
  const headProps = useAnimatedProps(() => ({
    d: `M${end.x + direction.x * snakeProgress.value - direction.x * cellSize * 0.26 + side.x * cellSize * 0.16} ${end.y + direction.y * snakeProgress.value - direction.y * cellSize * 0.26 + side.y * cellSize * 0.16} L${end.x + direction.x * snakeProgress.value} ${end.y + direction.y * snakeProgress.value} L${end.x + direction.x * snakeProgress.value - direction.x * cellSize * 0.26 - side.x * cellSize * 0.16} ${end.y + direction.y * snakeProgress.value - direction.y * cellSize * 0.26 - side.y * cellSize * 0.16}`,
    stroke: interpolateColor(flash.value, [0, 1], ['#1a202c', '#ef4444']),
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: viewportLeft,
          top: viewportTop,
          width: viewportWidth,
          height: viewportHeight,
        },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <Animated.View pointerEvents="none" style={[styles.glow, { left: tip.x - viewportLeft - cellSize / 2, top: tip.y - viewportTop - cellSize / 2, width: cellSize, height: cellSize }, glowStyle]} />
      <Svg width={viewportWidth} height={viewportHeight} viewBox={`${viewportLeft} ${viewportTop} ${viewportWidth} ${viewportHeight}`} pointerEvents="none">
        <AnimatedPath d={shaft} animatedProps={shaftProps} strokeDasharray={`${pathLength} ${pathLength}`} strokeWidth={Math.max(1.25, cellSize * 0.09)} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <AnimatedPath d={arrowhead} animatedProps={headProps} strokeWidth={Math.max(1.25, cellSize * 0.09)} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    </Animated.View>
  );
};

export const ArrowPiece = React.memo(ArrowPieceComponent);

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
