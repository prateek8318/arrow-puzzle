// Each template maps normalized cell centers (-1..1) to a reusable boolean mask.
const predicates = {
  rectangle: () => true,
  circle: (x, y) => x * x + y * y <= 0.91,
  diamond: (x, y) => Math.abs(x) + Math.abs(y) <= 1.38,
  heart: (x, y) => {
    const hx = x * 1.18, hy = y * 1.18;
    return (hx * hx + hy * hy - 1) ** 3 - hx * hx * hy ** 3 <= 0;
  },
  star: (x, y) => {
    const angle = Math.atan2(x, y);
    const radius = Math.hypot(x, y);
    return radius <= 0.65 + 0.29 * Math.cos(5 * angle);
  },
  arrow: (x, y) => (y >= -0.12 && y <= 0.78 && Math.abs(x) <= 0.38) ||
    (y < -0.12 && y >= -0.92 && Math.abs(x) <= (y + 0.92) * 1.17),
  hourglass: (x, y) => Math.abs(x) <= 0.55 + 0.5 * Math.abs(y),
  wave: (x, y) => Math.abs(y - 0.16 * Math.sin(x * Math.PI * 2)) <= 0.84,
};

function makeMask(template, size) {
  const test = predicates[template];
  if (!test) throw new Error(`Unknown shape template: ${template}`);
  return Array.from({ length: size }, (_unusedRow, row) =>
    Array.from({ length: size }, (_unusedColumn, column) => {
      const x = (column + 0.5 - size / 2) / (size / 2);
      const y = (size / 2 - row - 0.5) / (size / 2);
      return test(x, y) ? '1' : '0';
    }).join('')
  );
}

module.exports = { makeMask, templateNames: Object.keys(predicates) };
