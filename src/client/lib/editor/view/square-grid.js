import { view, Group, Path, Symbol } from 'paper';

export default class SquareGrid {

    static tileSize = 32;

    static adjust(val) {
        return val - val % SquareGrid.tileSize;
    }

    static offset(val) {
        const offset = (
            val > 0
                ? -Math.floor(val / SquareGrid.tileSize)
                : Math.floor(val / -SquareGrid.tileSize)
        ) % 5;
        return offset < 0 ? 5 + offset : offset;
    }

    constructor(project, strokeColor = 'rgb(0, 0, 213)') {
        this.project     = project;
        this.strokeColor = strokeColor;
        this.update();
    }

    LineSymbol(vertical = false, strong = false) {
        const { width, height } = this.project.view.bounds;
        return new Symbol(
            new Path.Line({
                from:        [0, 0],
                to:          vertical ? [0, height] : [width, 0],
                opacity:     strong ? .2 : .1,
                strokeColor: this.strokeColor,
            }),
            true
        );
    }

    update() {
        const { width, height, left, top } = this.project.view.bounds;
        const { adjust, offset, tileSize } = this.constructor;

        const vSymbol     = this.LineSymbol(true);
        const hSymbol     = this.LineSymbol(false);
        const vSymbolBold = this.LineSymbol(true, true);
        const hSymbolBold = this.LineSymbol(false, true);

        const cols = Math.ceil(width / tileSize) + 1;
        const rows = Math.ceil(height / tileSize) + 1;

        const vOffset = offset(left);
        const hOffset = offset(top);

        const children = [];


        for (let i = 0; i < cols; i++) {
            children.push(
                (i % 5 === vOffset ? vSymbolBold : vSymbol).place([ adjust(left) + i * tileSize, top  ])
            );
        }

        for (let i = 0; i < rows; i++) {
            children.push(
                (i % 5 === hOffset ? hSymbolBold : hSymbol).place([ left, adjust(top) + i * tileSize ])
            );
        }

        if (this.group) {
            this.group.remove();
        }

        return this.group = new Group(children);
    }

}
