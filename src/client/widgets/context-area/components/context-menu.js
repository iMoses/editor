import { Component, PropTypes, ReactDOM, cssModules } from 'lib/react';
import HotKeys from 'components/hot-keys';

@cssModules(require('./context-menu.scss'))
export default class ContextMenu extends Component {

    static propTypes = {
        style:      PropTypes.object,
        context:    PropTypes.object.isRequired,
        autoSelect: PropTypes.bool,
        onClose:    PropTypes.func,
    };

    constructor(props) {
        super(...arguments);
        this.state = {
            activeId:      -1,
            expandChild:   false,
            selectChild:   false,
            overflowRight: false,
            style:         props.style,
        };
        this.handlers = {
            previous: () => this.previous(),
            next:     () => this.next(),
            backward: () => this.backward(),
            forward:  () => this.forward(),
            close:    () => this.close(),
            select:   e => this.execute(e),
        };
    }

    componentDidMount() {
        if (this.props.autoSelect) {
            this.next();
        }
        this.updateStyle();
        if (this.props.autoFocus) {
            this.trap.focus();
        }
    }

    componentWillUpdate(nextProps) {
        if (this.props.style !== nextProps.style) {
            this.setState({style: nextProps.style});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.expandChild &&
            prevState.expandChild !== this.state.expandChild) {
            this.trap.focus();
        }
        if (this.props.style !== prevProps.style) {
            this.updateStyle();
        }
    }

    updateStyle() {
        this.setState(({ style }) => {
            const el = ReactDOM.findDOMNode(this);
            const { right, bottom } = el.getBoundingClientRect();
            if (bottom > window.innerHeight) {
                style = {...style, top: window.innerHeight - bottom - 1};
            }
            return {style, overflowRight: right > window.innerWidth};
        });
    }

    select(activeId, expandChild = false, selectChild = false) {
        this.setState({activeId, expandChild, selectChild});
    }

    clear(event) {
        if (event) {
            event.stopPropagation();
        }
        this.select(-1);
        this.trap.focus();
    }

    previous() {
        let { state: { activeId }, props: { context: { items } } } = this;
        do {
            activeId < 0 ? activeId = items.length - 1 : activeId--;
        }
        while (activeId !== -1 && items[activeId].disabled);
        this.select(activeId);
        return false;
    }

    next() {
        let { state: { activeId }, props: { context: { items } } } = this;
        do {
            activeId === items.length - 1 ? activeId = -1 : activeId++;
        }
        while (activeId !== -1 && items[activeId].disabled);
        this.select(activeId);
        return false;
    }

    backward() {
        return this.close(true);
    }

    forward() {
        const { state: { activeId, selectChild }, props: { context: { items } } } = this;
        if (activeId !== -1 && items[activeId].groups && !selectChild) {
            this.select(activeId, true, true);
            return false;
        }
    }

    close(backward = false, propagate = false) {
        if (this.props.onClose) {
            this.props.onClose(backward, propagate);
            return false;
        }
    }

    execute(event) {
        const { state: { activeId }, props: { context: { items } } } = this;
        if (items[activeId].disabled) {
            return;
        }
        if (items[activeId].emit) {
            items[activeId].emit(event);
            return this.close(false, true);
        }
        else if (items[activeId].items) {
            this.select(activeId, true, true);
        }
    }

    handleMouseEnter(event, id, menuItem) {
        event.stopPropagation();
        this.select(id, !!menuItem.groups);
    }

    handleClick(event) {
        event.stopPropagation();
        this.execute(event);
    }

    handleClose(backward, propagate) {
        if (propagate) {
            if (this.props.onClose) {
                this.props.onClose(backward, propagate);
            }
        }
        else {
            this.select(this.state.activeId);
        }
    }

    render() {
        const {
            props: { context: { groups } },
            state: { activeId, expandChild, selectChild, overflowRight, style },
        } = this;
        let count = 0;

        return (
            <HotKeys
                style={style}
                handlers={this.handlers}
                ref={ref => this.trap = ref}
                className={['context-menu', {overflowRight}]}
                onMouseLeave={e => this.clear(e)}
                onContextMenu={e => e.preventDefault()}>

                {groups.map(({ items }, groupId) =>
                    <div key={groupId} className="context-group">
                        {items.map(menuItem => {
                            const id = count++;
                            return (
                                <ContextMenuItem
                                    key={id}
                                    menuItem={menuItem}
                                    selected={activeId === id}
                                    expanded={activeId === id && expandChild}
                                    autoSelect={selectChild}
                                    onClick={e => this.handleClick(e)}
                                    onClose={(...args) => this.handleClose(...args)}
                                    onMouseEnter={e => this.handleMouseEnter(e, id, menuItem)}
                                />
                            );
                        })}
                    </div>
                )}

            </HotKeys>
        );
    }

}

@cssModules(require('./context-menu.scss'))
export class ContextMenuItem extends Component {

    static propTypes = {
        menuItem:     PropTypes.object.isRequired,
        expanded:     PropTypes.bool,
        selected:     PropTypes.bool,
        onClick:      PropTypes.func,
        onMouseEnter: PropTypes.func,
    };

    render() {
        const {
            expanded, selected, onClick, onMouseEnter,
            menuItem: { title, keysLabel, disabled, groups },
            menuItem, ...props
        } = this.props;
        const className = {selected, disabled, hasItems: groups};

        return (
            <div className={className} onClick={onClick} onMouseEnter={onMouseEnter}>
                <p>
                    <MenuHint title={title} />
                    {keysLabel && <kbd>{keysLabel}</kbd>}
                </p>
                {expanded && groups && <ContextMenu context={menuItem} {...props} />}
            </div>
        );
    }

}

export function MenuHint({ title, ...props }) {
    return <span {...props} dangerouslySetInnerHTML={{__html: title.replace(/(.)_/, '<em>$1</em>')}} />;
}
