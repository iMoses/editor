import * as commands from './commands';

export const CANVAS = 'editor.canvas';

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
];
