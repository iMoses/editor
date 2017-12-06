import {
    metaKey,
    modifierKeys,
    alternateNames,
    shiftedKeys,
    dictionary,
} from './keycodes';
import _ from 'lodash';


/**
 * @param k
 */
export function convertKeyToReadable(k) {
    return dictionary[k];
}

/**
 * This will ignore the ordering of the arrays
 * and simply check if they have the same contents
 * @param a1
 * @param a2
 * @return {boolean}
 */
export function compareArrays(a1, a2) {
    return a1.length === a2.length && isArrayInArray(a1, a2);
}

/**
 * @param a1
 * @param a2
 * @return {boolean}
 */
export function compareArraysSorted(a1, a2) {
    return a1.length === a2.length && a1.every((item, i) => item === a2[i]);
}

/**
 * @param array
 * @param value
 * @return {boolean}
 */
export function inArray(array, value) {
    return array.indexOf(value) !== -1;
}

/**
 * Returns true only if all of the contents of
 * a1 are included in a2
 * @param a1
 * @param a2
 * @return {boolean}
 */
export function isArrayInArray(a1, a2) {
    return a1.every(item => inArray(a2, item));
}

/**
 * Return true only if all of the contents of
 * a1 are include in a2 and they appear in the
 * same order in both.
 * @param a1
 * @param a2
 * @return {boolean}
 */
export function isArrayInArraySorted(a1, a2) {
    let prev = 0;
    return a1.every(item => {
        let index = a2.indexOf(item);
        if (index >= prev) {
            prev = index;
            return true;
        }
    });
}

/**
 * @param key
 * @return {*}
 */
export function keyIsValid(key) {
    return _.some(dictionary, validKey => key === validKey)
        || _.some(shiftedKeys, validKey => key === validKey);
}

/**
 * @param debug
 * @param args
 */
export function log(debug, ...args) {
    if (debug) {
        console.log(...args);
    }
}

/**
 * @param combo
 * @param debug
 * @param defaults
 * @return {boolean}
 */
export function validateCombo(combo, { debug, defaults }) {
    let validated = true;

    // Warn for lack of keys
    if (!combo.keys.length) {
        log(debug, `You're trying to bind a combo with no keys:`, combo);
    }

    // Convert "meta" to either "ctrl" or "cmd"
    // Don't explicitly use the command key, it breaks
    // because it is the windows key in Windows, and
    // cannot be hijacked.
    combo.keys.forEach((key, i) => {
        // Check the name and replace if needed
        let altName = alternateNames[key];
        if (altName) {
            key = combo.keys[i] = altName;
        }

        if (key === 'meta') {
            combo.keys.splice(i, 1, metaKey);
        }

        if (key === 'cmd') {
            log(debug, 'Warning: use the "meta" key rather than "cmd" for Windows compatibility');
        }
    });

    // Check that all keys in the combo are valid
    combo.keys.forEach(key => {
        if (!keyIsValid(key)) {
            log(debug, `Do not recognize the key "${key}"`);
            validated = false;
        }
    });

    // We can only allow a single non-modifier key
    // in combos that include the command key (this
    // includes 'meta') because of the keyUp bug.
    if (inArray(combo.keys, 'meta') || inArray(combo.keys, 'cmd')) {
        let nonModifierKeys = combo.keys.slice();
        modifierKeys.forEach((modKey) => {
            let index = nonModifierKeys.indexOf(modKey);
            if (index !== -1) {
                nonModifierKeys.splice(index, 1);
            }
        });

        if (nonModifierKeys.length > 1) {
            log(debug, 'META and CMD key combos cannot have more than 1 non-modifier keys', combo, nonModifierKeys);
            validated = false;
        }
    }

    // Tell the user if they are trying to use any
    // combo properties that don't actually exist,
    // but allow the combo
    _.forEach(combo, (value, property) => {
        if (typeof defaults[property] === 'undefined') {
            log(debug, `The property ${property} is not a valid combo property. Your combo has still been registered.`);
        }
    });

    return validated;
}

/**
 * @param key
 * @param e
 * @return {boolean}
 */
export function convertToShiftedKey(key, e) {
    if (!e.shiftKey) return false;
    let k = shiftedKeys[key];
    if (k != null) return k;
    return false;
}
