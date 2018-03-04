import { observable, computed, action, observe } from 'mobx';
import * as tools from 'lib/editor/tools';
import { register } from 'lib/ioc';
import { Project } from './models';
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

    constructor({ system }) {
        observe(this, this.update);
        system.on('resize', this.update);
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

    @action.bound
    createProject(projectId, element) {
        this.projects.set(
            this.activeProjectId = projectId,
            new Project(element, this, tools)
        );
    }

    @action.bound
    handleZoomEvent(event) {
        const project = this.project;
        const { minZoom, maxZoom } = this.constructor;
        const zoom = project.view.zoom + (event.deltaY > 0 ? .05 : -.05);

        project.adjustZoom(
            Math.max(Math.min(zoom, maxZoom), minZoom),
            project.view.getEventPoint(event)
        );

        project.update(this);
    }

    @action.bound
    update() {
        this.project && this.project.update(this);
    }

}
