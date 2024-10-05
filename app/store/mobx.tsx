'use client';

import { useEffect, createContext, ReactNode, FC } from 'react';
import ZoodexStore from './zoodex';
import { observer } from 'mobx-react';
import { useContext as useReactContext } from 'react';

declare global {
    interface Window {
        store?: ZoodexStore;
    }
}

let store: ZoodexStore | undefined;

function initializeStore(): ZoodexStore {
    const _store = store ?? new ZoodexStore();

    if (typeof window === "undefined") return _store;

    if (!store) store = _store;

    if (!window.store) {
        window.store = store;
    }

    return _store;
}

const StoreContext = createContext<ZoodexStore | undefined>(undefined);

interface MobxProviderProps {
    children: ReactNode;
};

const MobxProvider: FC<MobxProviderProps> = ({ children }) => {
    const store = initializeStore();

    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    );
};

export { observer, useReactContext, MobxProvider, StoreContext };
export default MobxProvider;