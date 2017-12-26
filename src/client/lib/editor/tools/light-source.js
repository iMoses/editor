import {
    view, project,
    Group, Layer, Project, Tool,
    Path, Point, Segment, Size, Symbol, PointText
} from 'paper';

export default class LightSourceTool extends Tool {

    constructor() {
        super(...arguments);

        this.group = new Group([
            this.path = new Path.Circle({
                name: 'light-tool',
                radius: 20,
                center: view.center,
                fillColor: 'rgb(250, 250, 210)'
            })
        ]);
    }

    onMouseMove(event) {
        this.path.position = event.point;
    }

}
