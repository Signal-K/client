import React, { createContext, useContext, useState, ReactNode } from 'react';

type RefreshContextType = {
  refresh: boolean;
  triggerRefresh: () => void;
};

const RefreshContext = createContext<RefreshContextType>({ refresh: false, triggerRefresh: () => {} });

type RefreshProviderProps = {
  children: ReactNode;
};

export const RefreshProvider: React.FC<RefreshProviderProps> = ({ children }) => {
  const [refresh, setRefresh] = useState(false);

  const triggerRefresh = () => {
    setRefresh(prev => !prev);
  };

  return (
    <RefreshContext.Provider value={{ refresh, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext);
