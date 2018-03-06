import { Group, Path, Segment } from 'paper';
import { intersection } from '../math';
import BaseTool from './base';

export default class LightSourceTool extends BaseTool {

    static castRay(point, angle) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        return {a: point, b: {x: point.x + dx, y: point.y + dy}};
    }

    constructor() {
        super(...arguments);

        this.group = new Group([
            this.path = new Path.Circle({
                name: 'light-tool',
                radius: 20,
                center: this.editor.view.center,
                fillColor: 'rgb(250, 250, 210)'
            })
        ]);
    }

    onMouseMove(event) {
        this.path.position = event.point;
        this.lightOfSight(this.editor.tools.draw.lines);
    }

    removeDuplicatePoints(points) {
        let map = {};
        return points.filter(point => {
            let key = point.x + ',' + point.y;
            if (key in map) return false;
            return map[key] = true;
        });
    }

    lightOfSight(lines) {
        const { center }        = this.path.bounds;
        const { width, height } = this.editor.view.bounds;

        const angles     = [];
        const points     = [];
        const intersects = [];

        let segments = [];

        if (this.lines) {
            this.lines.remove();
        }

        // TODO: remove failsafe
        if (!center.isInside(this.editor.view.bounds)) return;

        this.lines = new Group(this.editor.project.boundaries);

        lines.children.concat(this.lines.children).forEach(path => {
            const { length } = path.segments;
            path.segments.forEach((segment, i) => {
                if (i +1 !== length) {
                    segments.push({a: segment.point, b: path.segments[i +1].point});
                }
                points.push(segment.point.clone());
            });
        });

        this.removeDuplicatePoints(points).forEach(point => {
            point.angle = point.subtract(center).angle;
            angles.push(
                point.angleInRadians -0.0001,
                point.angleInRadians,
                point.angleInRadians +0.0001);
        });

        angles.forEach(angle => {
            let closestIntersect = null;
            segments.forEach(segment => {
                let intersect = intersection(LightSourceTool.castRay(center, angle), segment);
                if (intersect && (!closestIntersect || intersect.param < closestIntersect.param)) {
                    closestIntersect = intersect;
                }
            });

            if (closestIntersect) {
                closestIntersect.angleInRadians = angle;
                intersects.push(closestIntersect);
            }
        });

        segments = intersects
            .sort((a, b) => a.angleInRadians - b.angleInRadians)
            .map(intersect => new Segment({point: [intersect.x, intersect.y]}));

        this.lines.addChild(new Path({
            fillColor: 'rgba(250, 250, 210, .4)',
            segments
        }));
    }

}
