import { Component, PropTypes, cssModules, observer, inject } from 'lib/react';
import HotKeys from 'components/hot-keys';
import MenuButton from './menu-button';

@inject(({ system }) => ({
    contextsMap: system.commands.contextsMap,
}))
@observer
@cssModules(require('./file-menu.scss'))
export default class FileMenu extends Component {

    static propTypes = {
        fileMenu: PropTypes.array,
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
        this.state = {activeId: -1, focus: false};
        this.handlers = {
            forward: () => this.next(),
            close:   () => this.reset(),
        };
    }

    reset() {
        this.setState({activeId: -1, focus: false});
    }

    previous() {
        const { state: { activeId }, props: { fileMenu } } = this;
        this.setState({activeId: activeId === 0 ? fileMenu.length - 1 : activeId - 1});
    }

    next() {
        const { state: { activeId }, props: { fileMenu } } = this;
        this.setState({activeId: fileMenu.length - 1 === activeId ? 0 : activeId + 1});
    }

    handleClick(event, id) {
        if (this.state.focus) {
            this.activeElement.focus();
            this.reset();
        }
        else if (id) {
            // if (this.system.contextMenu === false) {
            this.activeElement = document.activeElement;
            // }
            this.setState({activeId: id, focus: true});
        }
    }

    handleClose(backwards, propagate) {
        if (propagate || !backwards) {
            this.activeElement.focus();
        }
        else if (backwards) {
            this.previous();
        }
    }

    handleFocusEnter() {
        // if (this.system.contextMenu) {
        //     this.listenToBlur = true;
        // }
    }

    handleFocusLeave() {
        if (this.listenToBlur) {
            this.listenToBlur = false;
            this.activeElement = document.activeElement;
            this.refs.trap.focus();

            // event.preventDefault();
            // event.stopPropagation();
        }
        else {
            this.reset();
        }
    }

    handleMouseEnter(id) {
        if (this.state.focus) {
            this.setState({activeId: id});
        }
    }

    render() {
        const { props: { fileMenu, contextsMap }, state: { activeId } } = this;
        return (
            <HotKeys
                ref="trap"
                component="section"
                className="file-menu"
                keyMap={FileMenu.keyMap}
                handlers={this.handlers}
                onMouseDown={e => this.handleClick(e)}
                onFocusEnter={e => this.handleFocusEnter(e)}
                onFocusLeave={e => this.handleFocusLeave(e)}>

                {fileMenu.map((contextId) => (
                    <MenuButton
                        key={contextId}
                        active={activeId === contextId}
                        context={contextsMap.get(contextId)}
                        onClose={(...args) => this.handleClose(...args)}
                        onMouseDown={e => this.handleClick(e, contextId)}
                        onMouseEnter={() => this.handleMouseEnter(contextId)}
                    />
                ))}

            </HotKeys>
        );
    }

}
