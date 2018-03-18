import { observable, computed, action } from 'mobx';
import BaseTool from './base';
import { Path } from 'paper';

export default class SelectTool extends BaseTool {

    @observable tolerance = 2;

    get options() {
        const { tolerance } = this;
        return {
            class: Path,
            fill: true,
            stroke: true,
            segments: true,
            tolerance,
        };
    }

    onMouseDown(event) {
        const hit = this.layers.walls
            .hitTest(event.point, this.options);
        hit && (hit.item.selected = !hit.item.selected);
    }

}
