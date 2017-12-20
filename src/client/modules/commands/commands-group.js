import { observable, computed, action, extendObservable } from 'mobx';
import ContextMenu from './context-menu';

export default class CommandsGroup {

    @observable type    = null;   // string (normal, checkbox, radio)
    @observable title   = null;   // string (optional)
    @observable visible = null;   // function (context)
    @observable items   = null;   // [Command, ContextMenu]

    constructor(settings = {}) {
        const { type, title, visible, items } = settings;
        extendObservable(this, {type, title, visible, items});
    }

    @computed
    get commands() {
        return this.items.reduce((commands, item) => commands.concat(
            item instanceof ContextMenu ? item.commands : item
        ), []);
    }

}
