import { CustomerInfo } from "react-native-purchases";

export const isUserEntitled = (
    customerInfo: CustomerInfo | null, 
    entitlement_identifier: string = 'entitlement_identifier_HERE'
) =>
{
    if ( !customerInfo ) return false;
    if ( customerInfo?.entitlements?.active[
        entitlement_identifier
    ] !== undefined )
    {
        return true;
    }
    else
    {
        return false;
    }
}
