import { Component, cssModules, inject } from 'lib/react';
import ContextArea from 'widgets/context-area';
import Editor from 'lib/editor';

@inject(({ system, controllers: { editor } }) => ({
    editor,
    system,
}))
@cssModules(require('./canvas.scss'))
export default class EditorCanvas extends Component {

    componentDidMount() {
        const { editor } = this.props;
        editor.createProject('projectId', this.canvas);
        // editor.tools['light-tool'].tool.on('mousemove', () => editor.test());
    }

    handleWheel(event) {
        event.preventDefault();
        const { editor } = this.props;
        if (event.ctrlKey) {
            editor.handleZoomEvent(event);
        }
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
