import { Piece } from '../store/useGameStore';
import { getExitCells } from './boardGeometry';

/**
 * Checks if a piece's exit path is clear of any other pieces.
 */
export function isPathClear(piece: Piece, remainingPieces: Piece[], mask: string[]): boolean {

  // Build a set or map of all occupied cells by OTHER pieces for fast lookup
  const occupied = new Set<string>();
  for (const p of remainingPieces) {
    if (p.id === piece.id) continue;
    for (const cell of p.shape) {
      occupied.add(`${cell.x},${cell.y}`);
    }
  }

  return getExitCells(piece.shape[0], piece.direction, mask)
    .every(cell => !occupied.has(`${cell.x},${cell.y}`));
}
