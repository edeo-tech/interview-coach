import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle } from 'expo-haptics';
import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { useToast } from '../../components/Toast';
import { useCustomerInfo } from '../../context/purchases/CustomerInfo';
import { GlassStyles, GlassTextColors } from '../../constants/GlassStyles';

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
  const { impactAsync, notificationAsync } = useHapticsSafely();
  const { showToast } = useToast();
  const { setCustomerInfo } = useCustomerInfo();
  const params = useLocalSearchParams();
  const source = (params.source as PaywallSource) || 'settings';

  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPopularModalVisible, setIsPopularModalVisible] = useState(false);

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
        if (source === 'onboarding') {
          router.replace('/(app)/(tabs)/home');
        } else {
          router.back();
        }
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
        if (source === 'onboarding') {
          router.replace('/(app)/(tabs)/home');
        } else {
          router.back();
        }
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
      onPress={() => {
        // Medium impact for subscription plan selection - important choice
        useHapticsSafely().impactAsync(ImpactFeedbackStyle.Medium);
        onSelect();
      }}
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
              <TouchableOpacity
                style={styles.infoIcon}
                onPress={(e) => {
                  e.stopPropagation();
                  // Light impact for info button - minor action
                  impactAsync(ImpactFeedbackStyle.Light);
                  setIsPopularModalVisible(true);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="information-circle" size={16} color="#ffffff" />
              </TouchableOpacity>
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
        {/* <Text style={[
          styles.offeringDescription,
          isSelected && styles.offeringDescriptionSelected
        ]}>
          {pkg.product.description || `Billed ${pkg.packageType.toLowerCase()}`}
        </Text> */}
      </View>
    </TouchableOpacity>
  );

  // Popular Info Modal Component
  const PopularInfoModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isPopularModalVisible}
      onRequestClose={() => setIsPopularModalVisible(false)}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={() => setIsPopularModalVisible(false)}
      >
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                // Light impact for modal close - minor action
                impactAsync(ImpactFeedbackStyle.Light);
                setIsPopularModalVisible(false);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalMessage}>
            73.2% of users secure the role in under 2 weeks
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );

  if (isLoadingOfferings) {
    return (
      <ChatGPTBackground style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A855F7" />
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
            onPress={() => {
              // Light impact for navigation back - minor action
              impactAsync(ImpactFeedbackStyle.Light);
              if (source === 'onboarding') {
                router.replace('/(app)/(tabs)/home');
              } else {
                router.back();
              }
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>

          {/* Main title */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Unlock Premium Access</Text>
            <Text style={styles.subtitle}>Choose your plan and start practicing</Text>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            {benefits.map((benefit, index) => (
              <View key={benefit.id} style={styles.benefitRow}>
                <Ionicons 
                  name={benefit.icon as any} 
                  size={24} 
                  color={benefit.highlight || index === 0 ? '#A855F7' : '#ffffff'} 
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
            onPress={() => {
              // Heavy impact for purchase - critical financial action
              impactAsync(ImpactFeedbackStyle.Heavy);
              handlePurchase();
            }}
            disabled={isPurchasing || !selectedPackage}
          >
            <LinearGradient
              colors={["#A855F7", "#EC4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButtonInner}
            >
              {isPurchasing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={() => {
              // Medium impact for restore - important but not critical
              impactAsync(ImpactFeedbackStyle.Medium);
              handleRestore();
            }}
            disabled={isRestoring || isPurchasing}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.restoreButtonText}>Restore</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Popular Info Modal */}
        <PopularInfoModal />
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
    color: GlassTextColors.primary,
    fontSize: 16,
    marginTop: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
  },
  titleContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  mainTitle: {
    color: GlassTextColors.primary,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: GlassTextColors.muted,
    fontSize: 16,
    textAlign: 'center',
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitsTitle: {
    color: GlassTextColors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  benefitText: {
    color: GlassTextColors.primary,
    fontSize: 18,
    marginLeft: 16,
    flex: 1,
  },
  benefitTextHighlight: {
    color: '#A855F7',
    fontWeight: '600',
  },
  offeringsContainer: {
    marginBottom: 20,
  },
  offeringCard: {
    ...GlassStyles.container,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  offeringCardSelected: {
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  offeringCardContent: {
    position: 'relative',
  },
  offeringHeader: {
    marginBottom: 8,
  },
  offeringTitle: {
    color: GlassTextColors.primary,
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  offeringTitleSelected: {
    color: '#A855F7',
  },
  offeringPrice: {
    color: GlassTextColors.primary,
    fontSize: Platform.OS === 'ios' ? 20 : 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  offeringPriceSelected: {
    color: '#A855F7',
  },
  offeringDescription: {
    color: GlassTextColors.muted,
    fontSize: Platform.OS === 'ios' ? 14 : 12,
  },
  offeringDescriptionSelected: {
    color: '#fbbf24',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  popularText: {
    color: '#ffffff',
    fontSize: Platform.OS === 'ios' ? 12 : 10,
    fontWeight: 'bold',
  },
  infoIcon: {
    marginLeft: 2,
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#A855F7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    color: '#ffffff',
    fontSize: Platform.OS === 'ios' ? 12 : 10,
    fontWeight: 'bold',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  continueButton: {
    borderRadius: 28,
    padding: 2,
    height: 56,
    marginTop: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#A855F7',
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      }
    })
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: GlassTextColors.primary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  restoreButtonText: {
    color: GlassTextColors.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    ...GlassStyles.card,
    padding: 12,
    width: '100%',
    maxWidth: 280,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: GlassTextColors.primary,
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalMessage: {
    fontSize: 16,
    color: GlassTextColors.primary,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
});

export default Paywall;