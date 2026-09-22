const fs = require('fs');
const path = require('path');
const DIRS = [{ dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }];
const TIERS = [
  { limit: 100, name: 'Easy', size: 12, pieces: 30 },
  { limit: 250, name: 'Medium', size: 14, pieces: 42 },
  { limit: 400, name: 'Hard', size: 16, pieces: 56 },
  { limit: 500, name: 'Expert', size: 18, pieces: 72 },
];
function random(seed) {
  let state = seed % 4294967296;
  return () => ((state = (1664525 * state + 1013904223) % 4294967296) / 4294967296);
}
function createLevel(id, tier, variation = 0) {
  const size = tier.size + (id % 3) - 1;
  const silhouettes = ['oval', 'diamond', 'hourglass', 'heart', 'wave'];
  const silhouette = silhouettes[(Math.floor(id / 7) + id) % silhouettes.length];
  const grid = Array.from({ length: size }, () => Array(size).fill(-1));
  const pieces = [];
  const rng = random(id * 7919 + variation * 104729 + 2026);
  const inside = (x, y) => x >= 0 && y >= 0 && x < size && y < size;
  const allowed = (x, y) => {
    if (!inside(x, y)) return false;
    const nx = (x + 0.5 - size / 2) / (size / 2);
    const ny = (size / 2 - y - 0.5) / (size / 2);
    if (silhouette === 'oval') return nx * nx / 0.91 + ny * ny / 0.91 <= 1;
    if (silhouette === 'diamond') return Math.abs(nx) + Math.abs(ny) <= 1.38;
    if (silhouette === 'hourglass') return Math.abs(nx) <= 0.55 + 0.5 * Math.abs(ny);
    if (silhouette === 'wave') return Math.abs(ny - 0.16 * Math.sin(nx * Math.PI * 2)) <= 0.84;
    const hx = nx * 1.18, hy = ny * 1.18;
    return Math.pow(hx * hx + hy * hy - 1, 3) - hx * hx * hy * hy * hy <= 0;
  };
  const adjacent = (x, y) => DIRS.some(d => inside(x + d.dx, y + d.dy) && grid[y + d.dy][x + d.dx] !== -1);
  // Insert in reverse removal order. Every new head has a clear exit through
  // older pieces, while its body extends the connected frontier.
  for (let index = 0; index < tier.pieces; index++) {
    const candidates = [];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      if (!allowed(x, y) || grid[y][x] !== -1 || (index && !adjacent(x, y))) continue;
      for (let direction = 0; direction < 4; direction++) {
        const d = DIRS[direction];
        let cx = x + d.dx, cy = y + d.dy, clear = true;
        while (inside(cx, cy)) {
          if (grid[cy][cx] !== -1) { clear = false; break; }
          cx += d.dx; cy += d.dy;
        }
        if (clear) candidates.push({ x, y, direction });
      }
    }
    if (!candidates.length) break;
    const head = candidates.map(c => {
      const neighbors = DIRS.filter(d => inside(c.x + d.dx, c.y + d.dy) && grid[c.y + d.dy][c.x + d.dx] !== -1).length;
      const open = DIRS.filter(d => inside(c.x + d.dx, c.y + d.dy) && grid[c.y + d.dy][c.x + d.dx] === -1).length;
      return { ...c, score: (neighbors === 1 ? 2 : 0) + open * 0.8 + rng() * 4 };
    }).sort((a, b) => b.score - a.score)[0];
    const shape = [{ x: head.x, y: head.y }];
    grid[head.y][head.x] = index;
    const length = 3 + Math.floor(rng() * 3);
    for (let step = 1; step < length; step++) {
      const previous = shape[shape.length - 1];
      const options = DIRS.map((d, direction) => ({ x: previous.x + d.dx, y: previous.y + d.dy, direction }))
        .filter(c => allowed(c.x, c.y) && grid[c.y][c.x] === -1 && (step > 1 || c.direction !== head.direction))
        .map(c => ({ ...c, score: (adjacent(c.x, c.y) ? 1 : 0) + rng() * 2 }))
        .sort((a, b) => b.score - a.score);
      if (!options.length) break;
      const next = options[0];
      shape.push({ x: next.x, y: next.y });
      grid[next.y][next.x] = index;
    }
    pieces.push({ id: `p_${index}`, direction: head.direction, shape });
  }
  pieces.reverse();
  return { id: `level_${id}`, difficultyTier: tier.name, boardSize: size, pieces, optimalSequenceLength: pieces.length };
}
const levels = Array.from({ length: 500 }, (_, index) => {
  const id = index + 1;
  const tier = TIERS.find(candidate => id <= candidate.limit);
  let best;
  for (let variation = 0; variation < 16; variation++) {
    const level = createLevel(id, tier, variation);
    if (!best || level.pieces.length > best.pieces.length) best = level;
    if (best.pieces.length === tier.pieces) break;
  }
  return best;
});
const outputPath = path.join(__dirname, '../src/data/levels.json');
fs.writeFileSync(outputPath, JSON.stringify(levels));
console.log(`Generated ${levels.length} connected levels at ${outputPath}`);
