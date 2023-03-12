import { useState } from 'react';

import { storage } from '../Services/helpers';

/**
 * Creates a state and setter function that persists to localStorage.
 * @param key The key to use for localStorage.
 * @param initialValue The initial value to use.
 */
export function useStatePersisted<T>(key: string, initialValue: T): [T, (value: T) => void] {
    if (!process.browser) {
        return [initialValue as T, () => { }];
    }

    const [state, setState] = useState<T>(getCached<T>(key, initialValue));

    return [state, setLocalStorageState];

    function setLocalStorageState(value: T | ((value: T) => T)) {
        if (value instanceof Function) {
            setState(prev => {
                const newState = value(prev);
                return storage.local.set(key, newState);
            });
        } else {
            storage.local.set(key, value);
            setState(value);
        }
    }
}

function getCached<T>(key: string, initialValue: T) {
    const cached = storage.local.get<T>(key);
    if(cached === null && initialValue !== null) {
        storage.local.set(key, initialValue);
    }
    return cached !== null ? cached : initialValue;
  }