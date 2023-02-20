import { useState, Dispatch, SetStateAction } from 'react';

import { useStatePersisted } from './use-state-persisted';

export interface StateArray<T> {
    current: T[];
    set(value: T[]): void;
    /**
     * Adds an item to the end of the array.
     * @param item The item to add.
     */
    push(item: T): void;
    /**
     * Adds an item to the start of the array.
     * @param item The item to add.
     */
    unshift(item: T): void;
    removeAt(index: number): void;
    removeWhere(predicate: (value: T, index: number, array: T[]) => value is T): void;
    clear(): void;
    update(index: number, fields: Partial<T>): void
}

/**
 * Creates a state and setter function that persists the array to localStorage.
 * @param key The key to use for localStorage.
 * @param initialValue The initial array value to use.
 * @param map An optional custom map function to modify.
 */
export function useStateArrayPersisted<T>(key: string, initialValue: T[] = [], map?: (newState: T[]) => T[]): StateArray<T> {
    const [current, set] = useStatePersisted(key, initialValue);

    return _useStateArrayLogic(current, set, map);
}

/**
 * Creates a state and setter function for the array.
 * @param initialValue The initial value to use.
 * @param map An optional custom map function to modify.
 */
export function useStateArray<T>(initialValue: T[] = [], map?: (newState: T[]) => T[]): StateArray<T> {
    const [current, set] = useState(initialValue);

    return _useStateArrayLogic(current, set, map);
}

function _useStateArrayLogic<T>(current: T[], setArr: Dispatch<SetStateAction<T[]>>, map?: any): StateArray<T> {
    return {
        current,
        set(value: T[]) {
            mappedSet(value);
        },
        push(item: T) {
            mappedSet([...current, item]);
        },
        unshift(item: T) {
            mappedSet([item, ...current]);
        },
        removeAt(index: number) {
            mappedSet([...current.slice(0, index), ...current.slice(index + 1)]);
        },
        removeWhere(predicate: (value: T, index: number, array: T[]) => value is T) {
            mappedSet(current.filter(predicate));
        },
        clear() {
            mappedSet([])
        },
        update(index: number, fields: Partial<T>) {
            mappedSet([...current.slice(0, index), { ...current[index], ...fields }, ...current.slice(index + 1)]);
        }
    };

    function mappedSet(arr: T[]) {
        if (map) arr = map(arr);
        setArr(arr);
    }
}