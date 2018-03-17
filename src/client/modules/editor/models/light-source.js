import { observable, computed, action } from 'mobx';

export default class LightSourceModel {

    static SQUARE  = 'square';
    static HEXAGON = 'hexagon';

    @observable size;
    @observable shape;
    @observable zoom;

    constructor(shape = GridModel.SQUARE, size = 32, zoom = 1) {
        this.shape = shape;
        this.size  = size;
        this.zoom  = zoom;
    }

    @computed
    get settings() {
        return {
            grid: {},
        };
    }

}
