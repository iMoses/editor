export const ACTIVATE_DRAW          = 'editor.tools.draw.activate';
export const ACTIVATE_SELECT        = 'editor.tools.select.activate';
export const ACTIVATE_LIGHT_SOURCE  = 'editor.tools.lightSource.activate';

export default [
    {
        id:    ACTIVATE_DRAW,
        title: 'D_raw',
        suggestedKeys: 'alt d',
        onExecute(ctx, { controllers: { editor } }) {
            editor.tools.draw.activate();
        },
    },
    {
        id:    ACTIVATE_SELECT,
        title: 'S_elect',
        suggestedKeys: 'alt s',
        onExecute(ctx, { controllers: { editor } }) {
            editor.tools.select.activate();
        },
    },
    {
        id:    ACTIVATE_LIGHT_SOURCE,
        title: 'L_ight Source',
        suggestedKeys: 'alt a',
        onExecute(ctx, { controllers: { editor } }) {
            editor.tools.lightSource.activate();
        },
    },
];
