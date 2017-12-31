import * as commands from '../commands';
import * as editor from '../../editor';

export const EDIT = 'system.file-menu.edit';
export const VIEW = 'system.file-menu.view';
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
        id:     VIEW,
        title:  'V_iew',
        groups: [
            {
                items: [
                    editor.TOGGLE_GRID,
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
