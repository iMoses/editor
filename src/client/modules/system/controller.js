import bootstrap from './bootstrap';
import * as modules from 'modules';
import EventEmitter from 'events';
import _ from 'lodash';

export default class SystemController extends EventEmitter {

    constructor() {
        super();

        window.system = this;

        const { controllers, commands, contexts } = bootstrap(modules);

        _.each(controllers, (controller, name) => {
            if (name in this) {
                throw Error(`system collision detected, "${name}" controller can't be instantiated`);
            }
            this[name] = new controller(this);
        });

        this.commands.registerCommands(commands);
        this.commands.registerContexts(contexts);
    }

    get di() {
        return {
            system: this,
        };
    }

}
