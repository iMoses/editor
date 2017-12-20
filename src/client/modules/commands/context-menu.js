import { observable, computed, action, extendObservable } from 'mobx';
import CommandsGroup from './commands-group';

export default class ContextMenu {

    @observable id          = null;   // string
    @observable icon        = null;   // string
    @observable title       = null;   // string
    @observable description = null;   // string
    @observable groups      = [];     // [CommandsGroup]

    constructor(settings = {}) {
        const { id, icon, title, description, groups } = settings;
        extendObservable(this, {id, icon, title, description, groups});
    }

    @computed
    get items() {
        return this.groups.reduce((items, group) => items.concat(group.items.peek()), []);
    }

    @computed
    get commands() {
        return this.groups.reduce((commands, group) => commands.concat(group.commands.peek()), []);
    }

    @action.bound
    generateGroups({ commandsMap, contextsMap }) {
        this.groups.forEach((group, gid) => {
            group.items.forEach((item, cid) =>
                group.items[cid] =
                    typeof item === 'string' ?
                        commandsMap.has(item)
                            ? commandsMap.get(item)
                            : contextsMap.get(item)
                        : item
            );
            this.groups[gid] = new CommandsGroup(group);
        });
    }

}
