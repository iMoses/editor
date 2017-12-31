import { view, Group, Path, Symbol } from 'paper';

export default class SquareGrid {

    constructor(project) {
        this.project = project;
        this.update();
    }

    LineSymbol(vertical = false, strong = false) {
        const { width, height } = this.project.view.bounds;
        return new Symbol(
            new Path.Line({
                from:        [0, 0],
                to:          vertical ? [0, height] : [width, 0],
                opacity:     strong ? .3 : .1,
                strokeColor: '#e8e8e8',
            }),
            true
        );
    }

    update(tileSize = 32) {
        const { width, height, left, top } = this.project.view.bounds;

        const vSymbol     = this.LineSymbol(true);
        const hSymbol     = this.LineSymbol(false);
        const vSymbolBold = this.LineSymbol(true, true);
        const hSymbolBold = this.LineSymbol(false, true);

        const children = [];
        const cols = Math.ceil(width / tileSize);
        const rows = Math.ceil(height / tileSize);

        for (let i = 1; i < cols; i++) {
            children.push(
                (i % 5 ? vSymbol : vSymbolBold).place([ left + i * tileSize, 0 ])
            );
        }

        for (let i = 1; i < rows; i++) {
            children.push(
                (i % 5 ? hSymbol : hSymbolBold).place([ 0, top + i * tileSize ])
            );
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
