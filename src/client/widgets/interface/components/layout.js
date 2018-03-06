import { Component, PropTypes, cssModules } from 'lib/react';
import SideMenu from '../containers/side-menu';
import ContextArea from 'widgets/context-area';
import { EditorCanvas } from 'widgets/editor';
import FileMenu from 'widgets/file-menu';
import * as system from 'modules/system';

@cssModules(require('./layout.scss'))
export default class DefaultLayout extends Component {

    static contextTypes = {
        system: PropTypes.object.isRequired,
    };

    render() {
        return (
            <section
                className="layout"
                onContextMenu={e => e.shiftKey || e.preventDefault()}>

                <header>
                    <FileMenu contexts={[
                        system.EDIT,
                        system.VIEW,
                        system.HELP,
                    ]} />
                </header>

                <section className="main-screen">
                    <ContextArea component={EditorCanvas} autoFocus />
                    <SideMenu />
                </section>

                <footer>
                    <div className="status-bar" />
                </footer>

            </section>
        );
    }

}
