import { metaKey, modifierEventMapping, shiftedKeys } from './keycodes';
import {
    convertKeyToReadable,
    compareArrays,
    compareArraysSorted,
    inArray,
    isArrayInArray,
    isArrayInArraySorted,
    validateCombo,
    convertToShiftedKey
} from './helpers';
import _ from 'lodash';

class Combo {

    constructor(options) {
        _.extend(this, options);
        this.keys = this.keys || [];
        this.count = this.count || 0;
    }

    get allowsKeyRepeat() {
        return !this.preventRepeat && typeof this.onKeyDown === 'function';
    }

    reset() {
        this.count = 0;
        return this.keyUpFired = null;
    }

}

export default class Listener {

    static debug = false;

    static defaults = {
        isUnordered:        false,
        isCounting:         false,
        isExclusive:        false,
        isSolitary:         false,
        preventDefault:     false,
        preventRepeat:      false,
        normalizeCapsLock:  false,
    };

    constructor(element, defaults) {
        // Public properties
        this.sequenceDelay = 800;

        // Private properties
        this._keysDown = [];
        this._sequence = [];
        this._activeCombos = [];
        this._registeredCombos = [];
        this._preventCapture = false;
        this._sequenceTimer = null;

        this._element = element || document.body;
        this._defaults = _.defaults(defaults, Listener.defaults);

        // Attach handlers to element
        _.bindAll(this, ['_keyDownEvent', '_keyUpEvent', '_blurEvent']);
        this._element.addEventListener('keydown', this._keyDownEvent);
        this._element.addEventListener('keyup', this._keyUpEvent);
        window.addEventListener('blur', this._blurEvent);
    }

    destroy() {
        this._element.removeEventListener('keydown', this._keyDownEvent);
        this._element.removeEventListener('keyup', this._keyUpEvent);
        window.removeEventListener('blur', this._blurEvent);
        return this;
    }

    /*
     Private Methods
     */

    /**
     * @param e
     * @private
     */
    _keyDownEvent(e) {
        this._receiveInput(e, true);
        this._bugCatcher(e);
    }

    /**
     * @param e
     * @private
     */
    _keyUpEvent(e) {
        this._receiveInput(e, false);
    }

    /**
     * Assume all keys are released when we can't catch key events
     * This prevents alt+tab conflicts
     * @param e
     * @private
     */
    _blurEvent(e) {
        this._keysDown.forEach(key => this._keyUp(key, {}));
        this._keysDown = [];
    }

    /*
     Helper Methods
     */

    /**
     * This seems to be Mac specific weirdness, so we'll target "cmd" as metaKey
     * Force a keyUp for non-modifier keys when command is held because they don't fire
     * @param e event
     * @private
     */
    _bugCatcher(e) {
        let key;
        if (metaKey === 'cmd'
            && inArray(this._keysDown, 'cmd')
            && !inArray(['cmd', 'shift', 'alt', 'caps', 'tab'],
                key = convertKeyToReadable((key = e.keyCode) != null ? key : e.key))) {
            this._receiveInput(e, false);
        }
        // Note: we're currently ignoring the fact that this doesn't catch the bug that a keyup
        // will not fire if you keydown a combo, then press and hold cmd, then keyup the combo.
        // Perhaps we should fire keyup on all active combos when we press cmd?
    }

    /**
     * We don't want to allow combos to activate if the cmd key
     * is pressed, but cmd isn't in them. This is so they don't
     * accidentally rapid fire due to our hack-around for the cmd
     * key bug and having to fake keyUps
     * @param comboKeys
     * @return {boolean}
     * @private
     */
    _cmdBugCheck(comboKeys) {
        return !(metaKey === 'cmd' && inArray(this._keysDown, 'cmd') && !inArray(comboKeys, 'cmd'));
    }

    /**
     * If we've pressed a combo, or if we are working towards
     * one, we should prevent the default keydown event.
     * @param e event
     * @param shouldPrevent
     * @private
     */
    _preventDefault(e, shouldPrevent) {
        if (shouldPrevent) {
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
        }
    }

    /*
     Tracking Combos
     */

