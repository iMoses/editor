import { Group, Layer, Project, Path, Point, Segment, Size, Symbol, PointText } from 'paper';
import { observable, computed, action } from 'mobx';
import { SquareGrid } from 'lib/editor/view';

export default class ProjectModel extends Project {

    // canvas size
    @observable width;
    @observable height;

    constructor(element, settings, tools) {
        super(element);
        this.tools = tools;
        this.update(settings);
    }

    @computed
    get boundaries() {
        const { width, height } = this;
        return [
            new Path.Line({from: [0, 0], to: [width, 0], visible: false}),
            new Path.Line({from: [width, 0], to: [width, height], visible: false}),
            new Path.Line({from: [width, height], to: [0, height], visible: false}),
            new Path.Line({from: [0, height], to: [0, 0], visible: false})
        ];
    }

    setSize(width, height) {
        if (width !== this.width || height !== this.height) {
            this.view.viewSize = new Size(width, height);
        }
    }

    update({ showGrid }) {
        const { offsetWidth, offsetHeight } = this.view.element;
        this.setSize(offsetWidth, offsetHeight);

        showGrid
            ? this.grid
            ? this.grid.update()
            : (this.grid = new SquareGrid(this))
            : this.grid
            ? this.grid.group.remove()
            : null;

        this.view.draw();
    }

}
