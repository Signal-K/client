export const EMPTY_STRING = '';
export function guid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export function randomSeed ( chunks: number = 2 ) {
    return Array(chunks).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36).toUpperCase()).join('');
};

export class StorageAdapter {
    private _storage: Storage;

    constructor(storage: 'localStorage'|'sessionStorage') {
        this._storage = process.browser ? window[storage] : null;
    }

    public get<T>(key: string, defaultValue: T = null): T {
        if (!this._storage) return defaultValue;
        try {
            const item = this._storage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.log(error);
            return defaultValue;
        }
    }

    public set<T>(key: string, value: T): T {
        if(this._storage) this._storage.setItem(key, JSON.stringify(value));
        return value;
    }
}

export const storage = {
    local: new StorageAdapter('localStorage'),
    session: new StorageAdapter('sessionStorage')
};