    /**
     * Based on the keys_down and the key just pressed or released
     * (which should not be in keys_down), we determine if any
     * combo in registered_combos could be considered active.
     * This will return an array of active combos
     * @param key
     * @return {Array}
     * @private
     */
    _getActiveCombos(key) {
        let activeCombos = [];

        // First check that every key in keys_down maps to a combo
        let keysDown = this._keysDown
            .filter(downKey => downKey !== key)
            .concat(key);

        // Get perfect matches
        this._matchComboArrays(keysDown, match => {
            if (this._cmdBugCheck(match.keys)) {
                return activeCombos.push(match);
            }
        });

        // Get fuzzy matches
        this._fuzzyMatchComboArrays(keysDown, match => {
            if (!inArray(activeCombos, match)
                && !(match.isSolitary || !this._cmdBugCheck(match.keys))) {
                activeCombos.push(match);
            }
        });

        return activeCombos;
    }

    /**
     * Check if we are working towards pressing a combo.
     * Used for preventing default on keys that might match
     * to a combo in the future.
     * @param key
     * @return {*}
     * @private
     */
    _getPotentialCombos(key) {
        return this._registeredCombos.filter(combo => (
            !combo.isSequence && inArray(combo.keys, key) && this._cmdBugCheck(combo.keys)
        ));
    }

    /**
     * An active combo is any combo which the user has already entered.
     * We use this to track when a user has released the last key of a
     * combo for onRelease, and to keep combos from 'overlapping'.
     * @param combo
     * @return {*}
     * @private
     */
    _addToActiveCombos(combo) {
        if (inArray(this._activeCombos, combo)) {
            return true;
        }

        let shouldPrepend = true;
        let shouldReplace = false;
        let alreadyReplaced = false;

        // We have to check if we're replacing another active combo
        // So compare the combo.keys to all active combos' keys.
        this._activeCombos.forEach((activeCombo, index) => {
            if (!(activeCombo && activeCombo.isExclusive && combo.isExclusive)) {
                return;
            }

            if (!shouldReplace) {
                activeCombo.keys.forEach(activeKey => {
                    shouldReplace = true;
                    if (!inArray(combo.keys, activeKey)) {
                        shouldReplace = false;
                        return false;
                    }
                });
            }

            if (shouldPrepend && !shouldReplace) {
                combo.keys.forEach(comboKey => {
                    shouldPrepend = false;
                    if (!inArray(combo.keys, comboKey)) {
                        shouldPrepend = true;
                        return false;
                    }
                });
            }

            if (shouldReplace) {
                if (alreadyReplaced) {
                    activeCombo = this._activeCombos.splice(index, 1)[0];
                    if (activeCombo != null) {
                        activeCombo.reset();
                    }
                }
                else {
                    activeCombo = this._activeCombos.splice(index, 1, combo)[0];
                    if (activeCombo != null) {
                        activeCombo.reset();
                    }
                    alreadyReplaced = true;
                }
                shouldPrepend = false;
            }
        });

        if (shouldPrepend) {
            this._activeCombos.unshift(combo);
        }

        return shouldReplace || shouldPrepend;
    }

    _removeFromActiveCombos(combo) {
        this._activeCombos.forEach((activeCombo, index) => {
            if (activeCombo === combo) {
                combo = this._activeCombos.splice(index, 1)[0];
                combo.reset();
                return false;
            }
        });
    }

    /*
     Sequence Methods
     */

    /**
     * Determine what if any sequences we're working towards.
     * We will consider any which any part of the end of the sequence
     * matches and return all of them.
     * @return {Array}
     * @private
     */
    _getPossibleSequences() {
        let matches = [];
        this._registeredCombos.forEach(combo => {
            for (let j = 1; j < this._sequence.length; j++) {
                let sequence = this._sequence.slice(-j);

                if (!combo.isSequence) {
                    continue;
                }

                if (!inArray(combo.keys, 'shift')) {
                    sequence = sequence.filter(key => key !== 'shift');
                    if (!sequence.length) {
                        continue;
                    }
                }

                if (sequence.every((seqKey, i) => combo.keys[i] === seqKey)) {
                    matches.push(combo);
                }
            }
        });
        return matches;
    }

    /**
     * @param key
     * @param e
     * @private
     */
    _addKeyToSequence(key, e) {
        this._sequence.push(key);

        // Now check if they're working towards a sequence
        const sequenceCombos = this._getPossibleSequences();

        if (sequenceCombos.length) {
            sequenceCombos.forEach(combo => this._preventDefault(e, combo.preventDefault));
            if (this._sequenceTimer) {
                clearTimeout(this._sequenceTimer);
            }
            if (this.sequenceDelay > -1) {
                this._sequenceTimer = setTimeout(() => this._sequence = [], this.sequenceDelay);
            }
        }
        else {
            this._sequence = [];
        }
    }

