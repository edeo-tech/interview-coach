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
import { useUpdateProfile, useDeleteAccount } from '@/_queries/users/auth/users';
import { useToast } from '@/components/Toast';
import { getCachedFeatureFlags } from '@/config/featureFlags';
import { usePremiumCheck } from '@/hooks/premium/usePremiumCheck';
import { useCustomerInfo } from '@/context/purchases/CustomerInfo';

const Settings = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  const { auth } = useAuth();
  const { showToast } = useToast();
  const { isPremium } = usePremiumCheck();
  const { customerInfo } = useCustomerInfo();

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

  const appVersion = getAppVersion();
  const buildVersion = getBuildVersion();

  // State for editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(auth?.name || '');
  const [email, setEmail] = useState(auth?.email || '');

  // Queries and mutations
  const { mutate: updateProfile, isPending: updatePending } = useUpdateProfile();
  const { mutate: deleteAccount, isPending: deletePending } = useDeleteAccount();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('settings');
    }, [posthogScreen])
  );

  const handleUpdateName = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      setName(auth?.name || '');
      setIsEditingName(false);
      return;
    }

    // Only update if the name has actually changed
    if (name.trim() === auth?.name) {
      setIsEditingName(false);
      return;
    }

    posthogCapture('update_profile_name', {
      old_name: auth?.name,
      new_name: name
    });

    updateProfile(
      { name: name.trim() },
      {
        onSuccess: () => {
          setIsEditingName(false);
          showToast('Name updated successfully', 'success');
        },
        onError: (error) => {
          console.error('Update name error:', error);
          showToast('Problem updating your name. Please try again.', 'error');
          setName(auth?.name || '');
          setIsEditingName(false);
        }
      }
    );
  };

  const handleNameBlur = () => {
    handleUpdateName();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            posthogCapture('delete_account_confirm');
            deleteAccount(undefined, {
              onSuccess: () => {
                showToast('Account deleted successfully', 'success');
                router.replace('/(auth)/landing');
              },
              onError: (error) => {
                console.error('Delete account error:', error);
                showToast('Unable to delete account. Please try again.', 'error');
              }
            });
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleLinkPress = (url: string, eventName: string) => {
    posthogCapture(eventName, { source: 'settings' });
    Linking.openURL(url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get premium subscription start date from RevenueCat CustomerInfo
  const getPremiumStartDate = () => {
    if (!customerInfo || !isPremium) return null;
    
    const premiumEntitlement = customerInfo.entitlements.active['premium'];
    if (!premiumEntitlement) return null;
    
    // Try to get the original purchase date
    const originalPurchaseDate = premiumEntitlement.originalPurchaseDate;
    if (originalPurchaseDate) {
      return new Date(originalPurchaseDate);
    }
    
    // Fallback to entitlement start date
    const startDate = premiumEntitlement.latestPurchaseDate;
    if (startDate) {
      return new Date(startDate);
    }
    
    return null;
  };

  // Get subscription management instructions based on platform
  const getSubscriptionManagementInfo = () => {
    if (Platform.OS === 'ios') {
      return {
        title: 'Manage Subscription',
        description: 'Go to Settings > Apple ID > Subscriptions',
        icon: 'settings-outline',
        action: () => {
          // Try to open iOS Settings app
          Linking.openURL('App-Prefs:root=General&path=ManagedConfigurationList');
        }
      };
    } else if (Platform.OS === 'android') {
      return {
        title: 'Manage Subscription',
        description: 'Go to Google Play Store > Profile > Payments & subscriptions',
        icon: 'card-outline',
        action: () => {
          // Try to open Google Play Store subscriptions
          Linking.openURL('https://play.google.com/store/account/subscriptions');
        }
      };
    } else {
      return {
        title: 'Manage Subscription',
        description: 'Contact support for subscription management',
        icon: 'help-circle-outline',
        action: () => {
          Linking.openURL('mailto:support@example.com?subject=Subscription Management');
        }
      };
    }
  };

  return (
    <ChatGPTBackground style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
            {/* Name Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Name</Text>
              {isEditingName ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="#6b7280"
                    onSubmitEditing={handleUpdateName}
                    onBlur={handleNameBlur}
                    autoFocus
                  />
                  {updatePending && (
                    <ActivityIndicator size="small" color="#F59E0B" style={{ marginLeft: 8 }} />
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.fieldValueContainer}
                  onPress={() => setIsEditingName(true)}
                >
                  <Text style={styles.fieldValue}>{auth?.name}</Text>
                  <Ionicons name="pencil" size={16} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>

            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={[styles.fieldValue, { color: '#6b7280' }]}>
                {auth?.email}
              </Text>
            </View>

            {/* Member Since */}
            {auth?.created_at && (
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Member Since</Text>
                <Text style={styles.fieldValue}>
                  {formatDate(auth.created_at)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Premium Section */}
        {getCachedFeatureFlags().paywallEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Premium</Text>
            <View style={styles.card}>
              <View style={styles.premiumStatus}>
                <View style={styles.premiumBadge}>
                  <Ionicons 
                    name={isPremium ? "diamond" : "gift"} 
                    size={16} 
                    color={isPremium ? "#F59E0B" : "#6B7280"} 
                  />
                  <Text style={[
                    styles.premiumText,
                    { color: isPremium ? "#F59E0B" : "#6B7280" }
                  ]}>
                    {isPremium ? "Premium" : "Free"}
                  </Text>
                </View>
                {!isPremium && (
                  <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={() => router.push('/(app)/paywall?source=settings')}
                  >
                    <Ionicons name="diamond" size={20} color="white" />
                    <Text style={styles.upgradeButtonText}>Upgrade</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Premium subscription details */}
              {isPremium && (
                <>
                  {/* Subscription start date */}
                  {(() => {
                    const startDate = getPremiumStartDate();
                    return startDate ? (
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Premium Since</Text>
                        <Text style={styles.fieldValue}>
                          {formatDate(startDate.toISOString())}
                        </Text>
                      </View>
                    ) : null;
                  })()}
                  
                  {/* Subscription management */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Subscription Management</Text>
                    <TouchableOpacity
                      style={styles.manageSubscriptionContainer}
                      onPress={() => {
                        const info = getSubscriptionManagementInfo();
                        try {
                          info.action();
                        } catch (error) {
                          // Fallback to showing instructions if direct link fails
                          Alert.alert(
                            info.title,
                            info.description,
                            [{ text: 'OK' }]
                          );
                        }
                      }}
                    >
                      <View style={styles.manageSubscriptionInfo}>
                        <Ionicons 
                          name={getSubscriptionManagementInfo().icon as any} 
                          size={16} 
                          color="#6b7280" 
                        />
                        <Text style={styles.manageSubscriptionText}>
                          {getSubscriptionManagementInfo().title}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleLinkPress('https://example.com/help', 'open_help_center')}
            >
              <Ionicons name="help-circle-outline" size={20} color="#6b7280" />
              <Text style={styles.linkText}>Help Center</Text>
              <Ionicons name="open-outline" size={16} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleLinkPress('mailto:support@example.com', 'contact_support')}
            >
              <Ionicons name="mail-outline" size={20} color="#6b7280" />
              <Text style={styles.linkText}>Contact Support</Text>
              <Ionicons name="open-outline" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleLinkPress('https://example.com/privacy', 'open_privacy_policy')}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color="#6b7280" />
              <Text style={styles.linkText}>Privacy Policy</Text>
              <Ionicons name="open-outline" size={16} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleLinkPress('https://example.com/terms', 'open_terms')}
            >
              <Ionicons name="document-text-outline" size={20} color="#6b7280" />
              <Text style={styles.linkText}>Terms of Service</Text>
              <Ionicons name="open-outline" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Danger Zone</Text>
          <View style={[styles.card, { borderColor: '#ef444440' }]}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDeleteAccount}
              disabled={deletePending}
            >
              {deletePending ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  <Text style={styles.dangerButtonText}>Delete Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>
            Version {appVersion} ({buildVersion})
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  fieldContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  fieldLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#e5e7eb',
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#e5e7eb',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingBottom: 4,
    marginRight: 12,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: '#e5e7eb',
    marginLeft: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 0,
    alignSelf: 'flex-start',
    borderRadius: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appInfoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },
  premiumStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  upgradeButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 16,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  manageButtonText: {
    fontSize: 16,
    color: '#f59e0b',
    fontWeight: '500',
    marginHorizontal: 8,
  },
  manageSubscriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  manageSubscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  manageSubscriptionText: {
    fontSize: 16,
    color: '#e5e7eb',
    marginLeft: 8,
  },
});

export default Settings;