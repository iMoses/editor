import { Component, cssModules, inject, observer, ReactDOM } from 'lib/react';
import ContextArea from 'widgets/context-area';
// import PeerConnection from 'lib/rtc';
import _ from 'lodash';

@inject(({ system, controllers: { editor } }) => ({
    editor,
    system,
}))
@observer
@cssModules(require('./canvas.scss'))
export default class EditorCanvas extends Component {

    componentDidMount() {
        const { editor, system } = this.props;
        editor.createProject('projectId', ReactDOM.findDOMNode(this));
        editor.tools.draw.activate();

        window.editor = editor;
        window.paper = system.di.paper;

        // const p2p = window.p2p = new PeerConnection;
        // p2p.connect()
        //     .then(() => p2p.sendMessage({state: {a: 1, b: 4}}))
        //     .catch(err => console.error(err));
    }

    handleWheel(event) {
        event.preventDefault();
        const { editor } = this.props;
        event.ctrlKey && editor.handleZoomEvent(event);
    }

    render() {
        const { editor } = this.props;
        return (
            <ContextArea
                component="canvas"
                contextId="editor.canvas"
                className={['editor-canvas', `${_.kebabCase(_.findKey(editor.tools, editor.tool))}-tool`]}
                onWheel={e => this.handleWheel(e)}
                autoFocus
            />
        );
    }

}
