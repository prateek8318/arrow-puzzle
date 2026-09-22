const assert = require('assert');
const levels = require('../src/data/levels.json');
const { makeMask } = require('./shapeTemplates');
const { DIRECTIONS, isInsideMask, getExitCells } = require('../src/utils/boardGeometry');

assert.strictEqual(levels.length, 500);
let hearts = 0;
let blockedHearts = 0;
for (let index = 0; index < levels.length; index++) {
  const level = levels[index];
  assert.deepStrictEqual(level.mask, makeMask(level.shapeTemplate, level.boardSize));
  if (index) assert.notStrictEqual(level.shapeTemplate, levels[index - 1].shapeTemplate);
  const occupied = new Set();
  for (const piece of level.pieces) {
    assert(piece.shape.length > 0);
    const own = new Set();
    for (let i = 0; i < piece.shape.length; i++) {
      const cell = piece.shape[i], key = `${cell.x},${cell.y}`;
      assert(isInsideMask(level.mask, cell.x, cell.y), `${level.id}: outside mask`);
      assert(!occupied.has(key), `${level.id}: overlap`);
      assert(!own.has(key), `${level.id}: self overlap`);
      if (i) assert.strictEqual(Math.abs(cell.x - piece.shape[i - 1].x) + Math.abs(cell.y - piece.shape[i - 1].y), 1);
      own.add(key); occupied.add(key);
    }
    for (const cell of getExitCells(piece.shape[0], piece.direction, level.mask)) {
      assert(!own.has(`${cell.x},${cell.y}`), `${level.id}: own body in exit ray`);
    }
  }
  const visited = new Set([occupied.values().next().value]);
  const queue = [...visited];
  for (const key of queue) {
    const [x, y] = key.split(',').map(Number);
    for (const delta of DIRECTIONS) {
      const neighbor = `${x + delta.dx},${y + delta.dy}`;
      if (occupied.has(neighbor) && !visited.has(neighbor)) { visited.add(neighbor); queue.push(neighbor); }
    }
  }
  assert.strictEqual(visited.size, occupied.size, `${level.id}: disconnected`);
  const remaining = [...level.pieces];
  for (const piece of level.pieces) {
    const others = new Set(remaining.filter(other => other !== piece).flatMap(other => other.shape.map(cell => `${cell.x},${cell.y}`)));
    assert(getExitCells(piece.shape[0], piece.direction, level.mask).every(cell => !others.has(`${cell.x},${cell.y}`)), `${level.id}: removal blocked`);
    remaining.shift();
  }
  assert.strictEqual(remaining.length, 0);
  assert.strictEqual(level.optimalSequenceLength, level.pieces.length);
  if (level.shapeTemplate === 'heart') {
    hearts++;
    if (level.pieces.some(piece => getExitCells(piece.shape[0], piece.direction, level.mask)
      .some(cell => level.pieces.some(other => other !== piece && other.shape.some(body => body.x === cell.x && body.y === cell.y))))) blockedHearts++;
  }
}
assert(hearts > 10 && blockedHearts > 0);
console.log(`Validated ${levels.length} levels, including ${hearts} hearts with ${blockedHearts} initially blocked heart boards.`);
