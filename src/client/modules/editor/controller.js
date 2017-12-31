import { observable, computed, action, observe } from 'mobx';
import * as tools from 'lib/editor/tools';
import { register } from 'lib/ioc';
import { Project } from './models';

@register
export default class EditorController {

    @observable tileSize   = 32;
    @observable tileShape  = 32;
    @observable zoom       = 1;

    @observable showGrid   = true;
    @observable snapToGrid = true;

    @observable projects        = new Map;
    @observable activeProjectId = null;

    constructor({ system }) {
        observe(this, this.update);
        system.on('resize', this.update);
    }

    @computed
    get activeProject() {
        return this.projects.get(this.activeProjectId);
    }

    @action.bound
    createProject(projectId, element) {
        this.projects.set(
            this.activeProjectId = projectId,
            new Project(element, this, tools)
        );
    }

    @action.bound
    toggleGrid() {
        this.showGrid = !this.showGrid;
    }

    @action.bound
    update() {
        this.activeProject && this.activeProject.update(this);
    }

}
