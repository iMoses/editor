import { Component, PropTypes, cssModules } from 'lib/react';
import HotKeys from 'components/hot-keys';
import { Provider } from 'mobx-react';
import system from 'modules/system';
import ContextArea from 'widgets/context-area';

@cssModules(require('./default.scss'))
export default class DefaultLayout extends Component {

    render() {
        return (
            <ContextArea className="layout">

                <p>Default layout</p>

            </ContextArea>
        );
    }

}
