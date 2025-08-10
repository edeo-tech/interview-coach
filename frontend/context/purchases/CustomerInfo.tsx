import { createContext, useState, useEffect, useContext } from "react";
import { Platform } from "react-native";
import Purchases, { CustomerInfo } from 'react-native-purchases';

const debugMode = process.env.EXPO_PUBLIC_DEBUG;

type CustomerInfoContextType = {
    customerInfo: CustomerInfo | null;
    setCustomerInfo: (customerInfo: CustomerInfo | null) => void;
    error: boolean;
    setError: (error: boolean) => void;
    refresh: boolean;
    setRefresh: (refresh: boolean) => void;
}

const CustomerInfoContext = createContext<CustomerInfoContextType | undefined>(undefined);

export const CustomerInfoProvider = ({ children }: { children: React.ReactNode }) =>
{
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [refresh, setRefresh] = useState(true);
    const [error, setError] = useState(false);
    
    const checkForCustomerInfo = async () =>
    {
        if(Platform.OS === 'web') return;
        
        try
        {
            const customerInfo = await Purchases.getCustomerInfo();
            if(customerInfo) setCustomerInfo(customerInfo);
        }
        catch(error)
        {
            if(debugMode) console.log(error);
            setError(true);
        }
        setRefresh(false);
    }

    useEffect(() =>
    {
        checkForCustomerInfo();
    }, [refresh]);

    return (
        <CustomerInfoContext.Provider
            value={{
                customerInfo,
                setCustomerInfo,
                error,
                setError,
                refresh,
                setRefresh
            }}>
            {children}
        </CustomerInfoContext.Provider>
    )
}

export const useCustomerInfo = () =>
{
    const context = useContext(CustomerInfoContext);
    if (!context) {
        throw new Error(
            'useCustomerInfo must be used within an CustomerInfoProvider'
        );
    }
    return context;
}
