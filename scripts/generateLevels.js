const fs = require('fs');
const path = require('path');
const { makeMask } = require('./shapeTemplates');
const { DIRECTIONS, isInsideMask, getExitCells } = require('../src/utils/boardGeometry');
const TIERS = [
  { limit: 100, name: 'Easy', size: 12, pieces: 34 },
  { limit: 250, name: 'Medium', size: 14, pieces: 47 },
  { limit: 400, name: 'Hard', size: 16, pieces: 63 },
  { limit: 500, name: 'Expert', size: 18, pieces: 80 },
];
function random(seed) {
  let state = seed % 4294967296;
  return () => ((state = (1664525 * state + 1013904223) % 4294967296) / 4294967296);
}
function templateFor(id, tier) {
  const shapes = ['heart', 'star', 'circle', 'diamond', 'arrow', 'hourglass', 'wave'];
  const special = tier.name === 'Easy' ? id % 3 === 0 : tier.name === 'Medium' ? id % 3 !== 1 : id % 5 !== 1;
  return special ? shapes[(id * 11 + Math.floor(id / 3)) % shapes.length] : 'rectangle';
}
function createLevel(id, tier, template, variation = 0) {
  const size = tier.size + (id % 3) - 1 + (template === 'star' || template === 'arrow' ? 4 : 0);
  const mask = makeMask(template, size);
  const grid = Array.from({ length: size }, () => Array(size).fill(-1));
  const pieces = [];
  const rng = random(id * 7919 + variation * 104729 + 2026);
  const allowed = (x, y) => isInsideMask(mask, x, y);
  const adjacent = (x, y) => DIRECTIONS.some(d => allowed(x + d.dx, y + d.dy) && grid[y + d.dy][x + d.dx] !== -1);
  // Insert in reverse removal order. Every new head has a clear exit through
  // older pieces, while its body extends the connected frontier.
  for (let index = 0; index < tier.pieces; index++) {
    const blockImpact = new Map();
    for (const placed of pieces) {
      const ray = getExitCells(placed.shape[0], placed.direction, mask);
      if (ray.every(cell => grid[cell.y][cell.x] === -1)) {
        for (const cell of ray) {
          const key = `${cell.x},${cell.y}`;
          blockImpact.set(key, (blockImpact.get(key) || 0) + 1);
        }
      }
    }
    const candidates = [];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      if (!allowed(x, y) || grid[y][x] !== -1 || (index && !adjacent(x, y))) continue;
      for (let direction = 0; direction < 4; direction++) {
        if (getExitCells({ x, y }, direction, mask).every(cell => grid[cell.y][cell.x] === -1)) candidates.push({ x, y, direction });
      }
    }
    if (!candidates.length) break;
    const head = candidates.map(c => {
      const neighbors = DIRECTIONS.filter(d => allowed(c.x + d.dx, c.y + d.dy) && grid[c.y + d.dy][c.x + d.dx] !== -1).length;
      const open = DIRECTIONS.filter(d => allowed(c.x + d.dx, c.y + d.dy) && grid[c.y + d.dy][c.x + d.dx] === -1).length;
      const blockWeight = tier.name === 'Easy' ? 0.15 : tier.name === 'Medium' ? 0.6 : tier.name === 'Hard' ? 1.2 : 2.2;
      return { ...c, score: neighbors * 1.7 + open * 0.25 +
        (blockImpact.get(`${c.x},${c.y}`) || 0) * blockWeight + rng() * 4 };
    }).sort((a, b) => b.score - a.score)[0];
    const shape = [{ x: head.x, y: head.y }];
    const exitRay = new Set(getExitCells(head, head.direction, mask).map(cell => `${cell.x},${cell.y}`));
    grid[head.y][head.x] = index;
    const lengthRange = tier.name === 'Easy' ? [3, 5] : tier.name === 'Medium' ? [3, 6] : tier.name === 'Hard' ? [4, 7] : [4, 8];
    const length = lengthRange[0] + Math.floor(rng() * (lengthRange[1] - lengthRange[0] + 1));
    for (let step = 1; step < length; step++) {
      const previous = shape[shape.length - 1];
      const prior = shape.length > 1 ? shape[shape.length - 2] : null;
      const options = DIRECTIONS.map((d, direction) => ({ x: previous.x + d.dx, y: previous.y + d.dy, direction }))
        .filter(c => allowed(c.x, c.y) && grid[c.y][c.x] === -1 && !exitRay.has(`${c.x},${c.y}`) && (step > 1 || c.direction !== head.direction))
        .map(c => ({ ...c, score: (adjacent(c.x, c.y) ? 1 : 0) +
          (prior && c.direction !== DIRECTIONS.findIndex(d => d.dx === previous.x - prior.x && d.dy === previous.y - prior.y)
            ? (tier.name === 'Hard' ? 1.7 : tier.name === 'Expert' ? 2 : 1.2) : 0) + rng() * 1.2 }))
        .sort((a, b) => b.score - a.score);
      if (!options.length) break;
      const next = options[0];
      shape.push({ x: next.x, y: next.y });
      grid[next.y][next.x] = index;
    }
    pieces.push({ id: `p_${index}`, direction: head.direction, shape });
  }
  pieces.reverse();
  return { id: `level_${id}`, difficultyTier: tier.name, boardSize: size, shapeTemplate: template, mask, pieces, optimalSequenceLength: pieces.length };
}
let previousTemplate = null;
const levels = Array.from({ length: 500 }, (_, index) => {
  const id = index + 1;
  const tier = TIERS.find(candidate => id <= candidate.limit);
  let template = templateFor(id, tier);
  if (previousTemplate === template) template = template === 'rectangle' ? 'circle' : 'rectangle';
  previousTemplate = template;
  let best;
  for (let variation = 0; variation < 16; variation++) {
    const level = createLevel(id, tier, template, variation);
    if (!best || level.pieces.length > best.pieces.length) best = level;
    if (best.pieces.length === tier.pieces) break;
  }
  return best;
});
const outputPath = path.join(__dirname, '../src/data/levels.json');
fs.writeFileSync(outputPath, JSON.stringify(levels));
console.log(`Generated ${levels.length} connected levels at ${outputPath}`);
