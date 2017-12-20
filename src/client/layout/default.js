import { Component, PropTypes, cssModules } from 'lib/react';
import HotKeys from 'components/hot-keys';
import { Provider } from 'mobx-react';
import system from 'modules/system';
import ContextArea from 'widgets/context-area';

@cssModules(require('./default.scss'))
export default class DefaultLayout extends Component {

    static childContextTypes = {
        system: PropTypes.object,
    };

    getChildContext() {
        return {system};
    }

    render() {
        return (
            <Provider key={Date.now()} {...system.di}>
                <ContextArea component={HotKeys} className="layout">
                    Default layout
                </ContextArea>
            </Provider>
        );
    }

}
