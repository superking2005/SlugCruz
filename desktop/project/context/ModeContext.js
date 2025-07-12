import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ModeContext = createContext();

// Provider wrapped around the whole app
export const ModeProvider = ({ children }) => {
  const [isDriver, setIsDriver] = useState(false);

  // Hydrate from storage on first mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('userMode');
        if (saved !== null) setIsDriver(saved === 'driver');
      } catch (e) {
        console.error('Failed to load mode', e);
      }
    })();
  }, []);

  // Toggle + save state
  const toggleMode = async () => {
    const next = !isDriver;
    setIsDriver(next);
    try {
      await AsyncStorage.setItem('userMode', next ? 'driver' : 'rider');
    } catch (e) {
      console.error('Failed to save mode', e);
    }
  };

  return (
    <ModeContext.Provider value={{ isDriver, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

// helper hook for any child screen
export const useMode = () => useContext(ModeContext);
