import { observable, computed, action, autorun } from 'mobx';
import { register } from 'lib/ioc';

@register
export default class LayoutStore {

    static storageId = 'editor.layout';

    @observable menuWidth = 280;

    constructor({ storage }) {
        window.layout = this;
        if (storage.has(LayoutStore.storageId)) {
            const { menuWidth } = storage.get(LayoutStore.storageId);
            this.menuWidth = menuWidth;
        }
        autorun(() => storage.set(LayoutStore.storageId, this.json));
    }

    @computed
    get json() {
        const { menuWidth } = this;
        return {menuWidth};
    }

    @action
    setWidth(menuWidth) {
        this.menuWidth = menuWidth;
    }

}
