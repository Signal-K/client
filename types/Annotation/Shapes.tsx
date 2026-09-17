import type { Point, Shape } from '../Annotation';

export const createShapePath = (shape: Shape): string => {
  const { type, startPoint, endPoint } = shape;

  switch (type) {
    case 'rectangle': {
      const width = endPoint.x - startPoint.x;
      const height = endPoint.y - startPoint.y;
      return `M ${startPoint.x},${startPoint.y} h ${width} v ${height} h ${-width} Z`;
    }
    case 'circle': {
      const rx = Math.abs(endPoint.x - startPoint.x) / 2;
      const ry = Math.abs(endPoint.y - startPoint.y) / 2;
      const cx = startPoint.x + (endPoint.x - startPoint.x) / 2;
      const cy = startPoint.y + (endPoint.y - startPoint.y) / 2;
      return `M ${cx - rx},${cy} a ${rx},${ry} 0 1,0 ${rx * 2},0 a ${rx},${ry} 0 1,0 ${-rx * 2},0`;
    }
    default:
      return '';
  }
};