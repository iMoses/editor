import { Component, PropTypes, ReactDOM, observer } from 'lib/react';
import ContextMenu from './context-menu';
import HotKeys from 'components/hot-keys';
import _ from 'lodash';

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
    
    static activeElement;

    constructor(props) {
        super(...arguments);
        this.state = {style: props.style};
        ContextMenuRoot.activeElement = document.activeElement;
    }

    componentDidMount() {
        this.updateStyle(this.props.style);
    }

    componentWillUpdate(nextProps) {
        if (!_.isEqual(nextProps.style, this.props.style)) {
            this.updateStyle(nextProps.style);
        }
    }

    updateStyle(style) {
        const menuNode = ReactDOM.findDOMNode(this.contextMenu);
        this.setState({
            style: {
                top:  Math.min(style.top, window.innerHeight - menuNode.offsetHeight),
                left: Math.min(style.left, window.innerWidth - menuNode.offsetWidth),
            },
        });
        if (menuNode !== document.activeElement) {
            ContextMenuRoot.activeElement = document.activeElement;
            this.contextMenu.clear();
        }
    }

    handleClose = () => {
        if (this.props.onClose) {
            this.props.onClose();
        }
        if (ContextMenuRoot.activeElement) {
            ContextMenuRoot.activeElement.focus();
            ContextMenuRoot.activeElement = null;
        }
    };

    render() {
        const { state: { style }, props: { contextMenu } } = this;
        return ReactDOM.createPortal((
            <HotKeys
                id="context-menu-root"
                keyMap={ContextMenuRoot.keyMap}
                onFocusLeave={this.handleClose}>

                <ContextMenu
                    style={style}
                    context={contextMenu}
                    ref={ref => this.contextMenu = ref}
                    onClose={backward => backward || this.handleClose()}
                    autoFocus
                />

            </HotKeys>
        ), document.getElementById('root'));
    }

}
