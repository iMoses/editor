import { observable, computed, action } from 'mobx';
import ContextMenu from './context-menu';
import BaseCommand from './base-command';
import EventEmitter from 'events';
import { service } from 'lib/ioc';
import _ from 'lodash';

@service
export default class CommandsController extends EventEmitter {

    @observable context = {
        id:      'default',
        payload: null,
    };

    @observable commandsMap = observable.map();
    @observable contextsMap = observable.map();

    constructor(system) {
        super();
        this.system = system;
    }

    @computed
    get contextMenu() {
        return this.contextsMap.get(this.context.id);
    }

    @computed
    get serialized() {
        const { id, payload } = this.context;
        return {id, payload};
    }

    @action.bound
    update(contextId, payload) {
        if (this.context.id !== contextId ||
            this.context.payload !== payload) {
            this.context.id      = contextId;
            this.context.payload = payload;
            this.emit('change', this.serialized, this.system);
        }
        return this;
    }

    @action.bound
    registerCommands(commands) {
        (Array.isArray(commands) ? commands : [commands]).forEach(cmd =>
            this.commandsMap.set(cmd.id, new (cmd.Command || BaseCommand)(cmd, this))
        );
        return this;
    }

    @action.bound
    registerContexts(contexts) {
        (Array.isArray(contexts) ? contexts : [contexts]).map(ctx => {
            const contextMenu = new ContextMenu(ctx, this);
            this.contextsMap.set(ctx.id, contextMenu);
            return contextMenu;
        }).forEach(ctx => ctx.generateGroups(this));
        return this;
    }

    commandEmitter(command) {
        return payload => this.emit(command.id, {
            command,
            payload,
            context:   this.serialized,
            selection: window.getSelection(),
        }, this.system);
    }

    @computed
    get shortcuts() {
        const shortcuts = {};
        this.commandsMap.forEach(command => {
            let { keys } = command;
            if (keys) {
                Array.isArray(keys) || (keys = [keys]);
                keys.forEach(key => shortcuts[key.toLowerCase()] = command);
            }
        });
        return shortcuts;
    }

    @computed
    get shortcutsKeyMap() {
        return _.reduce(this.shortcuts, (keyMap, command, shortcut) => {
            keyMap[command.id] = shortcut;
            return keyMap;
        }, {});
    }

    @computed
    get shortcutsHandlers() {
        return _.reduce(this.shortcuts, (handlers, command) => {
            handlers[command.id] = command.emit;
            return handlers;
        }, {});
    }

}
