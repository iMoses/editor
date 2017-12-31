import { observable, computed, action, extendObservable, toJS } from 'mobx';
import _ from 'lodash';

export default class BaseCommand {

    @observable id          = null;   // string
    @observable title       = null;   // string
    @observable icon        = null;   // string (url)
    @observable description = null;   // string
    @observable keys        = null;   // string|array
    @observable disabled    = false;  // function (context)
    @observable active      = null;   // boolean

    // suggestedKeys:      null,   // object - {default, ...}
    // onCommand:          null,   // function (details={ context, target, group, selectionText, editable })

    static suggestKeys(keys) {
        return keys ? (keys.default || keys) : null;
    }

    constructor(settings = {}, controller) {
        const {
            id, title, icon, description, suggestedKeys, disabled, active,
            onChange, onExecute,
        } = settings;

        extendObservable(this, {
            keys: this.constructor.suggestKeys(suggestedKeys),
            id, title, icon, description, disabled, active,
        });

        onChange && controller.on('change', onChange.bind(this));
        onExecute && controller.on(this.id, onExecute.bind(this));

        this.emit = controller.commandEmitter(this);
    }

    @computed
    get keysLabel() {
        if (this.keys === null) {
            return null;
        }
        const keys = (
            Array.isArray(this.keys)
                ? this.keys[0]
                : this.keys
        ).split(/\s+/);
        return keys.map(_.capitalize).join('+');
    }

}
