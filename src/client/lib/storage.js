export default function createStorage(storage) {
    return {
        has(name) {
            return storage.getItem(name) !== null;
        },
        get(name) {
            try {
                return JSON.parse(storage.getItem(name) || 'null');
            }
            catch (e) {
                return null;
            }
        },
        set(name, value) {
            storage.setItem(name, JSON.stringify(value));
        },
        remove(name) {
            storage.removeItem(name);
        },
        clear() {
            storage.clear();
        }
    };
}
