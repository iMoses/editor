import Bottle from 'bottlejs';

const factoryRegex = /^(.+)(Factory)$/;
const postfixRegex = /^(.+)(Controller|Service)$/;

export default class IOC {

    static di;

    static get container() {
        return IOC.di.container;
    }

    static initialize() {
        IOC.di = new Bottle;
        IOC.di.constant('di', IOC.container);
    }

    static constant() {
        IOC.di.constant(...arguments);
    }

    static normalizeName = name => name.charAt(0).toLowerCase() + name.slice(1);

    static register(func, ...rest) {
        let matches;
        if (matches = factoryRegex.exec(func.name)) {
            let name = IOC.normalizeName(matches[1]);
            return IOC.di.factory(`${name}.factory`, () => func(IOC.container, ...rest));
        }

        const service = (name, ns) => {
            name = IOC.normalizeName(name);
            IOC.di.service(ns ? `${ns}.${name}` : name, func, ...rest);
        };

        if (matches = postfixRegex.exec(func.name)) {
            return service(matches[1], `${matches[2].toLowerCase()}s`);
        }

        return service(func.name);
    }

}

IOC.initialize();

export const register = decorator(IOC.register);

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
