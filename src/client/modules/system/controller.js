import bootstrap from './bootstrap';
import * as modules from 'modules';
import EventEmitter from 'events';
import IOC from 'lib/ioc';
import paper from 'paper';
// import _ from 'lodash';

export default class SystemController extends EventEmitter {

    constructor() {
        super();

        window.system = this;

        this.di = IOC.container;
        IOC.constant('system', this);
        IOC.constant('paper', paper);

        const { commands, contexts } = bootstrap(modules);

        this.di.controllers.commands
            .registerCommands(commands)
            .registerContexts(contexts);
    }

}
