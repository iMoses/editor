import { Group, Path, Symbol } from 'paper';

export default class SquareGrid extends Group {

    static VERTICAL = 1;
    static BOLD     = 2;

    static tileSize     = 32;
    static boldAfter    = 5;

    static adjust(val) {
        return val - val % SquareGrid.tileSize;
    }

    static offset(val) {
        const offset = (
            val > 0
                ? -Math.floor(val / SquareGrid.tileSize)
                : Math.floor(val / -SquareGrid.tileSize)
        ) % SquareGrid.boldAfter;
        return offset < 0 ? offset + SquareGrid.boldAfter : offset;
    }

    static createSymbol({
        width,
        height,
        vertical    = false,
        bold        = false,
        strokeColor = 'rgb(0, 0, 213)',
    }) {
        return new Symbol(
            new Path.Line({
                from:        [0, 0],
                to:          vertical ? [0, height] : [width, 0],
                opacity:     bold ? .2 : .1,
                strokeColor,
            }),
            true
        );
    }

    constructor() {
        super(...arguments);
    }

    update({ width, height, left, top }, { color: strokeColor } = {}) {
        const { VERTICAL, BOLD, tileSize, boldAfter, adjust, offset, createSymbol } = this.constructor;

        const lineSymbol = flags => createSymbol({
            vertical:   flags & VERTICAL,
            bold:       flags & BOLD,
            width,
            height,
            strokeColor,
        });

        const vSymbol     = lineSymbol(VERTICAL);
        const hSymbol     = lineSymbol();
        const vSymbolBold = lineSymbol(VERTICAL | BOLD);
        const hSymbolBold = lineSymbol(BOLD);

        const cols = Math.ceil(width / tileSize) + 1;
        const rows = Math.ceil(height / tileSize) + 1;

        const vOffset = offset(left);
        const hOffset = offset(top);

        const children = [];

        for (let i = 0; i < cols; i++) {
            children.push(
                (i % boldAfter === vOffset ? vSymbolBold : vSymbol).place([ adjust(left) + i * tileSize, top  ])
            );
        }

        for (let i = 0; i < rows; i++) {
            children.push(
                (i % boldAfter === hOffset ? hSymbolBold : hSymbol).place([ left, adjust(top) + i * tileSize ])
            );
        }

        if (this.hasChildren()) {
            this.removeChildren();
        }

        this.addChildren(children);
    }

}
