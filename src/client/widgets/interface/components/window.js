import { Component, PropTypes, Provider } from 'lib/react';
import HotKeys from 'components/hot-keys';
import Layout from './layout';

export default class Window extends Component {

    static windowEvents = [
        'blur',
        'error',
        'focus',
        'offline',
        'online',
        'resize',
        'storage',
    ];

    static propTypes = {
        system: PropTypes.object.isRequired,
    };

    static childContextTypes = {
        system: PropTypes.object.isRequired,
    };

    getChildContext() {
        return {
            system: this.props.system,
        };
    }

    componentDidMount() {
        this.eventHandlers = {};
        const { system } = this.props;
        Window.windowEvents.forEach(event =>
            window.addEventListener(event, (
                this.eventHandlers[event] = system.emit.bind(system, event)
            ))
        );
    }

    componentWillUnmount() {
        Window.windowEvents.forEach(event =>
            window.removeEventListener(event, this.eventHandlers[event])
        );
    }

    render() {
        const { system } = this.props;
        const { commands } = system.di.controllers;
        return (
            <Provider key={Date.now()} {...system.di}>
                <HotKeys
                    component={Layout}
                    keyMap={commands.shortcutsKeyMap}
                    handlers={commands.shortcutsHandlers}
                />
            </Provider>
        );
    }

}
