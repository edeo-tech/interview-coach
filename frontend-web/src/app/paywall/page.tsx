'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useOfferings, usePurchase } from '@/hooks/use-purchases';

export default function PaywallPage() {
  const router = useRouter();
  const { data: offerings, isLoading: offeringsLoading } = useOfferings();
  const purchaseMutation = usePurchase();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      await purchaseMutation.mutateAsync(selectedPackage);
      // Redirect to dashboard after successful purchase
      router.push('/dashboard');
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-nunito font-bold text-4xl mb-4">
              Unlock Premium Features
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Get unlimited practice interviews, detailed feedback, and advanced analytics to land your dream job
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">🎤</div>
              <h3 className="font-nunito font-semibold text-lg mb-2">Unlimited Interviews</h3>
              <p className="text-white/70 text-sm">Practice as much as you want</p>
            </div>
            
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-nunito font-semibold text-lg mb-2">Detailed Analytics</h3>
              <p className="text-white/70 text-sm">Track your improvement over time</p>
            </div>
            
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-nunito font-semibold text-lg mb-2">Personalized Feedback</h3>
              <p className="text-white/70 text-sm">AI-powered improvement suggestions</p>
            </div>
          </div>

          {/* Pricing Options */}
          {offeringsLoading ? (
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {offerings?.current?.availablePackages.map((pkg) => (
                <button
                  key={pkg.identifier}
                  onClick={() => setSelectedPackage(pkg.identifier)}
                  className={`w-full p-6 rounded-2xl text-left transition-all ${
                    selectedPackage === pkg.identifier
                      ? 'glass-purple border-2 border-brand-primary'
                      : 'glass hover:glass-purple'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-nunito font-semibold text-xl mb-1">
                        {pkg.product.title}
                      </h3>
                      <p className="text-white/70">{pkg.product.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-nunito font-bold text-2xl text-brand-primary">
                        {pkg.product.priceString}
                      </p>
                      {pkg.packageType === 'ANNUAL' && (
                        <p className="text-white/70 text-sm">per year</p>
                      )}
                      {pkg.packageType === 'MONTHLY' && (
                        <p className="text-white/70 text-sm">per month</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Purchase Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handlePurchase}
              disabled={!selectedPackage || purchaseMutation.isPending}
              className="glass-purple font-nunito font-bold px-12 py-4 rounded-2xl text-lg hover:bg-brand-primary/20 transition-colors disabled:opacity-50"
            >
              {purchaseMutation.isPending ? 'Processing...' : 'Start Premium'}
            </button>
            
            <p className="text-white/50 text-sm mt-4">
              Cancel anytime • Secure payment • Instant access
            </p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}