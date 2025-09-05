'use client';

import { Purchases, type CustomerInfo } from '@revenuecat/purchases-js';

let revenueCatInstance: Purchases | null = null;

export const initializeRevenueCat = async (userId?: string) => {
  if (typeof window === 'undefined') return;
  
  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
  
  if (!apiKey) {
    console.error('RevenueCat API key is not defined');
    return;
  }
  
  // If already initialized, don't re-initialize
  if (revenueCatInstance) {
    console.log('RevenueCat already initialized');
    return revenueCatInstance;
  }
  
  try {
    // Initialize RevenueCat - userId is optional for web SDK
    revenueCatInstance = Purchases.configure(apiKey, userId);
    console.log('RevenueCat initialized successfully', userId ? `for user: ${userId}` : 'anonymously');
    return revenueCatInstance;
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    return null;
  }
};

export const getRevenueCat = () => revenueCatInstance;

export const loginRevenueCat = async (userId: string) => {
  if (!revenueCatInstance) {
    console.error('RevenueCat not initialized');
    throw new Error('RevenueCat not initialized');
  }
  
  try {
    const { customerInfo } = await revenueCatInstance.logIn(userId);
    return customerInfo;
  } catch (error) {
    console.error('Failed to log in to RevenueCat:', error);
    throw error;
  }
};

export const logoutRevenueCat = async () => {
  if (!revenueCatInstance) {
    console.error('RevenueCat not initialized');
    return;
  }
  
  try {
    const { customerInfo } = await revenueCatInstance.logOut();
    return customerInfo;
  } catch (error) {
    console.error('Failed to log out from RevenueCat:', error);
    throw error;
  }
};

export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!revenueCatInstance) {
    console.error('RevenueCat not initialized');
    return null;
  }
  
  try {
    const customerInfo = await revenueCatInstance.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
};

export const checkEntitlement = async (entitlementId: string): Promise<boolean> => {
  const customerInfo = await getCustomerInfo();
  if (!customerInfo) return false;
  
  return customerInfo.entitlements.active[entitlementId] !== undefined;
};

export const getOfferings = async () => {
  if (!revenueCatInstance) {
    console.error('RevenueCat not initialized');
    return null;
  }
  
  try {
    const offerings = await revenueCatInstance.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
};

export const purchasePackage = async (packageId: string) => {
  if (!revenueCatInstance) {
    console.error('RevenueCat not initialized');
    return null;
  }
  
  try {
    const { customerInfo } = await revenueCatInstance.purchasePackage({ identifier: packageId });
    return customerInfo;
  } catch (error) {
    console.error('Failed to purchase package:', error);
    throw error;
  }
};