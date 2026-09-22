const DIRECTIONS = [{ dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }];

function isInsideMask(mask, x, y) {
  return y >= 0 && y < mask.length && x >= 0 && x < mask[y].length && mask[y][x] === '1';
}

function getExitCells(head, direction, mask) {
  const delta = DIRECTIONS[direction];
  const cells = [];
  for (let x = head.x + delta.dx, y = head.y + delta.dy; isInsideMask(mask, x, y); x += delta.dx, y += delta.dy) {
    cells.push({ x, y });
  }
  return cells;
}

module.exports = { DIRECTIONS, isInsideMask, getExitCells };
