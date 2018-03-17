import { observable, computed, action } from 'mobx';
import BaseTool from './base';
import { Path } from 'paper';

export default class DrawTool extends BaseTool {

    @observable strokeColor = 'black';
    @observable strokeWidth = 1;

    @observable flattenBy = 10;

    @computed
    get style() {
        const { strokeColor, strokeWidth } = this;
        return {strokeColor, strokeWidth};
    }

    onMouseDown(event) {
        this.path = new Path(this.style);
        this.path.add(event.point);
    }

    onMouseDrag(event) {
        if (this.path.lastSegment.point.equals(event.point) === false) {
            this.path.add(event.point);
        }
    }

    onMouseUp() {
        this.path.flatten(this.flattenBy);
        this.emit('output', this.path);
    }

}
