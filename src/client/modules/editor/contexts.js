import * as commands from './commands';

export const CANVAS = 'editor.canvas';
export const TOOLS  = 'editor.tools';

export default [
    {
        id:     CANVAS,
        title:  'V_iew',
        groups: [
            {
                items: [
                    commands.TOGGLE_GRID,
                ],
            },
        ],
    },
    {
        id:     TOOLS,
        title:  'T_ools',
        groups: [
            {
                items: [
                    commands.TOGGLE_GRID,
                ],
            },
        ],
    },
];