    /**
     * Compare _sequence to all combos
     * @param key
     * @return {*}
     * @private
     */
    _getSequence(key) {
        let match = false;

        // Compare _sequence to all combos
        this._registeredCombos.forEach(combo => {
            if (!combo.isSequence) {
                return;
            }

            for (let j = 1; j < this._sequence.length; j++) {
                // As we are traversing backwards through the sequence keys,
                // Take out any shift keys, unless shift is in the combo.
                let sequence = this._sequence
                    .filter(seqKey => inArray(combo.keys, 'shift') || seqKey !== 'shift')
                    .slice(-j);

                if (combo.keys.length !== sequence.length) {
                    return;
                }

                sequence.forEach((seqKey, i) => {
                    // Special case for shift. Ignore shift keys, unless the sequence explicitly uses them
                    // Don't select this combo if we're pressing shift and shift isn't in it
                    if ((seqKey === 'shift' || key === 'shift') && !inArray(combo.keys, 'shift')) {
                        return;
                    }

                    if (combo.keys[i] === seqKey) {
                        match = true;
                    }
                    else {
                        match = false;
                        return false;
                    }

                });
            }

            if (match) {
                if (combo.isExclusive) {
                    this._sequence = [];
                }
                match = combo;
                return false;
            }
        });

        return match;
    }

    /*
     Catching Combos
     */

    /**
     * @param e
     * @param isKeyDown
     * @return {*}
     * @private
     */
    _receiveInput(e, isKeyDown) {
        // If we're not capturing input, we should
        // clear out _keys_down for good measure
        if (this._preventCapture) {
            if (this._keysDown.length)
                this._keysDown = [];
            return;
        }

        let key = convertKeyToReadable(e.keyCode != null ? e.keyCode : e.key);
        if ((!isKeyDown && !this._keysDown.length && (key === 'alt' || key === metaKey)) || !key) {
            return;
        }

        isKeyDown ? this._keyDown(key, e) : this._keyUp(key, e);
    }

    /**
     * Only fire this event if the function is defined
     * @param event
     * @param combo
     * @param keyEvent
     * @param isAutoRepeat
     * @return {boolean}
     * @private
     */
    _fire(event, combo, keyEvent, isAutoRepeat) {
        if (typeof combo['on' + event] === 'function') {
            this._preventDefault(keyEvent, combo['on' + event].call(
                    combo['this'], keyEvent, combo.count, isAutoRepeat) !== true);
        }
        // We need to mark that keyup has already happened
        if (event === 'release') {
            combo.count = 0;
        }
        if (event === 'keyup') {
            combo.keyUpFired = true;
        }
    }

    /**
     * This will return all combos that match
     * @param potentialMatch
     * @param matchHandler
     * @private
     */
    _matchComboArrays(potentialMatch, matchHandler) {
        this._registeredCombos.forEach(sourceCombo => {
            let comboPotentialMatch = potentialMatch.slice(0);
            if (sourceCombo.normalizeCapsLock && inArray(comboPotentialMatch, 'caps')) {
                comboPotentialMatch.splice(comboPotentialMatch.indexOf('caps'), 1);
            }
            if ((!sourceCombo.isUnordered && compareArraysSorted(potentialMatch, sourceCombo.keys))
                || (sourceCombo.isUnordered && compareArrays(potentialMatch, sourceCombo.keys))) {
                matchHandler(sourceCombo);
            }
        });
    }

    /**
     * This will return combos that match even if other keys are pressed
     * @param potentialMatch
     * @param matchHandler
     * @private
     */
    _fuzzyMatchComboArrays(potentialMatch, matchHandler) {
        this._registeredCombos.forEach(sourceCombo => {
            if ((!sourceCombo.isUnordered && isArrayInArraySorted(sourceCombo.keys, potentialMatch))
                || (sourceCombo.isUnordered && isArrayInArray(sourceCombo.keys, potentialMatch))) {
                matchHandler(sourceCombo);
            }
        });
    }

    /**
     * @param combo
     * @private
     */
    _keysRemain(combo) {
        return combo.keys.some(key => inArray(this._keysDown, key));
    }

