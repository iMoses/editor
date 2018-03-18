import { intersection, castRay } from '../math';
import { Group, Path, Segment } from 'paper';
import BaseTool from './base';

export default class LightSourceTool extends BaseTool {

    static removeDuplicatePoints(points) {
        let map = {};
        return points.filter(point => {
            let key = point.x + ',' + point.y;
            if (key in map) return false;
            return map[key] = true;
        });
    }

    onActivate() {
        this.path = new Path.Circle({
            name: 'light-source',
            radius: 16,
            fillColor: 'rgb(250, 250, 210)',
            parent: this.baseLayer,
        });
    }

    onDeactivate() {
        this.group && this.group.remove();
        this.path.remove();
        this.path = null;
    }

    onMouseMove(event) {
        this.path.position = event.point;
        this.update();
    }

    update() {
        this.lineOfSight(this.layers.walls);
    }

    lineOfSight(lines) {
        const { center } = this.path.bounds;

        const angles     = [];
        const points     = [];
        const intersects = [];

        let segments = [];

        if (this.group) {
            this.group.remove();
        }

        // TODO: remove failsafe
        if (!center.isInside(this.editor.view.bounds)) return;

        this.group = this.editor.project.boundaries;

        lines.children.concat(this.group.children).forEach(path => {
            const { length } = path.segments;
            path.segments.forEach((segment, i) => {
                if (i +1 !== length) {
                    segments.push({a: segment.point, b: path.segments[i +1].point});
                }
                points.push(segment.point.clone());
            });
        });

        LightSourceTool.removeDuplicatePoints(points).forEach(point => {
            point.angle = point.subtract(center).angle;
            angles.push(
                point.angleInRadians -0.0001,
                point.angleInRadians,
                point.angleInRadians +0.0001);
        });

        angles.forEach(angle => {
            let closestIntersect = null;
            segments.forEach(segment => {
                let intersect = intersection(castRay(center, angle), segment);
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

        this.group.addChild(new Path({
            fillColor: 'rgba(250, 250, 210, .4)',
            segments
        }));
    }

}
