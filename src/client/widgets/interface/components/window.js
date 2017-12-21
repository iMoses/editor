import { Component, PropTypes, Provider } from 'lib/react';
import HotKeys from 'components/hot-keys';
import Layout from './layout';

export default class Application extends Component {

    static windowEvents = [
        'blur',
        'error',
        'focus',
        'offline',
        'online',
        'resize',
        'storage',
    ];

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
        Application.windowEvents.forEach(event =>
            window.addEventListener(event,
                this.eventHandlers[event] = system.emit.bind(system, event)
            )
        );
    }

    componentWillUnmount() {
        Application.windowEvents.forEach(event =>
            window.removeEventListener(event, this.eventHandlers[event])
        );
    }

    render() {
        const { system } = this.props;
        return (
            <Provider key={Date.now()} {...system.di}>
                <HotKeys
                    component={Layout}
                    keyMap={system.commands.shortcutsKeyMap}
                    handlers={system.commands.shortcutsHandlers}
                />
            </Provider>
        );
    }

}
