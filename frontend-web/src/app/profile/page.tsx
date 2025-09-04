'use client';

import { useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useCheckAuth, useUpdateProfile } from '@/hooks/use-auth';
import { useCustomerInfo } from '@/hooks/use-purchases';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { data: user } = useCheckAuth();
  const updateProfileMutation = useUpdateProfile();
  const { data: customerInfo } = useCustomerInfo();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [industry, setIndustry] = useState(user?.industry || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      name,
      email,
      age: age ? parseInt(age) : undefined,
      industry: industry || undefined
    });
  };

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8">
            <h1 className="font-nunito font-bold text-3xl mb-2">Profile Settings</h1>
            <p className="text-white/70">Manage your account information</p>
          </header>

          <div className="glass rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 glass-subtle rounded-xl border-0 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 glass-subtle rounded-xl border-0 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 glass-subtle rounded-xl border-0 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 glass-subtle rounded-xl border-0 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                  placeholder="Technology, Finance, Healthcare, etc."
                />
              </div>

              {updateProfileMutation.error && (
                <p className="text-error text-sm">
                  Failed to update profile. Please try again.
                </p>
              )}

              {updateProfileMutation.isSuccess && (
                <p className="text-success text-sm">
                  Profile updated successfully!
                </p>
              )}

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full glass-purple font-nunito font-semibold py-3 rounded-xl hover:bg-brand-primary/20 transition-colors disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Subscription Status */}
          <div className="glass rounded-2xl p-6 mt-6">
            <h3 className="font-nunito font-semibold text-lg mb-4">Subscription</h3>
            {customerInfo ? (
              <div className="space-y-4">
                {Object.keys(customerInfo.entitlements.active).length > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Status</span>
                      <span className="font-medium text-success">Premium Active</span>
                    </div>
                    {Object.entries(customerInfo.entitlements.active).map(([key, entitlement]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-white/70">Plan</span>
                        <span className="font-medium">{entitlement.identifier}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-white/70 mb-4">You're on the free plan</p>
                    <button
                      onClick={() => router.push('/paywall')}
                      className="glass-purple font-nunito font-medium px-6 py-2 rounded-lg hover:bg-brand-primary/20 transition-colors"
                    >
                      Upgrade to Premium
                    </button>
                  </div>
                )}
                
                {customerInfo.managementURL && (
                  <a
                    href={customerInfo.managementURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-brand-primary hover:underline mt-4"
                  >
                    Manage Subscription
                  </a>
                )}
              </div>
            ) : (
              <p className="text-white/70">Loading subscription info...</p>
            )}
          </div>

          {/* Account Actions */}
          <div className="glass rounded-2xl p-6 mt-6">
            <h3 className="font-nunito font-semibold text-lg mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 text-error hover:bg-error/10 rounded-lg transition-colors">
                <span className="font-medium">Delete Account</span>
                <p className="text-white/70 text-sm">Permanently delete your account</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}