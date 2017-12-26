import {
    view, project,
    Group, Layer, Project, Tool,
    Path, Point, Segment, Size, Symbol, PointText
} from 'paper';

export default class DrawTool extends Tool {

    constructor() {
        super(...arguments);

        this.group = new Group({
            name: 'draw-tool',
            children: [
                this.rect = new Path.Rectangle({
                    name: 'draw-mark',
                    size: [6, 6],
                    point: [0, 0],
                    fillColor: 'rgba(0, 0, 255, .2)'
                }),
                this.lines = new Group({name: 'lines', children: []})
            ]
        });
    }

    onMouseDown(event) {
        this.path = new Path({strokeColor: 'black'});
        this.path.add(this.convertPoint(event.point));
        this.lines.addChild(this.path);
    }

    onMouseMove(event) {
        this.rect.position = this.convertPoint(event.point);
    }

    onMouseDrag(event) {
        const point = this.convertPoint(event.point);
        if (this.path.lastSegment.point.equals(point) === false) {
            this.path.add(/*this.rect.position = */point);
        }
    }

    onMouseUp(event) {
        this.path.flatten(10);
    }

    convertPoint(point) {
        return point;
        // const { _options: { tile_size } } = this.editor;
        // const range = tile_size / 1;
        // return {
        //     x: Math.round(point.x / range) * range,
        //     y: Math.round(point.y / range) * range
        // };
    }

}
