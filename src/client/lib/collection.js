import { observable, computed, action, toJS } from 'mobx';

export default class Collection {

    @observable entries = [];

    @computed
    get length() {
        return this.entries.length;
    }

    @computed
    get serialized() {
        return toJS(this.entries);
    }

    @action.bound
    set(...targets) {
        this.entries = targets;
    }

    @action.bound
    append(...targets) {
        this.entries = this.entries.concat(targets);
    }

    @action.bound
    remove(...targets) {
        this.entries = this.entries.filter(target => !targets.includes(target));
    }

    toggle(...targets) {
        targets.forEach(target =>
            this.has(target)
                ? this.remove(target)
                : this.append(target)
        );
    }

    has(...targets) {
        return targets.every(target => this.entries.includes(target));
    }

    map(func) {
        return this.entries.map(func);
    }

    filter(func) {
        return this.entries.filter(func);
    }

    forEach(func) {
        return this.entries.forEach(func);
    }

}
