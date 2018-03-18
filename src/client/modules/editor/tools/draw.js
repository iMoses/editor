import { observable, computed, action } from 'mobx';
import BaseTool from './base';
import { Path } from 'paper';

export default class DrawTool extends BaseTool {

    @observable strokeColor = 'black';
    @observable strokeWidth = 1;

    @observable flattenBy = 10;

    @observable.ref lastPath;

    @computed
    get options() {
        const { strokeColor, strokeWidth } = this;
        return {strokeColor, strokeWidth, parent: this.baseLayer};
    }

    @action
    onMouseDown(event) {
        if (event.event.which === 1) {
            this.path = new Path(this.options);
            this.path.add(event.point);
        }
        else {
            this.path = null;
        }
    }

    onMouseDrag(event) {
        if (this.path && this.path.lastSegment.point.equals(event.point) === false) {
            this.path.add(event.point);
        }
    }

    @action
    onMouseUp() {
        if (this.path) {
            this.path.flatten(this.flattenBy);
            this.emit('output', this.path);
            this.lastPath = this.path;
        }
    }

}
