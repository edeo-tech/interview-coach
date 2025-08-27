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
import { TYPOGRAPHY } from '../../constants/Typography';
import Colors from '../../constants/Colors';
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
                    placeholderTextColor={Colors.gray[500]}
                    onSubmitEditing={handleUpdateName}
                    onBlur={handleNameBlur}
                    autoFocus
                  />
                  {updatePending && (
                    <ActivityIndicator size="small" color={Colors.brand.primary} style={{ marginLeft: 8 }} />
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.fieldValueContainer}
                  onPress={() => setIsEditingName(true)}
                >
                  <Text style={styles.fieldValue}>{auth?.name}</Text>
                  <Ionicons name="pencil" size={16} color={Colors.gray[500]} />
                </TouchableOpacity>
              )}
            </View>

            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={[styles.fieldValue, { color: Colors.gray[500] }]}>
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
                    color={isPremium ? Colors.accent.gold : Colors.gray[500]} 
                  />
                  <Text style={[
                    styles.premiumText,
                    { color: isPremium ? Colors.accent.gold : Colors.gray[500] }
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
                          color={Colors.gray[500]} 
                        />
                        <Text style={styles.manageSubscriptionText}>
                          {getSubscriptionManagementInfo().title}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={Colors.gray[500]} />
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
              onPress={() => handleLinkPress('https://edio.cc/privacy', 'open_help_center')}
            >
              <Ionicons name="help-circle-outline" size={20} color={Colors.gray[500]} />
              <Text style={styles.linkText}>Help Center</Text>
              <Ionicons name="open-outline" size={16} color={Colors.gray[500]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleLinkPress('mailto:ross@edio.cc', 'contact_support')}
            >
              <Ionicons name="mail-outline" size={20} color={Colors.gray[500]} />
              <Text style={styles.linkText}>Contact Support</Text>
              <Ionicons name="open-outline" size={16} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleLinkPress('https://edio.cc/privacy', 'open_privacy_policy')}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.gray[500]} />
              <Text style={styles.linkText}>Privacy Policy</Text>
              <Ionicons name="open-outline" size={16} color={Colors.gray[500]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => handleLinkPress('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/', 'open_terms')}
            >
              <Ionicons name="document-text-outline" size={20} color={Colors.gray[500]} />
              <Text style={styles.linkText}>Terms of Service</Text>
              <Ionicons name="open-outline" size={16} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.semantic.error }]}>Danger Zone</Text>
          <View style={[styles.card, { borderColor: Colors.glass.errorBorder }]}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDeleteAccount}
              disabled={deletePending}
            >
              {deletePending ? (
                <ActivityIndicator size="small" color={Colors.semantic.error} />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color={Colors.semantic.error} />
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
    paddingHorizontal: 20, // layout.screenPadding
    paddingBottom: 20, // spacing.5
  },
  headerTitle: {
    ...TYPOGRAPHY.contentTitle, // typography.heading.h2.fontFamily
    color: Colors.white, // text.primary
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20, // layout.screenPadding
  },
  section: {
    marginBottom: 24, // spacing.6
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: Colors.text.secondary, // text.secondary
    marginBottom: 12, // spacing.3
  },
  card: {
    backgroundColor: Colors.glass.background, // glass.background
    borderRadius: 16, // glass.borderRadius
    padding: 16, // spacing.4
    borderWidth: 1,
    borderColor: Colors.glass.border, // glass.border
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  fieldContainer: {
    paddingVertical: 12, // spacing.3
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderSecondary, // glassSecondary.border
  },
  fieldLabel: {
    ...TYPOGRAPHY.labelSmall,
    color: Colors.text.muted, // text.muted
    marginBottom: 4, // spacing.1
  },
  fieldValue: {
    ...TYPOGRAPHY.bodyMedium, // typography.body.medium.fontFamily
    color: Colors.text.secondary, // text.secondary
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
    ...TYPOGRAPHY.bodyMedium, // typography.body.medium.fontFamily
    color: Colors.white, // text.primary
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border, // glassInput.border
    paddingBottom: 4, // spacing.1
    marginRight: 12, // spacing.3
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16, // spacing.4
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderSecondary, // glassSecondary.border
  },
  linkText: {
    flex: 1,
    ...TYPOGRAPHY.bodyMedium, // typography.body.medium.fontFamily
    color: Colors.text.secondary, // text.secondary
    marginLeft: 12, // spacing.3
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4, // spacing.1
    paddingHorizontal: 0,
    alignSelf: 'flex-start',
    borderRadius: 8, // borderRadius.default
  },
  dangerButtonText: {
    ...TYPOGRAPHY.labelLarge,
    color: Colors.semantic.error, // semantic.error.main
    marginLeft: 8, // spacing.2
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32, // spacing.8
  },
  appInfoText: {
    ...TYPOGRAPHY.bodySmall, // typography.body.small.fontFamily
    color: Colors.text.muted, // text.muted
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32, // spacing.8
  },
  loadingText: {
    ...TYPOGRAPHY.bodySmall, // typography.body.small.fontFamily
    color: Colors.text.muted, // text.muted
    marginTop: 8, // spacing.2
  },
  errorText: {
    ...TYPOGRAPHY.labelMedium,
    color: Colors.semantic.error, // semantic.error.main
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
    ...TYPOGRAPHY.labelLarge,
    fontWeight: '600',
    marginLeft: 8, // spacing.2
  },
  upgradeButton: {
    backgroundColor: Colors.accent.goldAlt, // gold.400
    borderRadius: 12, // glassSecondary.borderRadius
    paddingVertical: 8, // spacing.2
    paddingHorizontal: 16, // spacing.4
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.accent.gold, // gold.400
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4, // Android shadow
  },
  upgradeButtonText: {
    ...TYPOGRAPHY.buttonSmall,
    color: Colors.white, // text.primary
    marginLeft: 6, // spacing.1.5
  },
  divider: {
    height: 1,
    backgroundColor: Colors.glass.borderSecondary, // glassSecondary.border
    marginVertical: 16, // spacing.4
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8, // spacing.2
  },
  manageButtonText: {
    ...TYPOGRAPHY.labelLarge,
    color: Colors.accent.goldAlt, // gold.400
    marginHorizontal: 8, // spacing.2
  },
  manageSubscriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8, // spacing.2
  },
  manageSubscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  manageSubscriptionText: {
    ...TYPOGRAPHY.bodyMedium, // typography.body.medium.fontFamily
    color: Colors.text.secondary, // text.secondary
    marginLeft: 8, // spacing.2
  },
});

export default Settings;