import { Component, cssModules, inject } from 'lib/react';
import ContextArea from 'widgets/context-area';
import call from 'lib/rtc';

@inject(({ system, controllers: { editor } }) => ({
    editor,
    system,
}))
@cssModules(require('./canvas.scss'))
export default class EditorCanvas extends Component {

    componentDidMount() {
        const { editor, system } = this.props;
        editor.createProject('projectId', this.canvas);
        editor.tools.draw.activate();

        window.editor = editor;
        window.paper = system.di.paper;

        // call();
    }

    handleWheel(event) {
        event.preventDefault();
        const { editor } = this.props;
        event.ctrlKey && editor.handleZoomEvent(event);
    }

    render() {
        return (
            <ContextArea
                component="section"
                contextId="editor.canvas"
                className="editor-canvas"
                onWheel={e => this.handleWheel(e)}>

                <canvas ref={ref => this.canvas = ref} />

            </ContextArea>
        );
    }

}
