import { movingSegmentPath, polylineLength } from '../src/utils/snakePath';

test('the full-length arrow follows its bend as its head exits', () => {
  const route = [{ x: 0, y: 10 }, { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 40, y: 0 }];
  const arrowLength = polylineLength(route.slice(0, 3));
  expect(arrowLength).toBe(20);
  expect(movingSegmentPath(route, 0, arrowLength)).toBe('M0 10 L0 0 L10 0');
  expect(movingSegmentPath(route, 5, arrowLength)).toBe('M0 5 L0 0 L10 0 L15 0');
  expect(movingSegmentPath(route, 15, arrowLength)).toBe('M5 0 L10 0 L25 0');
});
