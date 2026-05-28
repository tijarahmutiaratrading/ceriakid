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

      const list = subscriptions[0]?.children || [];
      setChildrenList(list);

      // Auto-select first child if none selected, OR re-sync if current selected was removed
      if (list.length > 0) {
        const stillExists = selectedChild && list.find(c => c.id === selectedChild.id);
        if (!stillExists) {
          setSelectedChild(list[0]);
        }
      } else {
        setSelectedChild(null);
      }
    } catch (err) {
      console.error('Error loading children:', err);
      setChildrenList([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshChildren = async () => {
    if (user?.email) await loadChildren();
  };

  return (
    <SelectedChildContext.Provider
      value={{
        selectedChild,
        setSelectedChild,
        childrenList,
        loading,
        refreshChildren
      }}
    >
      {children}
    </SelectedChildContext.Provider>
  );
}