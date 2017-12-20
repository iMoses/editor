import { Component, PropTypes, ReactDOM, observer } from 'lib/react';
import ContextMenu from './context-menu';
import HotKeys from 'components/hot-keys';

@observer
export default class ContextMenuRoot extends Component {

    static propTypes = {
        contextMenu: PropTypes.object,
        style:       PropTypes.object,
        onClose:     PropTypes.func,
    };

    static keyMap = {
        previous: 'up',
        next:     'down',
        backward: 'left',
        forward:  'right',
        close:    'esc',
        select:   ['enter', 'space'],
    };

    constructor(props) {
        super(...arguments);
        this.state = {style: props.style};
        this.activeElement = document.activeElement;
    }

    componentDidUpdate(prevProps) {
        const { style } = this.props;
        if (style && style !== prevProps.style) {
            const menuNode = ReactDOM.findDOMNode(this.contextMenu);
            this.setState({
                style: {
                    top:  Math.min(style.top, window.innerHeight - menuNode.offsetHeight),
                    left: Math.min(style.left, window.innerWidth - menuNode.offsetWidth),
                },
            });
            if (menuNode !== document.activeElement) {
                this.activeElement = document.activeElement;
                this.contextMenu.clear();
            }
        }
    }

    handleClose() {
        if (this.props.onClose) {
            this.props.onClose();
        }
        // if (this.system.contextMenu) {
        this.activeElement.focus();
            // this.system.contextMenu = false;
        // }
    }

    render() {
        const { state: { style }, props: { contextMenu } } = this;
        return ReactDOM.createPortal((
            <HotKeys
                keyMap={ContextMenuRoot.keyMap}
                onFocusLeave={() => this.handleClose()}>

                <ContextMenu
                    style={style}
                    context={contextMenu}
                    ref={ref => this.contextMenu = ref}
                    onClose={backward => backward || this.handleClose()}
                />

            </HotKeys>
        ), document.getElementById('root'));
    }

}
