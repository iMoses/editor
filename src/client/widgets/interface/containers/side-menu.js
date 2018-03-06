import { Component, cssModules, inject, observer } from 'lib/react';

@inject(({ stores: { layout } }) => ({
    layout,
}))
@observer
// @cssModules(require('./layout.scss'))
export default class SideMenu extends Component {

    render() {
        const { layout: { menuWidth } } = this.props;
        return (
            <aside style={{width: menuWidth}}>
                Side Menu
            </aside>
        );
    }

}
