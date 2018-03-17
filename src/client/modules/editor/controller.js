import { observable, computed, action, observe } from 'mobx';
import { register } from 'lib/ioc';
import { Project } from './paper';
import * as tools from './tools';
import { view } from 'paper';
import _ from 'lodash';

@register
export default class EditorController {

    static minZoom = 0.5;
    static maxZoom = 1.5;

    @observable tileSize   = 32;
    @observable snapToGrid = true;

    @observable projects        = new Map;
    @observable activeProjectId = null;

    constructor({ paper, system }) {
        this.paper = paper;
        observe(this, this.update);
        system.on('resize', this.update);
    }

    get tool() {
        return this.paper.tool;
    }

    get tools() {
        const value = _.mapValues(tools, Tool => new Tool(this));
        Object.defineProperty(this, 'tools', {value});
        return value;
    }

    @computed
    get project() {
        return this.projects.get(this.activeProjectId);
    }

    @computed
    get view() {
        return this.project && this.project.view || view;
    }

    activateTool(name) {
        if (this.tool.deactivate) {
            this.tool.deactivate();
        }
        this.tools[name].activate();
    }

    @action.bound
    createProject(projectId, element) {
        this.projects.set(
            this.activeProjectId = projectId,
            new Project(element, this)
        );
    }

    @action.bound
    handleZoomEvent(event) {
        const { project, view } = this;
        const { minZoom, maxZoom } = this.constructor;
        const zoom = _.clamp(view.zoom + (event.deltaY > 0 ? -.05 : .05), minZoom, maxZoom);

        if (zoom === view.zoom) return;

        view.center = view.center.subtract(
            view.center
                .subtract(view.getEventPoint(event))
                .multiply(zoom - view.zoom)
        );
        view.zoom = zoom;

        project.update(this);
    }

    @action.bound
    update() {
        this.project && this.project.update(this);
    }

}
