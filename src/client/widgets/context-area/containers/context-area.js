import ContextMenuRoot from '../components/context-menu-root';
import { Component, PropTypes, observer, inject } from 'lib/react';
import FocusTrap from 'components/focus-trap';
import Collection from 'lib/collection';
import { observe } from 'mobx';

@inject(({ system }) => ({
    setContext:  system.commands.update,
    contextMenu: system.commands.contextMenu,
}))
@observer
export default class ContextArea extends Component {

    static propTypes = {
        contextId:     PropTypes.string,
        onContextMenu: PropTypes.func,
    };

    static defaultProps = {
        contextId: 'default',
    };

    static childContextTypes = {
        targets: PropTypes.object,
    };

    targets = new Collection;

    getChildContext() {
        return {targets: this.targets};
    }

    constructor(props) {
        super(...arguments);
        this.state = {position: null};
        observe(this.targets, this.updateContext);
    }

    updateContext = () =>
        this.props.setContext(this.props.contextId, this.targets);

    handleMenuClose = () =>
        this.setState({position: null});

    handleFocus = event => {
        this.updateContext();
        event.stopPropagation();
    };

    handleContextMenu = event => {
        if (event.shiftKey) return;  // TODO: remove

        event.preventDefault();
        event.stopPropagation();
        if (this.props.onContextMenu) {
            this.props.onContextMenu(event);
        }
        this.setState({position: {top: event.clientY, left: event.clientX}});
    };

    render() {
        const { state: { position }, props: { contextId, contextMenu, setContext, ...props } } = this;
        return (
            <FocusTrap
                {...props}
                onFocus={this.handleFocus}
                onContextMenu={this.handleContextMenu}>

                {position && (
                    <ContextMenuRoot contextMenu={contextMenu} style={position} onClose={this.handleMenuClose} />
                )}

            </FocusTrap>
        );
    }

}
