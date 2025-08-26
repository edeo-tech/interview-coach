// Simple global direction tracking for onboarding screens
// This tracks the last navigation direction to ensure proper slide animations
export let lastNavigationDirection: 'forward' | 'back' = 'forward';

export const setNavigationDirection = (direction: 'forward' | 'back') => {
  lastNavigationDirection = direction;
};

export const getNavigationDirection = () => lastNavigationDirection;