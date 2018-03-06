import createStorage from 'lib/storage';
import bootstrap from './bootstrap';
import * as modules from 'modules';
import EventEmitter from 'events';
import IOC from 'lib/ioc';
import paper from 'paper';
// import _ from 'lodash';

export default class SystemController extends EventEmitter {

    constructor({ storage = localStorage } = {}) {
        super();

        window.system = this;

        this.di = IOC.container;
        IOC.constant('system', this);
        IOC.constant('paper', paper);
        IOC.constant('storage', createStorage(storage));

        const { commands, contexts } = bootstrap(modules);

        this.di.controllers.commands
            .registerCommands(commands)
            .registerContexts(contexts);
    }

}
