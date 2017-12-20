import * as commands from './commands';

export const DEFAULT = 'default';

export default [
    {
        id:     DEFAULT,
        title:  'E_dit',
        groups: [
            {
                items: [
                    commands.UNDO,
                    commands.REDO,
                ],
            },
        ],
    },
];
