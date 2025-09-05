'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useOfferings, usePurchase, useCustomerInfo } from '@/hooks/use-purchases';

type PaywallSource = 'retry' | 'feedback' | 'settings' | string;

export default function PaywallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = (searchParams.get('source') as PaywallSource) || 'settings';
  
  const { data: offerings, isLoading: offeringsLoading, error: offeringsError } = useOfferings();
  const purchaseMutation = usePurchase();
  const { refetch: refetchCustomerInfo } = useCustomerInfo();
  
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Set default selection when offerings load
  useEffect(() => {
    if (offerings?.current && offerings.current.availablePackages.length > 0 && !selectedPackage) {
      // Log the structure for debugging
      console.log('Offerings structure:', offerings);
      console.log('Available packages:', offerings.current.availablePackages);
      
      // Log detailed package structure
      offerings.current.availablePackages.forEach((pkg, index) => {
        console.log(`Package ${index}:`, {
          identifier: pkg.identifier,
          packageType: pkg.packageType,
          webBillingProduct: pkg.webBillingProduct,
          fullPackage: pkg
        });
      });
      
      // Default select weekly package (most popular)
      const weeklyPackage = offerings.current.availablePackages.find(
        pkg => pkg.packageType === '$rc_weekly' || pkg.identifier.toLowerCase().includes('weekly')
      );
      if (weeklyPackage) {
        setSelectedPackage(weeklyPackage.identifier);
      } else {
        setSelectedPackage(offerings.current.availablePackages[0].identifier);
      }
    }
  }, [offerings, selectedPackage]);

  // Calculate savings percentage
  const calculateSavingsPercentage = (weeklyPkg: any, monthlyPkg: any): number => {
    try {
      // RevenueCat JS SDK uses webBillingProduct.currentPrice.amountMicros for numeric price
      const weeklyPrice = weeklyPkg?.webBillingProduct?.currentPrice?.amountMicros ? weeklyPkg.webBillingProduct.currentPrice.amountMicros / 1000000 : 0;
      const monthlyPrice = monthlyPkg?.webBillingProduct?.currentPrice?.amountMicros ? monthlyPkg.webBillingProduct.currentPrice.amountMicros / 1000000 : 0;
      
      console.log('Price calculation:', { weeklyPrice, monthlyPrice });
      
      if (!weeklyPrice || !monthlyPrice) {
        console.warn('Price information not available for packages');
        return 0;
      }
      
      const fourWeeksPrice = weeklyPrice * 4;
      
      if (fourWeeksPrice === 0) return 0;
      const savings = ((fourWeeksPrice - monthlyPrice) / fourWeeksPrice) * 100;
      return Math.round(savings);
    } catch (error) {
      console.error('Error calculating savings:', error);
      return 0;
    }
  };

  // Get benefits based on source
  const getBenefits = () => {
    const benefits = [
      {
        id: 'unlimited',
        icon: '🔄',
        text: 'Unlimited interview attempts',
        highlight: source === 'retry'
      },
      {
        id: 'feedback',
        icon: '📊',
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


  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      // Find the actual package object, not just the identifier
      const packageToPurchase = offerings?.current?.availablePackages.find(
        pkg => pkg.identifier === selectedPackage
      );
      
      if (!packageToPurchase) {
        console.error('Package not found:', selectedPackage);
        return;
      }
      
      console.log('Package to purchase:', packageToPurchase);
      
      // Pass the package directly for web billing
      await purchaseMutation.mutateAsync(packageToPurchase);
      // Redirect to dashboard after successful purchase
      router.push('/dashboard');
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const benefits = getBenefits();
  const weeklyPackage = offerings?.current?.availablePackages.find(
    pkg => pkg.packageType === '$rc_weekly' || pkg.identifier.toLowerCase().includes('weekly')
  );
  const monthlyPackage = offerings?.current?.availablePackages.find(
    pkg => pkg.packageType === '$rc_monthly' || pkg.identifier.toLowerCase().includes('monthly')
  );
  
  const savingsPercentage = weeklyPackage && monthlyPackage 
    ? calculateSavingsPercentage(weeklyPackage, monthlyPackage)
    : 0;

  if (offeringsLoading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-purple-900/20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70 text-lg">Loading subscription options...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (offeringsError || !offerings?.current) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-purple-900/20 flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
            <p className="text-white/70 mb-6">We couldn't load the subscription options. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="glass-purple rounded-2xl px-6 py-3 text-white font-semibold hover:bg-brand-primary/20 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-purple-900/20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Close Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-nunito font-bold text-4xl text-white mb-4">
              Unlock Premium Access
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Choose your plan and start practicing
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-8">
            {benefits.map((benefit, index) => (
              <div key={benefit.id} className="flex items-center mb-6">
                <div className="text-3xl mr-4">{benefit.icon}</div>
                <p className={`text-lg ${
                  benefit.highlight || index === 0 
                    ? 'text-brand-primary font-semibold' 
                    : 'text-white'
                }`}>
                  {benefit.text}
                </p>
              </div>
            ))}
          </div>

          {/* Pricing Options */}
          <div className="space-y-4 mb-8">
            {monthlyPackage && (
              <div 
                className={`relative p-6 rounded-2xl cursor-pointer transition-all ${
                  selectedPackage === monthlyPackage.identifier
                    ? 'glass-purple'
                    : 'glass hover:glass-purple'
                }`}
                onClick={() => setSelectedPackage(monthlyPackage.identifier)}
              >
                {savingsPercentage > 0 && (
                  <div className="absolute -top-3 -right-3 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    Save {savingsPercentage}%
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={`font-nunito font-semibold text-xl mb-1 ${
                      selectedPackage === monthlyPackage.identifier ? 'text-brand-primary' : 'text-white'
                    }`}>
                      {monthlyPackage?.webBillingProduct?.title || 'Monthly Plan'}
                    </h3>
                    <p className="text-white/70">{monthlyPackage?.webBillingProduct?.description || 'Billed monthly'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-nunito font-bold text-2xl ${
                      selectedPackage === monthlyPackage.identifier ? 'text-brand-primary' : 'text-white'
                    }`}>
                      {monthlyPackage?.webBillingProduct?.currentPrice?.currency + ' ' + (monthlyPackage?.webBillingProduct?.currentPrice?.amountMicros ? (monthlyPackage.webBillingProduct.currentPrice.amountMicros / 1000000).toFixed(2) : '0') || 'Loading...'}
                    </p>
                    <p className="text-white/70 text-sm">per month</p>
                  </div>
                </div>
              </div>
            )}
            
            {weeklyPackage && (
              <div 
                className={`relative p-6 rounded-2xl cursor-pointer transition-all ${
                  selectedPackage === weeklyPackage.identifier
                    ? 'glass-purple'
                    : 'glass hover:glass-purple'
                }`}
                onClick={() => setSelectedPackage(weeklyPackage.identifier)}
              >
                <div className="absolute -top-3 -right-3 bg-success text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  Most Popular
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={`font-nunito font-semibold text-xl mb-1 ${
                      selectedPackage === weeklyPackage.identifier ? 'text-brand-primary' : 'text-white'
                    }`}>
                      {weeklyPackage?.webBillingProduct?.title || 'Weekly Plan'}
                    </h3>
                    <p className="text-white/70">{weeklyPackage?.webBillingProduct?.description || 'Billed weekly'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-nunito font-bold text-2xl ${
                      selectedPackage === weeklyPackage.identifier ? 'text-brand-primary' : 'text-white'
                    }`}>
                      {weeklyPackage?.webBillingProduct?.currentPrice?.currency + ' ' + (weeklyPackage?.webBillingProduct?.currentPrice?.amountMicros ? (weeklyPackage.webBillingProduct.currentPrice.amountMicros / 1000000).toFixed(2) : '0') || 'Loading...'}
                    </p>
                    <p className="text-white/70 text-sm">per week</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Purchase Button */}
          <div className="text-center mb-8">
            <button
              onClick={handlePurchase}
              disabled={!selectedPackage || purchaseMutation.isPending}
              className="w-full max-w-md glass-purple rounded-2xl px-12 py-4 text-lg font-nunito font-bold text-white hover:bg-brand-primary/20 transition-colors disabled:opacity-50 shadow-lg shadow-brand-primary/20"
            >
              {purchaseMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                'Continue'
              )}
            </button>
          </div>


          <div className="text-center mt-4">
            <p className="text-white/40 text-xs">
              Cancel anytime • Secure payment • Instant access
            </p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}