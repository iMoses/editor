import _ from 'lodash';

export default function bootstrap(modules) {
    const controllers = {};
    const commands = [];
    const contexts = [];

    _.each(modules, (module, moduleName) => {
        if (module.controller) {
            controllers[moduleName] = module.controller;
        }
        if (module.commands) {
            commands.push(...module.commands);
        }
        if (module.contexts) {
            contexts.push(...module.contexts);
        }
    });

    return {controllers, commands, contexts};
}
