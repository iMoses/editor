export intersection from './intersection';

export function castRay(point, angle) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    return {a: point, b: {x: point.x + dx, y: point.y + dy}};
}
