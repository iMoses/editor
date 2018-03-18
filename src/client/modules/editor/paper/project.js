import { Group, Layer, Project, Path, Point, Size } from 'paper';
import { observable, computed, action, observe } from 'mobx';
import { SquareGrid } from 'modules/editor/view';
import { mouseDrag } from 'lib/utils';
import fp from 'lodash/fp';
import _ from 'lodash';

export default class ProjectModel extends Project {

    // canvas size
    @observable top;
    @observable left;
    @observable width;
    @observable height;

    constructor(element, editor) {
        super(element);

        this.editor = editor;

        // base create layers
        ['light', 'tiles', 'tokens', 'tools', 'walls']
            .forEach(name => new Layer({name}));

        this.layers.tools
            .addChildren([
                new SquareGrid({name: 'grid'}),
            ]);

        this.setupTools();

        this.view.on({
            resize:    this.handleResize.bind(this),
            mousedown: this.handleMouseDown,
        });

        observe(this, this.update.bind(this));

        this.update();
    }

    get grid() {
        return this.layers.tools.children.grid;
    }

    @computed
    get boundaries() {
        const { top, left, width, height } = this;
        const leftWith = left + width;
        const topHeight = top + height;
        return new Group({
            name: 'boundaries',
            parent: this.layers.tools,
            children: [
                new Path.Line({from: [left, top], to: [leftWith, top], visible: false}),
                new Path.Line({from: [leftWith, top], to: [leftWith, topHeight], visible: false}),
                new Path.Line({from: [leftWith, topHeight], to: [left, topHeight], visible: false}),
                new Path.Line({from: [left, topHeight], to: [left, top], visible: false}),
            ],
        });
    }

    setupTools() {
        const { tools } = this.editor;

        const extractNewValue = res => res.newValue;

        const addWall = fp.flow(extractNewValue, p => this.layers.walls.addChild(p));

        tools.draw.observe('lastPath', addWall);
    }

    update() {
        if (this.requestId) return;
        this.requestId = requestAnimationFrame(() => {
            this.handleResize();
            this.grid.update(this.view.bounds);
            // console.log(_.mapValues(this.editor.tools, tool => _.result(tool, 'update')));
            try {
                this.editor.tools.lightSource.update();
            }
            catch (e) {}
            this.view.update();
            delete this.requestId;
        });
    }

    @action.bound
    updateBounds() {
        const { width, height, x: left, y: top } = this.view.bounds;
        (this.width === width)   || (this.width = width);
        (this.height === height) || (this.height = height);
        (this.left === left)     || (this.left = left);
        (this.top === top)       || (this.top = top);
    }

    exportSVG(options = { asString: true }) {
        const { tiles, tokens, walls } = this.layers;
        const doc = new Project(document.createElement('canvas'));
        const layers = [tiles, tokens, walls];

        layers.forEach(l => doc.addLayer(l));
        // TODO viewSize should be the full size of the document

        doc.view.viewSize = this.view.viewSize;

        const svg = doc.exportSVG(options);

        layers.forEach(l => this.addLayer(l));

        this.activate();
        doc.remove();

        return typeof svg === 'string'
            ? `data:image/svg+xml;base64,${btoa(svg)}`
            : svg;
    }

    handleResize() {
        const {
            size: { width, height },
            element: { offsetWidth, offsetHeight }
        } = this.view;
        if (width !== offsetWidth || height !== offsetHeight) {
            this.view.viewSize = new Size(offsetWidth, offsetHeight);
        }
        this.updateBounds();
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
        }, () => {
            this.editor.tools.nil.restore();
            this.update();
        });
    }

}