    /**
     * @param key
     * @param e
     * @private
     */
    _keyDown(key, e) {
        // Check if we're holding shift
        let shiftedKey = convertToShiftedKey(key, e);
        if (shiftedKey) {
            key = shiftedKey;
        }

        // Add the key to sequences
        this._addKeyToSequence(key, e);
        let sequenceCombo = this._getSequence(key);
        if (sequenceCombo) {
            this._fire('KeyDown', sequenceCombo, e);
        }

        // We might have modifier keys down when coming back to
        // this window and they might not be in _keys_down, so
        // we're doing a check to make sure we put it back in.
        // This only works for explicit modifier keys.
        _.each(modifierEventMapping, (eventMod, mod) => {
            if (e[eventMod] && mod !== key && inArray(this._keysDown, mod)) {
                this._keysDown.push(mod);
            }
        });

        // Alternatively, we might not have modifier keys down
        // that we think are, so we should catch those too
        _.each(modifierEventMapping, (eventMod, mod) => {
            if (mod !== key && inArray(this._keysDown, mod) && !e[eventMod]
                // The Windows key will think it is the cmd key, but won't trigger the event mod
                && !(mod === 'cmd' && metaKey !== 'cmd')) {
                this._keysDown = this._keysDown.filter(keyDown => keyDown !== mod);
            }
        });


        // Find which combos we have pressed or might be working towards, and prevent default
        const combos = this._getActiveCombos(key);
        const potentialCombos = this._getPotentialCombos(key);

        combos.forEach(combo => this._handleComboDown(combo, potentialCombos, key, e));
        potentialCombos.forEach(potential => this._preventDefault(e, potential.preventDefault));

        if (!inArray(this._keysDown, key)) {
            this._keysDown.push(key);
        }
    }

    /**
     * @param combo
     * @param potentialCombos
     * @param key
     * @param e
     * @return {boolean}
     * @private
     */
    _handleComboDown(combo, potentialCombos, key, e) {
        // Make sure we're not trying to fire for a combo that already fired
        if (!inArray(combo.keys, key)) {
            return false;
        }

        this._preventDefault(e, combo && combo.preventDefault);

        let isAutoRepeat = false;
        // If we've already pressed this key, check that we want to fire
        // again, otherwise just add it to the keys_down list.
        if (inArray(this._keysDown, key)) {
            isAutoRepeat = true;
            if (!combo.allowsKeyRepeat) {
                return false;
            }
        }

        // Now we add this combo or replace it in _active_combos
        let result = this._addToActiveCombos(combo, key);

        // We reset the keyup_fired property because you should be
        // able to fire that again, if you've pressed the key down again
        combo.keyUpFired = false;

        // Now we fire the keydown event unless there is a larger exclusive potential combo
        let isOtherExclusive = false;
        if (combo.isExclusive) {
            isOtherExclusive = potentialCombos
                .some(potentialCombo => potentialCombo.isExclusive && potentialCombo.keys.length > combo.keys.length);
        }

        if (!isOtherExclusive) {
            if (combo.isCounting && typeof combo.onKeyDown === 'function') {
                combo.count += 1;
            }
            if (result) {
                return this._fire('KeyDown', combo, e, isAutoRepeat);
            }
        }
    }

    _keyUp(key, e) {
        // Check if we're holding shift
        const unshiftedKey = key;
        let shiftedKey = convertToShiftedKey(key, e);
        if (shiftedKey) {
            key = shiftedKey;
        }
        shiftedKey = shiftedKeys[unshiftedKey];

        // We have to make sure the key matches to what we had in _keysDown
        if (e.shiftKey) {
            if (!(shiftedKey && inArray(this._keysDown, shiftedKey))) {
                key = unshiftedKey;
            }
        }
        else if (!(unshiftedKey && inArray(this._keysDown, unshiftedKey))) {
            key = shiftedKey;
        }

        // Check if we have a keyup firing
        const sequenceCombo = this._getSequence(key);
        if (sequenceCombo) {
            this._fire('KeyUp', sequenceCombo, e);
        }

        // Remove from the list
        if (!inArray(this._keysDown, key)) {
            return false;
        }
        this._keysDown = this._keysDown
            .filter(keyDown => !inArray([key, shiftedKeys, unshiftedKey], keyDown));

        // Store this for later cleanup
        const activeCombosLength = this._activeCombos.length;

        // When releasing we should only check if we
        // match from _active_combos so that we don't
        // accidentally fire for a combo that was a
        // smaller part of the one we actually wanted.
        const combos = this._activeCombos.filter(activeCombo => inArray(activeCombo.keys, key));
        combos.forEach(combo => this._handleComboUp(combo, e, key));

        // We also need to check other combos that might still be in active_combos
        // and needs to be removed from it.
        if (activeCombosLength > 1) {
            this._activeCombos.forEach(activeCombo => {
                if (activeCombo && !inArray(combos, activeCombo) && !this._keysRemain(activeCombo)) {
                    this._removeFromActiveCombos(activeCombo);
                }
            });
        }
    }

