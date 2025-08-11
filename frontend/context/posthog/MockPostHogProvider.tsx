import React, { createContext, useContext } from 'react';

// Mock PostHog context when PostHogProvider is not available
const MockPostHogContext = createContext({
  capture: (eventName: string, properties?: any) => {
    console.log('PostHog event (mock):', eventName, properties);
  },
  identify: (userId: string, properties?: any) => {
    console.log('PostHog identify (mock):', userId, properties);
  },
});

export const MockPostHogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MockPostHogContext.Provider value={{
      capture: (eventName: string, properties?: any) => {
        console.log('PostHog event (mock):', eventName, properties);
      },
      identify: (userId: string, properties?: any) => {
        console.log('PostHog identify (mock):', userId, properties);
      },
    }}>
      {children}
    </MockPostHogContext.Provider>
  );
};

export const useMockPostHog = () => useContext(MockPostHogContext);