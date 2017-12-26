import { view, Group, Path, Symbol } from 'paper';

export default class SquareGrid {

    constructor(settings = {}) {
        this.update(settings);
    }

    update(settings) {
        const {
            tileSize    = 32,
            strokeColor = 'rgba(0, 0, 255, .1)',
        } = this.settings = settings || this.settings;
        const { width, height, left, top } = view.bounds;

        let vLine = new Path.Line({from: [0, 0], to: [0, height], strokeColor});
        let hLine = new Path.Line({from: [0, 0], to: [width, 0], strokeColor});

        const vSymbol = new Symbol(vLine, true);
        const hSymbol = new Symbol(hLine, true);

        const children = [];
        const rows = Math.ceil(width / tileSize);
        const cols = Math.ceil(height / tileSize);

        for (let i = 1; i < cols; i++) {
            children.push(vSymbol.place([ left + i * tileSize, 0 ]));
        }

        for (let i = 1; i < rows; i++) {
            children.push(hSymbol.place([ 0, top + i * tileSize ]));
        }

        if (this.group) {
            this.group.remove();
        }

        return this.group = new Group(children);
    }

}

export function generate(tileSize, strokeColor = 'rgba(0, 0, 255, .1)') {
    const { width, height, left, top } = view.bounds;

    let vLine = new Path.Line({from: [0, 0], to: [0, height], strokeColor});
    let hLine = new Path.Line({from: [0, 0], to: [width, 0], strokeColor});

    const vSymbol = new Symbol(vLine, true);
    const hSymbol = new Symbol(hLine, true);

    const children = [];
    const rows = Math.ceil(width / tileSize);
    const cols = Math.ceil(height / tileSize);

    for (let i = 1; i < cols; i++) {
        children.push(vSymbol.place([ left + i * tileSize, 0 ]));
    }

    for (let i = 1; i < rows; i++) {
        children.push(hSymbol.place([ 0, top + i * tileSize ]));
    }

    return new Group(children);
}
