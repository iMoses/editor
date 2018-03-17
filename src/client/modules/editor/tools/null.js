import BaseTool from './base';

export default class NullTool extends BaseTool {

    activate() {
        const { tool } = this.editor;
        if (tool !== this) this.prev = tool;
        super.activate();
    }

    restore() {
        if (this.prev) {
            this.prev.activate();
            delete this.prev;
        }
    }

}
