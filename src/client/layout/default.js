import { Component, cssModules } from 'lib/react';
import paper from 'paper';

window.paper = paper;

@cssModules(require('./default.scss'))
export default class DefaultLayout extends Component {

    render() {
        return (
            <div className="layout">
                default layout!
            </div>
        );
    }

}
