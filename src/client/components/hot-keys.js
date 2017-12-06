import { Component, PropTypes, ReactDOM } from 'lib/react';
import Keypress from 'lib/keypress';
import FocusTrap from './focus-trap';
import _ from 'lodash';

export default class HotKeys extends Component {

    static propTypes = {
        keyMap:         PropTypes.object,
        handlers:       PropTypes.object,
        defaults:       PropTypes.object,
        attach:         PropTypes.any,  // dom element to listen for key events
        autoFocus:      PropTypes.bool, // externally controlled focus
        onFocusLeave:   PropTypes.func,
        onFocusEnter:   PropTypes.func,
        children:       PropTypes.node,
    };

    static contextTypes = {
        hotKeys:    PropTypes.object,
    };

    static childContextTypes = {
        hotKeys:    PropTypes.object,
    };

    static eventTypes = {
        keydown:    'onKeyDown',
        keyup:      'onKeyUp',
        release:    'onRelease',
    };

    getChildContext() {
        return {hotKeys: this};
    }

    componentDidMount() {
        this.keypress = new Keypress(
            this.props.attach || ReactDOM.findDOMNode(this),
            this.props.defaults
        );
        this.registerSelf();
        this.updateHotKeys();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.keyMap !== this.props.keyMap) {
            this.updateHotKeys();
        }
    }

    componentWillUnmount() {
        this.unregisterSelf();
        this.keypress.reset();
        delete this.keypress;
    }

    blur() {
        this.trap.blur();
    }

    focus() {
        this.trap.focus();
    }

    registerChild(hotKeysChild) {
        this.hotKeysChild = hotKeysChild;
    }

    registerSelf() {
        if (this.context.hotKeys) {
            this.context.hotKeys.registerChild(this);
        }
    }

    unregisterSelf() {
        if (this.context.hotKeys &&
            this.context.hotKeys.hotKeysChild === this) {
            this.context.hotKeys.registerChild(null);
        }
    }

    updateHotKeys() {
        if (this.props.keyMap) {
            this.keypress.reset();
            _.each(this.props.keyMap, (keys, action) => this.registerAction(action, keys));
        }
    }

    inKeyMap(action) {
        return this.props.keyMap && this.props.keyMap[action];
    }

    findHandlers(action, eventName, result) {
        const { props: { handlers }, hotKeysChild } = this;
        const list = hotKeysChild && !hotKeysChild.inKeyMap(action)
            ? hotKeysChild.findHandlers(action, eventName, result)
            : [];

        if (handlers && handlers[action]) {
            list.push(
                _.isPlainObject(handlers[action])
                    ? handlers[action][eventName]
                    : handlers[action]
            );
        }

        return list;
    }

    registerAction(action, keys) {
        if (Array.isArray(keys)) {
            return keys.forEach(keys => this.registerAction(action, keys));
        }
        if (_.isPlainObject(keys)) {
            const listen = should => should ? e => this.handleEvent(action, e) : undefined;
            let { onKeyDown, onKeyUp, onRelease, ...options } = keys;
            onKeyDown || (onKeyDown = !onKeyUp && !onRelease);
            this.keypress.registerCombo({
                ...options,
                onKeyDown:  listen(onKeyDown),
                onKeyUp:    listen(onKeyUp),
                onRelease:  listen(onRelease),
            });
        }
        else {
            this.keypress.simpleCombo(keys, e => this.handleEvent(action, e));
        }
    }

    handleEvent(action, event) {
        this.findHandlers(action, HotKeys.eventTypes[event.type])
            .every(handler => handler(event) !== false);
    }

    handleFocusEnter(event) {
        this.registerSelf();
        if (this.props.onFocusEnter) {
            this.props.onFocusEnter(event);
        }
    }

    handleFocusLeave(event) {
        this.unregisterSelf();
        if (this.props.onFocusLeave) {
            this.props.onFocusLeave(event);
        }
    }

    handleRefs(ref) {
        if (ref) {
            this.trap = ref;
            this.component = ref.component;
        }
    }

    render() {
        const { keyMap, handlers, defaults, attach, ...props } = this.props;
        return (
            <FocusTrap
                {...props}
                ref={ref => this.handleRefs(ref)}
                onFocusEnter={e => this.handleFocusEnter(e)}
                onFocusLeave={e => this.handleFocusLeave(e)}
            />
        );
    }

}
