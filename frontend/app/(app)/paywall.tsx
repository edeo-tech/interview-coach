import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { useToast } from '../../components/Toast';
import { useCustomerInfo } from '../../context/purchases/CustomerInfo';

type PaywallSource = 'retry' | 'feedback' | 'settings' | string;

interface OfferingCardProps {
  pkg: PurchasesPackage;
  isSelected: boolean;
  onSelect: () => void;
  savingsPercentage?: number;
  isPopular?: boolean;
}

const Paywall = () => {
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  const { showToast } = useToast();
  const { setCustomerInfo } = useCustomerInfo();
  const params = useLocalSearchParams();
  const source = (params.source as PaywallSource) || 'settings';

  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('paywall', { source });
    }, [posthogScreen, source])
  );

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    if (Platform.OS === 'web') return;
    
    try {
      setIsLoadingOfferings(true);
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        setOfferings(offerings.current);
        
        // Default select weekly package
        const weeklyPackage = offerings.current.availablePackages.find(
          pkg => pkg.packageType === 'WEEKLY' || pkg.identifier.toLowerCase().includes('weekly')
        );
        if (weeklyPackage) {
          setSelectedPackage(weeklyPackage);
        } else {
          setSelectedPackage(offerings.current.availablePackages[0]);
        }
      } else {
        console.log('No offerings available');
        showToast('No subscription options available', 'error');
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
      showToast('Failed to load subscription options', 'error');
    } finally {
      setIsLoadingOfferings(false);
    }
  };

  const calculateSavingsPercentage = (weeklyPackage: PurchasesPackage, monthlyPackage: PurchasesPackage): number => {
    const weeklyPrice = weeklyPackage.product.price;
    const monthlyPrice = monthlyPackage.product.price;
    
    // Calculate 4 weeks worth of weekly payments
    const fourWeeksPrice = weeklyPrice * 4;
    
    if (fourWeeksPrice === 0) return 0;
    
    // Calculate savings percentage
    const savings = ((fourWeeksPrice - monthlyPrice) / fourWeeksPrice) * 100;
    return Math.round(savings);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      showToast('Please select a subscription plan', 'error');
      return;
    }

    try {
      setIsPurchasing(true);
      posthogCapture('paywall_purchase_started', {
        package: selectedPackage.identifier,
        source
      });

      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      
      if (customerInfo.entitlements.active['premium']) {
        setCustomerInfo(customerInfo);
        posthogCapture('paywall_purchase_success', {
          package: selectedPackage.identifier,
          source
        });
        showToast('Welcome to Premium! 🎉', 'success');
        router.back();
      } else {
        throw new Error('Purchase completed but premium not activated');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      if (!error.userCancelled) {
        posthogCapture('paywall_purchase_error', {
          error: error.message,
          code: error.code,
          source
        });
        
        // Handle specific error cases
        if (error.code === 'PURCHASE_INVALID_ERROR') {
          showToast('Invalid purchase. Please try again.', 'error');
        } else if (error.code === 'NETWORK_ERROR') {
          showToast('Network error. Please check your connection.', 'error');
        } else {
          showToast('Purchase failed. Please try again.', 'error');
        }
      } else {
        posthogCapture('paywall_purchase_cancelled', { source });
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      posthogCapture('paywall_restore_started', { source });

      const customerInfo = await Purchases.restorePurchases();
      
      if (customerInfo.entitlements.active['premium']) {
        setCustomerInfo(customerInfo);
        posthogCapture('paywall_restore_success', { source });
        showToast('Premium access restored!', 'success');
        router.back();
      } else {
        posthogCapture('paywall_restore_no_purchases', { source });
        Alert.alert(
          'No Purchases Found',
          'No previous purchases were found for this account.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      posthogCapture('paywall_restore_error', {
        error: error.message,
        source
      });
      showToast('Failed to restore purchases', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  // Determine benefit order based on source
  const getBenefits = () => {
    const benefits = [
      {
        id: 'unlimited',
        icon: 'refresh',
        text: 'Unlimited interview attempts',
        highlight: source === 'retry'
      },
      {
        id: 'feedback',
        icon: 'analytics',
        text: 'Detailed feedback on all attempts',
        highlight: source === 'feedback'
      }
    ];

    // Reorder based on source
    if (source === 'feedback') {
      return benefits.reverse();
    }
    
    return benefits;
  };

  const OfferingCard: React.FC<OfferingCardProps> = ({ 
    pkg, 
    isSelected, 
    onSelect, 
    savingsPercentage,
    isPopular 
  }) => (
    <TouchableOpacity
      style={[
        styles.offeringCard,
        isSelected && styles.offeringCardSelected
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.offeringCardContent}>
        <View style={styles.offeringHeader}>
          <Text style={[
            styles.offeringTitle,
            isSelected && styles.offeringTitleSelected
          ]}>
            {pkg.product.title}
          </Text>
          {isPopular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Most Popular</Text>
            </View>
          )}
          {savingsPercentage && savingsPercentage > 0 && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Save {savingsPercentage}%</Text>
            </View>
          )}
        </View>
        <Text style={[
          styles.offeringPrice,
          isSelected && styles.offeringPriceSelected
        ]}>
          {pkg.product.priceString}
        </Text>
        <Text style={[
          styles.offeringDescription,
          isSelected && styles.offeringDescriptionSelected
        ]}>
          {pkg.product.description || `Billed ${pkg.packageType.toLowerCase()}`}
        </Text>
      </View>
      <View style={[
        styles.radioOuter,
        isSelected && styles.radioOuterSelected
      ]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  if (isLoadingOfferings) {
    return (
      <ChatGPTBackground style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={styles.loadingText}>Loading subscription options...</Text>
          </View>
        </SafeAreaView>
      </ChatGPTBackground>
    );
  }

  const benefits = getBenefits();
  const weeklyPackage = offerings?.availablePackages.find(
    pkg => pkg.packageType === 'WEEKLY' || pkg.identifier.toLowerCase().includes('weekly')
  );
  const monthlyPackage = offerings?.availablePackages.find(
    pkg => pkg.packageType === 'MONTHLY' || pkg.identifier.toLowerCase().includes('monthly')
  );
  
  const savingsPercentage = weeklyPackage && monthlyPackage 
    ? calculateSavingsPercentage(weeklyPackage, monthlyPackage)
    : 0;

  return (
    <ChatGPTBackground style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            {benefits.map((benefit, index) => (
              <View key={benefit.id} style={styles.benefitRow}>
                <Ionicons 
                  name={benefit.icon as any} 
                  size={24} 
                  color={benefit.highlight || index === 0 ? '#F59E0B' : '#ffffff'} 
                />
                <Text style={[
                  styles.benefitText,
                  (benefit.highlight || index === 0) && styles.benefitTextHighlight
                ]}>
                  {benefit.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Offerings */}
          {offerings && (
            <View style={styles.offeringsContainer}>
              {monthlyPackage && (
                <OfferingCard
                  pkg={monthlyPackage}
                  isSelected={selectedPackage?.identifier === monthlyPackage.identifier}
                  onSelect={() => setSelectedPackage(monthlyPackage)}
                  savingsPercentage={savingsPercentage}
                />
              )}
              {weeklyPackage && (
                <OfferingCard
                  pkg={weeklyPackage}
                  isSelected={selectedPackage?.identifier === weeklyPackage.identifier}
                  onSelect={() => setSelectedPackage(weeklyPackage)}
                  isPopular
                />
              )}
            </View>
          )}
        </ScrollView>

        {/* Bottom buttons */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (isPurchasing || !selectedPackage) && styles.continueButtonDisabled
            ]}
            onPress={handlePurchase}
            disabled={isPurchasing || !selectedPackage}
          >
            {isPurchasing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isRestoring || isPurchasing}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.restoreButtonText}>Restore Purchases</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
  },
  benefitsContainer: {
    marginBottom: 40,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  benefitText: {
    color: '#ffffff',
    fontSize: 18,
    marginLeft: 16,
    flex: 1,
  },
  benefitTextHighlight: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  offeringsContainer: {
    marginBottom: 20,
  },
  offeringCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  offeringCardSelected: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  offeringCardContent: {
    flex: 1,
  },
  offeringHeader: {
    marginBottom: 8,
  },
  offeringTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  offeringTitleSelected: {
    color: '#F59E0B',
  },
  offeringPrice: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  offeringPriceSelected: {
    color: '#F59E0B',
  },
  offeringDescription: {
    color: '#9ca3af',
    fontSize: 14,
  },
  offeringDescriptionSelected: {
    color: '#fbbf24',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  savingsBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6b7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#F59E0B',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  continueButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  restoreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Paywall;