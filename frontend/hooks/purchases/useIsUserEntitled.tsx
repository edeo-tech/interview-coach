import { isUserEntitled } from "@/utils/purchases/entitlement";
// import { useCustomerInfo } from "@/context/CustomerInfo";

export const useIsUserEntitled = () =>
{
    // const { customerInfo } = useCustomerInfo();
    const customerInfo = null;

    return isUserEntitled(customerInfo);
}
