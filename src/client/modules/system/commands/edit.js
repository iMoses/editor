export const UNDO = 'system.edit.undo';
export const REDO = 'system.edit.redo';

export default [
    {
        id:    UNDO,
        title: 'U_ndo',
        suggestedKeys: 'ctrl z',
        onChange(ctx, sys) {
            console.log('change', ctx, sys);
            },
        onExecute(ctx, sys) {
            console.log('execute', ctx, sys);
        },
    },
    {
        id:    REDO,
        title: 'R_edo',
        suggestedKeys: 'ctrl y',
    },
];
