import { isUserEntitled } from "@/utils/purchases/entitlement";
import { useCustomerInfo } from "@/context/purchases/CustomerInfo";

export const useIsUserEntitled = () =>
{
    const { customerInfo } = useCustomerInfo();

    return isUserEntitled(customerInfo);
}
