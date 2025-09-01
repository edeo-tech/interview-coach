import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY } from '../../constants/Typography';
import Colors from '../../constants/Colors';
import { useAuth } from '@/context/authentication/AuthContext';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import { useToast } from '@/components/Toast';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import useSecureStore from '../../hooks/secure-store/useSecureStore';
import GoogleSignIn from '../../components/(auth)/GoogleSignIn';
import AppleSignIn from '../../components/(auth)/AppleSignIn';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [lastSignInType, setLastSignInType] = useState<string | null>(null);
  const { login, loginLoading, loginErrorMessage, loginSuccess, clearLoginError, googleLoginErrorMessage, appleLoginErrorMessage, clearGoogleLoginError, clearAppleLoginError, resetLogin } = useAuth();
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const { showToast } = useToast();
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  const { getItem } = useSecureStore();
  
  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('auth_login');
      loadUserMetadata();
      startAnimationSequence();
    }, [posthogScreen])
  );
  
  const startAnimationSequence = () => {
    // Reset animation values
    logoOpacity.setValue(0);
    contentTranslateY.setValue(30);
    contentOpacity.setValue(0);
    
    // Animate logo first
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Then animate content
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);
  };

  const loadUserMetadata = async () => {
    try {
      const storedUserName = await getItem('user_name');
      const storedLastSignInType = await getItem('last_sign_in_type');
      
      if (storedUserName) {
        setUserName(storedUserName);
      }
      if (storedLastSignInType) {
        setLastSignInType(storedLastSignInType);
      }
    } catch (error) {
      console.error('Error loading user metadata:', error);
    }
  };

  useEffect(() => {
    if (loginErrorMessage) {
      posthogCapture('login_failed', {
        error_message: loginErrorMessage,
        email_domain: email.split('@')[1] || 'unknown'
      });
      showToast(loginErrorMessage, 'error');
      clearLoginError();
    }
  }, [loginErrorMessage, posthogCapture, email, showToast, clearLoginError]);

  useEffect(() => {
    if (loginSuccess && hasAttemptedLogin) {
      showToast('Login successful!', 'info');
      resetLogin();
      setHasAttemptedLogin(false);
      // Navigation is handled in the login mutation's onSuccess callback
    } else if (loginSuccess && !hasAttemptedLogin) {
      // This is stale state from a previous login, clear it without showing toast
      resetLogin();
    }
  }, [loginSuccess, hasAttemptedLogin, showToast, resetLogin]);

  useEffect(() => {
    if (googleLoginErrorMessage) {
      showToast(googleLoginErrorMessage, 'error');
      clearGoogleLoginError();
    }
  }, [googleLoginErrorMessage, showToast, clearGoogleLoginError]);

  useEffect(() => {
    if (appleLoginErrorMessage) {
      showToast(appleLoginErrorMessage, 'error');
      clearAppleLoginError();
    }
  }, [appleLoginErrorMessage, showToast, clearAppleLoginError]);

  const handleLogin = () => {
    if (!email || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'warning');
      return;
    }

    posthogCapture('login_attempted', {
      email_domain: email.split('@')[1] || 'unknown'
    });
    setHasAttemptedLogin(true);
    login({ email, password });
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Animated Logo */}
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: logoOpacity
                }
              ]}
            >
              <Image
                source={require('../../assets/images/FinalAppIconTransparent.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>
            
            {/* Animated Content */}
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: contentOpacity,
                  transform: [{ translateY: contentTranslateY }]
                }
              ]}
            >
              {/* Welcome Header */}
              <View style={styles.header}>
                <Text style={styles.welcomeText}>
                  {userName ? `Welcome back,` : 'Welcome Back'}
                </Text>
                {userName && (
                  <Text style={styles.nameText}>{userName}!</Text>
                )}
                <Text style={styles.subtitle}>Sign in to continue your interview prep</Text>
              </View>

              {/* Email/Password Form */}
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color={Colors.text.tertiary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor={Colors.text.tertiary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color={Colors.text.tertiary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor={Colors.text.tertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.loginButton, loginLoading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <ActivityIndicator color={Colors.text.primary} size="small" />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Sign In</Text>
                      <Ionicons name="arrow-forward" size={20} color={Colors.text.primary} />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Social Sign-in Section */}
              <View style={styles.socialSection}>
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.divider} />
                </View>
                
                <View style={styles.socialButtons}>
                  <View style={lastSignInType === 'google' ? styles.lastUsedContainer : {}}>
                    {lastSignInType === 'google' && (
                      <Text style={styles.lastUsedLabel}>Last used</Text>
                    )}
                    <GoogleSignIn />
                  </View>
                  
                  <View style={lastSignInType === 'apple' ? styles.lastUsedContainer : {}}>
                    {lastSignInType === 'apple' && (
                      <Text style={styles.lastUsedLabel}>Last used</Text>
                    )}
                    <AppleSignIn />
                  </View>
                </View>
              </View>
            </Animated.View>
            
            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.createAccountButton}
                onPress={() => router.replace('/(auth)/welcome')}
              >
                <Text style={styles.createAccountText}>Don't have an account?</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  
  // Logo section
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  
  // Content section
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    ...TYPOGRAPHY.displaySmall,
    fontFamily: 'Nunito_600SemiBold',
    fontWeight: '600',
    letterSpacing: 0.5,
    color: Colors.white,
    textAlign: 'center',
  },
  nameText: {
    ...TYPOGRAPHY.heroMedium,
    fontFamily: 'Nunito_700Bold',
    color: Colors.brand.primary,
    lineHeight: 56,
    marginTop: -12,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.tertiary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  // Form section
  formContainer: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.background,
    borderRadius: 28,
    paddingHorizontal: 20,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.primary,
    textAlign: 'left',
    textAlignVertical: 'center',
    includeFontPadding: false,
    paddingVertical: 0,
    lineHeight: undefined, // Remove line height to let the container handle vertical centering
  },
  
  // Login button
  loginButton: {
    backgroundColor: Colors.glass.purpleMedium,
    borderWidth: 2,
    borderColor: Colors.brand.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
  },
  // Footer section
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  createAccountButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  createAccountText: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.quaternary,
    textAlign: 'center',
  },
  // Social sign-in section
  socialSection: {
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.glass.borderSecondary,
  },
  dividerText: {
    color: Colors.gray[400],
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  socialButtons: {
    gap: 12,
  },
  lastUsedContainer: {
    position: 'relative',
  },
  lastUsedLabel: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: Colors.accent.gold,
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  errorText: {
    color: Colors.semantic.error,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
});

export default Login;