'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useCheckAuth, useUpdateProfile, useDeleteAccount } from '@/hooks/use-auth';
import { useCustomerInfo } from '@/hooks/use-purchases';

export default function SettingsPage() {
  const { data: user } = useCheckAuth();
  const updateProfileMutation = useUpdateProfile();
  const deleteAccountMutation = useDeleteAccount();
  const { data: customerInfo } = useCustomerInfo();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user?.name || '');

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleUpdateName = () => {
    if (!name.trim()) {
      alert('Name cannot be empty');
      setName(user?.name || '');
      setIsEditingName(false);
      return;
    }

    if (name.trim() === user?.name) {
      setIsEditingName(false);
      return;
    }

    updateProfileMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setIsEditingName(false);
        },
        onError: () => {
          setName(user?.name || '');
          setIsEditingName(false);
        }
      }
    );
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      deleteAccountMutation.mutate();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isPremium = customerInfo && Object.keys(customerInfo.entitlements.active).length > 0;

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8">
            <h1 className="font-nunito font-bold text-3xl text-white">Settings</h1>
          </header>

          {/* Profile Section */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-nunito font-semibold text-xl mb-4 text-white">Profile</h2>
            
            {/* Name Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-white/70">Name</label>
              {isEditingName ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 px-4 py-2 glass-subtle rounded-lg border-0 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    onBlur={handleUpdateName}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                    autoFocus
                  />
                  {updateProfileMutation.isPending && (
                    <div className="w-5 h-5 border border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <span className="text-white">{user?.name}</span>
                  <svg className="w-4 h-4 text-white/50 group-hover:text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-white/70">Email</label>
              <span className="text-white/70">{user?.email}</span>
            </div>

            {/* Member Since */}
            {user?.created_at && (
              <div>
                <label className="block text-sm font-medium mb-2 text-white/70">Member Since</label>
                <span className="text-white">{formatDate(user.created_at)}</span>
              </div>
            )}
          </div>

          {/* Premium Section */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-nunito font-semibold text-xl mb-4 text-white">Premium</h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{isPremium ? '💎' : '🎁'}</span>
                <span className={`font-medium ${isPremium ? 'text-yellow-400' : 'text-white/70'}`}>
                  {isPremium ? 'Premium' : 'Free'}
                </span>
              </div>
              {!isPremium && (
                <Link
                  href="/paywall"
                  className="glass-purple font-nunito font-medium px-4 py-2 rounded-lg hover:bg-brand-primary/20 transition-colors flex items-center gap-2"
                >
                  <span>💎</span>
                  <span>Upgrade</span>
                </Link>
              )}
            </div>

            {isPremium && customerInfo?.managementURL && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <a
                  href={customerInfo.managementURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Manage Subscription</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Support Section */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-nunito font-semibold text-xl mb-4 text-white">Support</h2>
            <div className="space-y-3">
              <a
                href="https://edio.cc/help"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-3 px-4 glass-subtle rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="flex-1 text-white">Help Center</span>
                <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              <a
                href="mailto:ross@edio.cc"
                className="flex items-center gap-3 py-3 px-4 glass-subtle rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="flex-1 text-white">Contact Support</span>
                <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Legal Section */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-nunito font-semibold text-xl mb-4 text-white">Legal</h2>
            <div className="space-y-3">
              <a
                href="https://edio.cc/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-3 px-4 glass-subtle rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="flex-1 text-white">Privacy Policy</span>
                <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              <Link
                href="/terms"
                className="flex items-center gap-3 py-3 px-4 glass-subtle rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="flex-1 text-white">Terms of Service</span>
                <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass border border-red-500/30 rounded-2xl p-6 mb-6">
            <h2 className="font-nunito font-semibold text-xl mb-4 text-red-400">Danger Zone</h2>
            
            <button
              onClick={handleDeleteAccount}
              disabled={deleteAccountMutation.isPending}
              className="flex items-center gap-3 py-3 px-4 hover:bg-red-500/10 rounded-full transition-colors disabled:opacity-50"
            >
              {deleteAccountMutation.isPending ? (
                <div className="w-5 h-5 border border-red-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              <span className="text-red-400 font-medium">Delete Account</span>
            </button>
          </div>

          {/* App Version */}
          <div className="text-center py-8">
            <p className="text-white/50 text-sm">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}