import { Component, PropTypes, observer, inject } from 'lib/react';
import ContextMenuRoot from '../components/context-menu-root';
import FocusTrap from 'components/focus-trap';
import Collection from 'lib/collection';

@inject(({ controllers: { commands } }) => ({
    setContext:  commands.update,
    contextMenu: commands.contextMenu,
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
        this.disposer = this.targets.observe(this.updateContext);
    }

    componentWillUnmount() {
        this.disposer();
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
        event.preventDefault();
        event.stopPropagation();
        if (this.props.onContextMenu) {
            this.props.onContextMenu(event);
        }
        if (this.props.contextMenu) {
            this.setState({position: {top: event.clientY, left: event.clientX}});
        }
    };

    render() {
        const {
            state: { position },
            props: { contextId, contextMenu, setContext, children, ...props }
        } = this;
        return (
            <FocusTrap
                {...props}
                onFocus={this.handleFocus}
                onContextMenu={this.handleContextMenu}>

                {children}

                {position && (
                    <ContextMenuRoot contextMenu={contextMenu} style={position} onClose={this.handleMenuClose} />
                )}

            </FocusTrap>
        );
    }

}
