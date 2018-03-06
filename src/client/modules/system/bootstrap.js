import _ from 'lodash';

export default function bootstrap(modules) {
    const commands = [];
    const contexts = [];

    _.each(modules, module => {
        if (module.commands) {
            commands.push(...module.commands);
        }
        if (module.contexts) {
            contexts.push(...module.contexts);
        }
    });

    return {commands, contexts};
}
