import {
    view, project,
    Group, Layer, Project, Tool,
    Path, Point, Segment, Size, Symbol, PointText
} from 'paper';

import { draw, lightSource } from './tools';
import { intersection } from './math';
import { SquareGrid } from './view';

export class Editor extends Project {

    static defaultOptions = {
        width:    25,
        height:   25,
        tileSize: 32,
        showGrid: true,
    };

    constructor(element, settings = {}) {
        super(element);
        this.tools = {draw, lightSource};
        this.settings = {...Editor.defaultOptions, ...settings};
        this.updateView();
        this.updateGrid();
        view.draw();
    }

    updateGrid() {
        const { showGrid, tileSize } = this.settings;
        showGrid
            ? this.grid
            ? this.grid.update({tileSize})
            : (this.grid = new SquareGrid({tileSize}))
            : this.grid
            ? this.grid.group.remove()
            : null;
    }

    updateView() {
        const { width, height, tileSize } = this.settings;
        view.viewSize   = new Size(tileSize * width, tileSize * height);
        this.boundaries = [
            new Path.Line({from: [0, 0], to: [width, 0], visible: false}),
            new Path.Line({from: [width, 0], to: [width, height], visible: false}),
            new Path.Line({from: [width, height], to: [0, height], visible: false}),
            new Path.Line({from: [0, height], to: [0, 0], visible: false})
        ];
    }

    test() {
        const { width, height } = view.bounds;
        const { lines } = this.tools.draw;
        const { path: { bounds: { center } } } = this.tools.lightSource;

        var angles = [];
        var points = [];
        var segments = [];
        var intersects = [];

        if (this.lines) this.lines.remove();
        if (!center.isInside(view.bounds)) return;

        this.lines = new Group(this.boundaries);

        lines.children.concat(this.lines.children).forEach(path => {
            const { length } = path.segments;
            path.segments.forEach((segment, i) => {
                if (i +1 !== length) {
                    segments.push({a: segment.point, b: path.segments[i +1].point});
                }
                points.push(segment.point.clone());
            });
        });

        points = (() => {
            let map = {};
            return points.filter(point => {
                let key = point.x + ',' + point.y;
                if (key in map) return false;
                return map[key] = true;
            });
        })();

        points.forEach(point => {
            point.angle = point.subtract(center).angle;
            angles.push(
                point.angleInRadians -0.0001,
                point.angleInRadians,
                point.angleInRadians +0.0001);
        });

        angles.forEach(angle => {
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);

            const ray = {a: center, b: {x: center.x + dx, y: center.y + dy}};

            let closestIntersect = null;
            segments.forEach(segment => {
                let intersect = intersection(ray, segment);
                if(!intersect) return;
                if(!closestIntersect || intersect.param < closestIntersect.param){
                    closestIntersect = intersect;
                }
            });

            if(!closestIntersect) return;
            closestIntersect.angleInRadians = angle;

            intersects.push(closestIntersect);
        });

        segments = intersects
            .sort((a,b) => a.angleInRadians - b.angleInRadians)
            .map((intersect, i) => {
                return new Segment({point: [intersect.x, intersect.y]});
            });

        this.lines.addChild(new Path({
            fillColor: 'rgba(250, 250, 210, .4)',
            segments
        }));

        // console.log(segments.length);

        view.draw();
    }

}
