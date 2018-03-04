import { Component, cssModules, inject } from 'lib/react';
import ContextArea from 'widgets/context-area';

@inject(({ system, controllers: { editor } }) => ({
    editor,
    system,
}))
@cssModules(require('./canvas.scss'))
export default class EditorCanvas extends Component {

    componentDidMount() {
        const { editor, system } = this.props;
        editor.createProject('projectId', this.canvas);
        window.editor = editor;
        window.paper = system.di.paper;
        editor.tools.draw.activate();
    }

    handleWheel(event) {
        event.preventDefault();
        const { editor } = this.props;
        if (event.ctrlKey) {
            editor.handleZoomEvent(event);
        }
    }

    render() {
        // return <section className="editor-canvas"><canvas ref={ref => this.canvas = ref} /></section>;
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
