import React, { createContext, useContext, useState } from 'react';

const ConsumerStatusContext = createContext(undefined);

export const useConsumerStatus = () => {
  const context = useContext(ConsumerStatusContext);
  if (!context) {
    throw new Error('useConsumerStatus must be used within a ConsumerStatusProvider');
  }
  return context;
};

export const ConsumerStatusProvider = ({ children }) => {
  const [checkedInMusician, setCheckedInMusician] = useState(null);

  const checkIn = (musicianId, musicianName) => {
    setCheckedInMusician({ id: musicianId, name: musicianName });
  };

  const checkOut = () => {
    setCheckedInMusician(null);
  };

  const isCheckedIn = (musicianId) => {
    if (!checkedInMusician) return false;
    if (!musicianId) return true;
    return checkedInMusician.id === musicianId;
  };

  return (
    <ConsumerStatusContext.Provider
      value={{ checkedInMusician, checkIn, checkOut, isCheckedIn }}
    >
      {children}
    </ConsumerStatusContext.Provider>
  );
};

