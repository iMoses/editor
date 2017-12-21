import * as commands from '../commands';

export const EDIT = 'system.file-menu.edit';
export const HELP = 'system.file-menu.help';

export default [
    {
        id:     EDIT,
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
    {
        id:     HELP,
        title:  'H_elp',
        groups: [
            {
                items: [
                    commands.OPEN_MANUALS,
                ],
            },
        ],
    },
];
