'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface AdStatusContextType {
  adsLoaded: boolean;
  adsCount: number;
  setAdsLoaded: (loaded: boolean) => void;
  incrementAdsCount: () => void;
  resetAdsCount: () => void;
}

const AdStatusContext = createContext<AdStatusContextType | undefined>(undefined);

export function AdStatusProvider({ children }: { children: React.ReactNode }) {
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [adsCount, setAdsCount] = useState(0);

  const incrementAdsCount = useCallback(() => {
    setAdsCount(prev => {
      const newCount = prev + 1;
      if (newCount > 0) {
        setAdsLoaded(true);
      }
      return newCount;
    });
  }, []);

  const resetAdsCount = useCallback(() => {
    setAdsCount(0);
    setAdsLoaded(false);
  }, []);

  return (
    <AdStatusContext.Provider 
      value={{ 
        adsLoaded, 
        adsCount, 
        setAdsLoaded, 
        incrementAdsCount, 
        resetAdsCount 
      }}
    >
      {children}
    </AdStatusContext.Provider>
  );
}

export function useAdStatus() {
  const context = useContext(AdStatusContext);
  if (context === undefined) {
    throw new Error('useAdStatus must be used within an AdStatusProvider');
  }
  return context;
}

