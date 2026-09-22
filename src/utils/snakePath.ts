export interface Point { x: number; y: number }

export function polylineLength(points: Point[]): number {
  'worklet';
  let length = 0;
  for (let index = 1; index < points.length; index++) {
    length += Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y);
  }
  return length;
}

export function pointOnPolyline(points: Point[], distance: number): Point {
  'worklet';
  let remaining = Math.max(0, distance);
  for (let index = 1; index < points.length; index++) {
    const start = points[index - 1], end = points[index];
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    if (remaining <= length || index === points.length - 1) {
      const fraction = Math.max(0, Math.min(1, remaining / (length || 1)));
      return { x: start.x + (end.x - start.x) * fraction, y: start.y + (end.y - start.y) * fraction };
    }
    remaining -= length;
  }
  return points[0];
}

// A fixed-length window slides along the original bends and then the exit ray.
export function movingSegmentPath(points: Point[], start: number, length: number): string {
  'worklet';
  const end = start + length;
  const tail = pointOnPolyline(points, start);
  const head = pointOnPolyline(points, end);
  let path = `M${tail.x} ${tail.y}`;
  let distance = 0;
  for (let index = 1; index < points.length; index++) {
    distance += Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y);
    if (distance > start && distance < end) path += ` L${points[index].x} ${points[index].y}`;
  }
  return `${path} L${head.x} ${head.y}`;
}
