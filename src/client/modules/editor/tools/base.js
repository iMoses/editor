import { observable, computed, action } from 'mobx';
import { Tool } from 'paper';
import fp from 'lodash/fp';
import _ from 'lodash';

const mapValues = fp.mapValues.convert({cap: false});

export default class BaseTool extends Tool {

    static domEvents = [
        'mousedown',
        'mouseup',
        'mousedrag',
        'mousemove',
        'keydown',
        'keyup',
    ];

    static handlersMap = {
        mousedown:  'onMouseDown',
        mouseup:    'onMouseUp',
        mousedrag:  'onMouseDrag',
        mousemove:  'onMouseMove',
        keydown:    'onKeyDown',
        keyup:      'onKeyUp',
        activate:   'onActivate',
        deactivate: 'onDeactivate',
    };

    static localHandlers = {
        activate()   { this.active = true; },
        deactivate() { this.active = false; },
    };

    @observable active = false;

    constructor(editor) {
        super();

        this.editor = editor;

        this.on(fp.mapValues(action.bound)(BaseTool.localHandlers));

        // map event handlers
        this.on(fp.flow(
            mapValues((func, event) =>
                this[func] && BaseTool.domEvents.indexOf(event) !== -1
                    ? _.wrap(this[func], (func, ...args) => this.active && func.apply(this, args))
                    : this[func]
            ),
            fp.pickBy(fp.isFunction),
        )(BaseTool.handlersMap));
    }

}
