import { useState, useEffect, useCallback } from 'react';

const ACTIVE_TAB_KEY = 'star-sailors-active-tab';
const TAB_ORDER_KEY = 'star-sailors-tab-order';

export interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  condition?: boolean; // Whether tab should be shown
}

export function useTabsPersistence(defaultTab: string = 'updates') {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasSavedOrder, setHasSavedOrder] = useState(false);

  // Initialize from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedTab = localStorage.getItem(ACTIVE_TAB_KEY);
      const savedOrder = localStorage.getItem(TAB_ORDER_KEY);

      if (savedTab) {
        setActiveTab(savedTab);
      }

      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          if (Array.isArray(parsedOrder)) {
            setTabOrder(parsedOrder);
            setHasSavedOrder(parsedOrder.length > 0);
          }
        } catch (e) {
          console.warn('Failed to parse saved tab order:', e);
        }
      }
    } catch (e) {
      console.warn('Failed to load tab preferences:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save active tab to localStorage whenever it changes
  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ACTIVE_TAB_KEY, newTab);
      } catch (e) {
        console.warn('Failed to save active tab:', e);
      }
    }
  }, []);

  // Initialize or update tab order
  const initializeTabOrder = useCallback((tabs: TabConfig[]) => {
    const availableTabIds = tabs
      .filter(tab => tab.condition !== false)
      .map(tab => tab.id);

    setTabOrder(prevOrder => {
      // If no saved order or first initialization, use default order
      if (prevOrder.length === 0) {
        return availableTabIds;
      }

      // Merge saved order with any new tabs
      const orderedTabs = [...prevOrder.filter(id => availableTabIds.includes(id))];
      const newTabs = availableTabIds.filter(id => !orderedTabs.includes(id));
      
      return [...orderedTabs, ...newTabs];
    });
  }, []);

  // Reorder tabs and save to localStorage
  const reorderTabs = useCallback((newOrder: string[]) => {
    setTabOrder(newOrder);
    setHasSavedOrder(true);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(TAB_ORDER_KEY, JSON.stringify(newOrder));
      } catch (e) {
        console.warn('Failed to save tab order:', e);
      }
    }
  }, []);

  // Get ordered tabs based on saved order
  const getOrderedTabs = useCallback((tabs: TabConfig[]) => {
    if (tabOrder.length === 0) {
      return tabs.filter(tab => tab.condition !== false);
    }

    const tabMap = new Map(tabs.map(tab => [tab.id, tab]));
    const orderedTabs: TabConfig[] = [];

    // Add tabs in saved order
    tabOrder.forEach(id => {
      const tab = tabMap.get(id);
      if (tab && tab.condition !== false) {
        orderedTabs.push(tab);
        tabMap.delete(id);
      }
    });

    // Add any remaining tabs (newly added tabs)
    tabMap.forEach(tab => {
      if (tab.condition !== false) {
        orderedTabs.push(tab);
      }
    });

    return orderedTabs;
  }, [tabOrder]);

  // Clear all saved preferences
  const clearPreferences = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(ACTIVE_TAB_KEY);
        localStorage.removeItem(TAB_ORDER_KEY);
        setActiveTab(defaultTab);
        setTabOrder([]);
        setHasSavedOrder(false);
      } catch (e) {
        console.warn('Failed to clear tab preferences:', e);
      }
    }
  }, [defaultTab]);

  return {
    activeTab,
    tabOrder,
    isInitialized,
    hasSavedOrder,
    setActiveTab: handleTabChange,
    initializeTabOrder,
    reorderTabs,
    getOrderedTabs,
    clearPreferences,
  };
}
