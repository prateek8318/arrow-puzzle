import { Piece, Direction } from '../store/useGameStore';

const DIRS = [
  { dx: 0, dy: -1 }, // 0: Up
  { dx: 1, dy: 0 },  // 1: Right
  { dx: 0, dy: 1 },  // 2: Down
  { dx: -1, dy: 0 }  // 3: Left
];

/**
 * Checks if a piece's exit path is clear of any other pieces.
 */
export function isPathClear(piece: Piece, remainingPieces: Piece[], boardSize: number): boolean {
  const dir = DIRS[piece.direction];
  const head = piece.shape[0]; // Assuming shape[0] is the arrowhead

  let cx = head.x + dir.dx;
  let cy = head.y + dir.dy;

  // Build a set or map of all occupied cells by OTHER pieces for fast lookup
  const occupied = new Set<string>();
  for (const p of remainingPieces) {
    if (p.id === piece.id) continue;
    for (const cell of p.shape) {
      occupied.add(`${cell.x},${cell.y}`);
    }
  }

  // Trace path to edge
  while (cx >= 0 && cx < boardSize && cy >= 0 && cy < boardSize) {
    if (occupied.has(`${cx},${cy}`)) {
      return false;
    }
    cx += dir.dx;
    cy += dir.dy;
  }

  return true;
}
