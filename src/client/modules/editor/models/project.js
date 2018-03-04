import { Group, Layer, Project, Path, Point, Segment, Size, Symbol, PointText } from 'paper';
import { observable, computed, action } from 'mobx';
import { SquareGrid } from 'lib/editor/view';

export default class ProjectModel extends Project {

    // canvas size
    @observable width;
    @observable height;

    @observable.ref center;

    constructor(element, settings) {
        super(element);

        this.grid = new SquareGrid(this);

        this.view.on('mousedown', this.handleMouseDown);

        this.update(settings);
    }

    // @computed
    get boundaries() {
        const { width, height } = this.view.bounds;
        return [
            new Path.Line({from: [0, 0], to: [width, 0], visible: false}),
            new Path.Line({from: [width, 0], to: [width, height], visible: false}),
            new Path.Line({from: [width, height], to: [0, height], visible: false}),
            new Path.Line({from: [0, height], to: [0, 0], visible: false})
        ];
    }

    update({ tools: { draw } }) {
        const { offsetWidth, offsetHeight } = this.view.element;

        this.setSize(offsetWidth, offsetHeight);

        this.grid.update();
        this.view.update();
    }

    setSize(width, height) {
        if (width !== this.width || height !== this.height) {
            this.view.viewSize = new Size(width, height);
        }
    }

    adjustZoom(zoomValue, zoomCenter) {
        let { bounds, center, viewSize, zoom } = this.view;

        this.view.zoom = zoomValue;

        const scale        = zoom / zoomValue;
        const centerAdjust = zoomCenter.subtract(center);
        const offset       = zoomCenter.subtract(centerAdjust.multiply(scale)).subtract(center);

        center = this.view.center = center.add(offset);
        bounds = this.view.bounds;

        if (bounds.x < 0) this.view.center = center.subtract(new Point(bounds.x, 0));
        if (bounds.y < 0) this.view.center = center.subtract(new Point(0, bounds.y));

        bounds = this.view.bounds;

        const
            w = bounds.x + bounds.width,
            h = bounds.y + bounds.height;

        if (w > viewSize.width)  this.view.center = center.subtract(new Point(w - viewSize.width, 0));
        if (h > viewSize.height) this.view.center = center.subtract(new Point(0, h - viewSize.height));
    }

    @action.bound
    handleMouseDown(event) {
        if (!event.modifiers.space) return true;

        let last = this.view.projectToView(event.point);

        const handleMouseDrag = event => {
            const point = this.view.projectToView(event.point);
            this.view.translate(event.point.subtract(this.view.viewToProject(last)));
            this.grid.update();
            last = point;
        };

        const handleMouseUp = event => {
            this.view.off('mousedrag', handleMouseDrag);
            this.view.off('mouseup', handleMouseUp);

        };

        this.view.on('mousedrag', handleMouseDrag);
        this.view.on('mouseup', handleMouseUp);
    }

}
