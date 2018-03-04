import { Tool } from 'paper';
import fp from 'lodash/fp';

export default class BaseTool extends Tool {

    static handlersMap = {
        mousedown:  'onMouseDown',
        mouseup:    'onMouseUp',
        mousedrag:  'onMouseDrag',
        mousemove:  'onMouseMove',
        keydown:    'onKeyDown',
        keyup:      'onKeyUp',
    };

    static extractHandlers = fp.flow(
        fp.mapValues(func => this[func]),
        fp.pickBy(fp.isFunction)
    );

    constructor(editor) {
        super();

        this.editor = editor;

        // map event handlers
        const extractHandlers = fp.flow(
            fp.mapValues(func => this[func]),
            fp.pickBy(fp.isFunction)
        );
        this.on(extractHandlers(BaseTool.handlersMap));
    }

}