    /**
     * @param combo
     * @param e
     * @param key
     * @private
     */
    _handleComboUp(combo, e, key) {
        this._preventDefault(e, combo && combo.preventDefault);

        // Check if any keys from this combo are still being held.
        const keysRemaining = this._keysRemain(combo);

        // Any unactivated combos will fire
        if (!combo.keyUpFired) {
            // And we should not fire it if it is a solitary combo and something else is pressed
            const keysDown = this._keysDown.slice().concat(key);
            if (!combo.isSolitary || compareArrays(keysDown, combo.keys)) {
                this._fire('KeyUp', combo, e);
                // Dont' add to the count unless we only have a keyup callback
                if (combo.isCounting && typeof combo.onKeyUp === 'function' && typeof combo.onKeyDown !== 'function') {
                    combo.count += 1;
                }
            }
        }

        // If this was the last key released of the combo, clean up.
        if (!keysRemaining) {
            this._fire('Release', combo, e);
            this._removeFromActiveCombos(combo);
        }
    }

    /*
     Public Registration Methods
     */

    /**
     * Shortcut for simple combos
     * @param keys
     * @param callback
     * @return {*}
     */
    simpleCombo(keys, callback) {
        return this.registerCombo({
            keys:       keys,
            onKeyDown:  callback,
        });
    }

    /**
     * Shortcut for counting combos
     * @param keys
     * @param callback
     * @return {*}
     */
    countingCombo(keys, callback) {
        return this.registerCombo({
            keys:           keys,
            onKeyDown:      callback,
            isCounting:     true,
            isUnordered:    false
        });
    }

    /**
     * @param keys
     * @param callback
     */
    sequenceCombo(keys, callback) {
        return this.register_combo({
            keys:           keys,
            onKeyDown:      callback,
            isSequence:     true,
            isExclusive:    true
        });
    }

    /**
     * @param comboDictionary
     * @return {Combo}
     */
    registerCombo(comboDictionary) {
        // Allow a space delineated string instead of array
        if (typeof comboDictionary['keys'] === 'string') {
            comboDictionary['keys'] = comboDictionary['keys'].split(' ');
        }

        comboDictionary = _.defaults(comboDictionary, this._defaults);
        const combo = new Combo(comboDictionary);

        if (validateCombo(combo, Listener)) {
            this._registeredCombos.push(combo);
            return combo;
        }
    }

    /**
     * Will return an array of the combos actually registered
     * @param comboArray
     * @return {Array}
     */
    registerMany(comboArray) {
        return comboArray.map(this.registerCombo, this);
    }

    /**
     * @param keysOrCombo
     * @return {boolean}
     */
    unregisterCombo(keysOrCombo) {
        if (!keysOrCombo) {
            return false;
        }

        const unregisterCombo = combo => {
            this._registeredCombos.forEach((registeredCombo, i) => {
                if (combo === registeredCombo) {
                    this._registeredCombos.splice(i, 1);
                    return false;
                }
            });
        };

        if (keysOrCombo instanceof Combo) {
            return unregisterCombo(keysOrCombo);
        }

        if (typeof keysOrCombo === 'string') {
            keysOrCombo = keysOrCombo.split(' ');
        }

        this._registeredCombos.forEach(combo => {
            if (combo
                && ((combo.isUnordered && compareArrays(keysOrCombo, combo.keys))
                || (!combo.isUnordered && compareArraysSorted(keysOrCombo, combo.keys)))) {
                unregisterCombo(combo);
            }
        });
    }

    /**
     * @param comboArray
     * @return {Array}
     */
    unregisterMany(comboArray) {
        return comboArray.map(this.unregisterCombo, this);
    }

    /*
     Other public methods
     */

    pause() {
        this._preventCapture = true;
        return this;
    }

    resume() {
        this._preventCapture = false;
        return this;
    }

    reset() {
        this._registeredCombos = [];
        return this;
    }

    /**
     * Helpful for debugging purposes
     */
    get metaKey() {
        return metaKey;
    }

}
