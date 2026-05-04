import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

const SelectedChildContext = createContext();

export const useSelectedChild = () => {
  const context = useContext(SelectedChildContext);
  if (!context) {
    throw new Error('useSelectedChild must be used within SelectedChildProvider');
  }
  return context;
};

export function SelectedChildProvider({ children }) {
  const authContext = useAuth();
  const user = authContext?.user;
  const [selectedChild, setSelectedChild] = useState(null);
  const [childrenList, setChildrenList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      loadChildren();
    } else {
      setLoading(false);
    }
  }, [user?.email]);

  const loadChildren = async () => {
    try {
      const subscriptions = await base44.entities.UserSubscription.filter({
        email: user.email
      });
      
      if (subscriptions[0]?.children) {
        setChildrenList(subscriptions[0].children);
        // Auto-select first child if exists
        if (subscriptions[0].children.length > 0 && !selectedChild) {
          setSelectedChild(subscriptions[0].children[0]);
        }
      }
    } catch (err) {
      console.error('Error loading children:', err);
      setChildrenList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SelectedChildContext.Provider
      value={{
        selectedChild,
        setSelectedChild,
        childrenList,
        loading
      }}
    >
      {children}
    </SelectedChildContext.Provider>
  );
}