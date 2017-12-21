import { Component, cssModules } from 'lib/react';
import ContextArea from 'widgets/context-area';
import FileMenu from 'widgets/file-menu';
import * as system from 'modules/system';

@cssModules(require('./layout.scss'))
export default class DefaultLayout extends Component {

    render() {
        return (
            <section className="layout"
                 onContextMenu={e => e.shiftKey || e.preventDefault()}>

                <header>
                    <FileMenu contexts={[
                        system.EDIT,
                        system.HELP,
                    ]} />
                </header>

                <ContextArea component="section" autoFocus>
                    Default layout
                </ContextArea>

                <footer>
                    <div className="status-bar" />
                </footer>

            </section>
        );
    }

}
