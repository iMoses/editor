export const TOGGLE_GRID = 'editor.toggleGrid';

export default [
    {
        id:    TOGGLE_GRID,
        title: 'Show G_rid',
        suggestedKeys: 'ctrl h',
        onExecute(ctx, { controllers: { editor } }) {
            editor.toggleGrid();
        },
    },
];
