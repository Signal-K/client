"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

// Define the type for a user anomaly
interface UserAnomaly {
  id: number;
  anomaly_id: number;
  ownership_date: string;
}

// Define the type for the context value
interface UserAnomaliesContextValue {
  userAnomalies: UserAnomaly[];
  fetchUserAnomalies: () => void;
}

// Create the context
const UserAnomaliesContext = createContext<UserAnomaliesContextValue>({
  userAnomalies: [],
  fetchUserAnomalies: () => {}, // Provide a default empty function
});

// Create a provider component
export const UserAnomaliesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [userAnomalies, setUserAnomalies] = useState<UserAnomaly[]>([]);

  useEffect(() => {
    fetchUserAnomalies();
  }, [session]);

  const fetchUserAnomalies = async () => {
    if (!session) return;

    try {
      // Fetch user anomalies
      const { data, error } = await supabase
        .from('user_anomalies')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;

      setUserAnomalies(data);
    } catch (error: any) {
      console.error("Error fetching user anomalies: ", error.message);
    }
  };

  return (
    <UserAnomaliesContext.Provider value={{ userAnomalies, fetchUserAnomalies }}>
      {children}
    </UserAnomaliesContext.Provider>
  );
};

// Create a custom hook to consume the context
export const useUserAnomalies = () => useContext(UserAnomaliesContext);