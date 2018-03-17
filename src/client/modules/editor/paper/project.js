import { Group, Layer, Project, Path, Point, Size } from 'paper';
import { observable, computed, action } from 'mobx';
import { SquareGrid } from 'modules/editor/view';
import { mouseDrag } from 'lib/utils';

export default class ProjectModel extends Project {

    // canvas size
    @observable width;
    @observable height;

    @observable.ref center;

    constructor(element, editor) {
        super(element);

        this.editor = editor;

        new Layer({
            name: 'tools',
            children: [
                new SquareGrid({name: 'grid'}),
            ],
        });

        new Layer({name: 'tiles'});
        new Layer({name: 'tokens'});
        new Layer({name: 'walls'});

        this.handleResize({size: this.view.bounds});

        this.view.on({
            resize:    this.handleResize,
            mousedown: this.handleMouseDown,
        });

        editor.tools.draw
            .on('output', p => console.log(p));

        this.update();
    }

    get grid() {
        return this.layers.tools.children.grid;
    }

    exportSVG(options) {
        const { tiles, tokens, walls } = this.layers;
        const document = new Project([
            tiles, tokens, walls
        ]);
        const svg = document.exportSVG(options);
        document.remove();
        this.activate();
        return svg;
    }

    @computed
    get boundaries() {
        const { width, height } = this;
        return new Group({
            name: 'boundaries',
            parent: this.layers.tools,
            children: [
                new Path.Line({from: [0, 0], to: [width, 0], visible: false}),
                new Path.Line({from: [width, 0], to: [width, height], visible: false}),
                new Path.Line({from: [width, height], to: [0, height], visible: false}),
                new Path.Line({from: [0, height], to: [0, 0], visible: false})
            ],
        });
    }

    update() {
        const { offsetWidth, offsetHeight } = this.view.element;

        this.setSize(offsetWidth, offsetHeight);

        this.grid.update(this.view.bounds);
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
    handleResize({ size: { width, height } }) {
        this.width  = width;
        this.height = height;
    }

    @action.bound
    handleMouseDown(event) {
        // make paper.js play nicely with React synthetic events
        event.event.preventDefault = () => {};

        if (!event.modifiers.space) return true;

        this.editor.tools.nil.activate();
        let last = this.view.projectToView(event.point);
        mouseDrag(this.view, event => {
            const point = this.view.projectToView(event.point);
            this.view.translate(event.point.subtract(this.view.viewToProject(last)));
            this.grid.update(this.view.bounds);
            last = point;
        }, () => this.editor.tools.nil.restore());
    }

}
