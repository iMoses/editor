import Bottle from 'bottlejs';

const postfixRegex = /^(.+)(Controller|Service)$/;

export default class IOC {

    static di;

    static get container() {
        return IOC.di.container;
    }

    static initialize() {
        IOC.di = new Bottle;
        IOC.di.constant('di', IOC.di.container);
    }

    static constant() {
        IOC.di.constant(...arguments);
    }

    static normalizeName = name => name.charAt(0).toLowerCase() + name.slice(1);

    static service(Constructor, ...dependencies) {
        const service = (name, ns) => {
            name = IOC.normalizeName(name);
            IOC.di.service(ns ? `${ns}.${name}` : name, Constructor, ...dependencies);
        };

        let matches;
        if (matches = postfixRegex.exec(Constructor.name)) {
            return service(matches[1], `${matches[2].toLowerCase()}s`);
        }

        return service(Constructor.name);
    }

}

IOC.initialize();

export const service = decorator(IOC.service);

export function decorator(func) {
    return function(Constructor) {
        if (typeof Constructor === 'function') {
            func(Constructor, 'di');
            return Constructor;
        }
        return Constructor => {
            func(Constructor, ...arguments);
            return Constructor;
        };
    };
}
