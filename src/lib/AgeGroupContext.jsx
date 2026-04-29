import React, { createContext, useContext, useState } from 'react';

const AgeGroupContext = createContext();

export function AgeGroupProvider({ children }) {
  const [ageGroup, setAgeGroup] = useState(
    localStorage.getItem('selectedAgeGroup') || 'prasekolah'
  );

  const toggleAgeGroup = (group) => {
    setAgeGroup(group);
    localStorage.setItem('selectedAgeGroup', group);
  };

  return (
    <AgeGroupContext.Provider value={{ ageGroup, toggleAgeGroup }}>
      {children}
    </AgeGroupContext.Provider>
  );
}

export function useAgeGroup() {
  return useContext(AgeGroupContext);
}