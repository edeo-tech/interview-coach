import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import ChatGPTBackground from '@/components/ChatGPTBackground';
import usePosthogSafely from '@/hooks/posthog/usePosthogSafely';
import { useAuth } from '@/context/authentication/AuthContext';
import { useUpdateProfile, useDeleteAccount, useSubscriptionDetails } from '@/_queries/users/auth/users';
import { useToast } from '@/components/Toast';
import { getCachedFeatureFlags } from '@/config/featureFlags';

const Settings = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  const { auth } = useAuth();
  const { showToast } = useToast();

  // Get app version info safely
  const getAppVersion = () => {
    try {
      if (Platform.OS === 'web') {
        return Constants.expoConfig?.version || '1.0.0';
      }
      return Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';
    } catch {
      return Constants.expoConfig?.version || '1.0.0';
    }
  };

  const getBuildVersion = () => {
    try {
      if (Platform.OS === 'web') {
        return Constants.expoConfig?.android?.versionCode?.toString() || '1';
      }
      return Application.nativeBuildVersion || '1';
    } catch {
      return '1';
    }
  };

  // Local state for editing
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [tempName, setTempName] = useState(auth?.name || '');
  const [tempEmail, setTempEmail] = useState(auth?.email || '');

  // Queries and mutations
  const { mutate: updateProfile, isPending: updatePending } = useUpdateProfile();
  const { mutate: deleteAccount, isPending: deletePending } = useDeleteAccount();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscriptionDetails();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('settings');
    }, [posthogScreen])
  );

  const handleSaveName = () => {
    const trimmedName = tempName.trim();
    
    // Don't make API call if nothing changed
    if (trimmedName === auth?.name) {
      setEditingName(false);
      return;
    }
    
    if (trimmedName === '') {
      showToast('Name cannot be empty', 'error');
      setTempName(auth?.name || ''); // Reset to original
      setEditingName(false);
      return;
    }
    
    posthogCapture('update_profile_name', {
      source: 'settings'
    });

    updateProfile({ name: trimmedName }, {
      onSuccess: () => {
        setEditingName(false);
        showToast('Name updated successfully', 'success');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || 'Failed to update name';
        showToast(errorMessage, 'error');
        setTempName(auth?.name || ''); // Reset to original
        setEditingName(false);
      }
    });
  };

  const handleSaveEmail = () => {
    const trimmedEmail = tempEmail.trim();
    
    // Don't make API call if nothing changed
    if (trimmedEmail === auth?.email) {
      setEditingEmail(false);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showToast('Please enter a valid email address', 'error');
      setTempEmail(auth?.email || ''); // Reset to original
      setEditingEmail(false);
      return;
    }

    posthogCapture('update_profile_email', {
      source: 'settings'
    });

    updateProfile({ email: trimmedEmail }, {
      onSuccess: () => {
        setEditingEmail(false);
        showToast('Email updated successfully', 'success');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || 'Failed to update email';
        showToast(errorMessage, 'error');
        setTempEmail(auth?.email || ''); // Reset to original
        setEditingEmail(false);
      }
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your interviews, CV data, and account information.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This is your last chance. Type DELETE to confirm account deletion.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'DELETE',
                  style: 'destructive',
                  onPress: () => {
                    posthogCapture('delete_account', {
                      source: 'settings',
                      user_id: auth?.id
                    });
                    deleteAccount();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleManageSubscription = () => {
    if (subscription?.stripe_portal_url) {
      posthogCapture('open_stripe_portal', {
        source: 'settings',
        plan: subscription.plan_name
      });
      Linking.openURL(subscription.stripe_portal_url);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'canceled':
        return '#EF4444';
      case 'past_due':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <ChatGPTBackground style={styles.background}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              {/* Name Field */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Name</Text>
                {editingName ? (
                  <View style={styles.editingContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={tempName}
                      onChangeText={setTempName}
                      placeholder="Enter your name"
                      placeholderTextColor="#6B7280"
                      autoFocus
                      onBlur={handleSaveName}
                      editable={!updatePending}
                    />
                    {updatePending && (
                      <ActivityIndicator 
                        size="small" 
                        color="#F59E0B" 
                        style={styles.loadingIndicator}
                      />
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.fieldValue}
                    onPress={() => setEditingName(true)}
                  >
                    <Text style={styles.fieldText}>{auth?.name}</Text>
                    <Ionicons name="create-outline" size={20} color="#F59E0B" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.divider} />

              {/* Email Field */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Email</Text>
                {editingEmail ? (
                  <View style={styles.editingContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={tempEmail}
                      onChangeText={setTempEmail}
                      placeholder="Enter your email"
                      placeholderTextColor="#6B7280"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoFocus
                      onBlur={handleSaveEmail}
                      editable={!updatePending}
                    />
                    {updatePending && (
                      <ActivityIndicator 
                        size="small" 
                        color="#F59E0B" 
                        style={styles.loadingIndicator}
                      />
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.fieldValue}
                    onPress={() => setEditingEmail(true)}
                  >
                    <Text style={styles.fieldText}>{auth?.email}</Text>
                    <Ionicons name="create-outline" size={20} color="#F59E0B" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.divider} />

              {/* Delete Account */}
              <TouchableOpacity
                style={styles.dangerField}
                onPress={handleDeleteAccount}
                disabled={deletePending}
              >
                <Text style={styles.dangerFieldLabel}>Delete Account</Text>
                {deletePending ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Subscription Section - Only show if paywalls are enabled */}
          {getCachedFeatureFlags().paywallEnabled && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subscription</Text>
              <View style={styles.card}>
                {subscriptionLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#F59E0B" />
                    <Text style={styles.loadingText}>Loading subscription details...</Text>
                  </View>
                ) : subscription ? (
                  <>
                    <View style={styles.subscriptionHeader}>
                      <View style={styles.planBadge}>
                        <Ionicons 
                          name={subscription.is_premium ? "diamond" : "gift"} 
                          size={16} 
                          color={subscription.is_premium ? "#F59E0B" : "#6B7280"} 
                        />
                        <Text style={[
                          styles.planName, 
                          { color: subscription.is_premium ? "#F59E0B" : "#6B7280" }
                        ]}>
                          {subscription.plan_name}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge, 
                        { backgroundColor: getSubscriptionStatusColor(subscription.status) + '20' }
                      ]}>
                        <Text style={[
                          styles.statusText, 
                          { color: getSubscriptionStatusColor(subscription.status) }
                        ]}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </Text>
                      </View>
                    </View>

                    {subscription.current_period_end && (
                      <Text style={styles.billingText}>
                        Next billing: {formatDate(subscription.current_period_end)}
                      </Text>
                    )}

                    {subscription.is_premium ? (
                      subscription.stripe_portal_url && (
                        <>
                          <View style={styles.divider} />
                          <TouchableOpacity
                            style={styles.manageButton}
                            onPress={handleManageSubscription}
                          >
                            <Ionicons name="settings-outline" size={20} color="#F59E0B" />
                            <Text style={styles.manageButtonText}>Manage Subscription</Text>
                            <Ionicons name="open-outline" size={16} color="#F59E0B" />
                          </TouchableOpacity>
                        </>
                      )
                    ) : (
                      <>
                        <View style={styles.divider} />
                        <TouchableOpacity
                          style={styles.upgradeButton}
                          onPress={() => {
                            posthogCapture('navigate_to_paywall', {
                              source: 'settings'
                            });
                            router.push('/(app)/paywall');
                          }}
                        >
                          <Ionicons name="diamond" size={20} color="#ffffff" />
                          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                          <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                        </TouchableOpacity>
                      </>
                    )}
                  </>
                ) : (
                  <Text style={styles.errorText}>Failed to load subscription details</Text>
                )}
              </View>
            </View>
          )}

          {/* App Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Information</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>App Name</Text>
                <Text style={styles.infoValue}>{Constants.expoConfig?.name || 'Interview Guide AI'}</Text>
              </View>
              <View style={styles.dividerCompact} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Version</Text>
                <Text style={styles.infoValue}>{getAppVersion()}</Text>
              </View>
              <View style={styles.dividerCompact} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Build</Text>
                <Text style={styles.infoValue}>{getBuildVersion()}</Text>
              </View>
              <View style={styles.dividerCompact} />
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Linking.openURL('mailto:ross@edio.cc')}
              >
                <Text style={styles.infoLabel}>Support</Text>
                <View style={styles.contactValue}>
                  <Text style={styles.contactText}>ross@edio.cc</Text>
                  <Ionicons name="mail-outline" size={16} color="#F59E0B" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
  },
  field: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  fieldValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  fieldText: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
  },
  editingContainer: {
    position: 'relative',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  loadingIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
  editingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 20,
  },
  dividerCompact: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 8,
  },
  dangerField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  dangerFieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  billingText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F59E0B',
    flex: 1,
    marginLeft: 8,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    paddingVertical: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '400',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  contactValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '400',
  },
});

export default Settings;