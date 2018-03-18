import { Component, cssModules, inject, observer } from 'lib/react';

@inject(({ stores: { layout }, controllers: { editor } }) => ({
    editor,
    layout,
}))
@observer
@cssModules(require('./side-menu.scss'))
export default class SideMenu extends Component {

    render() {
        const { layout: { menuWidth }, editor } = this.props;
        return (
            <aside className="side-menu" style={{width: menuWidth}}>
                <div onClick={() => editor.tools.draw.activate()}>Draw</div>
                <div onClick={() => editor.tools.select.activate()}>Select</div>
                <div onClick={() => editor.tools.lightSource.activate()}>Light Source</div>
            </aside>
        );
    }

}
