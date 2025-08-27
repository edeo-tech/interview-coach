import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassStyles } from '../../constants/GlassStyles';
import Colors from '../../constants/Colors';
import { useAuth } from '@/context/authentication/AuthContext';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import { useToast } from '@/components/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  const { getItem } = useSecureStore();
  
  useFocusEffect(() => {
    posthogScreen('auth_login');
    loadUserMetadata();
  });

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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="chatbubble-ellipses" size={48} color={Colors.white} />
            </View>
            <Text style={styles.title}>
              {userName ? `Welcome back, ${userName}!` : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>Sign in to continue your interview prep</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.gray[500]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.gray[500]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loginLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loginLoading}
            >
              {loginLoading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color={Colors.white} style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Social Sign-in Section */}
          <View style={styles.socialSignInContainer}>
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>
            
            <View style={styles.socialButtonsContainer}>
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

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account yet?</Text>
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => router.replace('/(auth)/welcome')}
            >
              <Text style={styles.linkText}>Create Account</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.accent.gold} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.glass.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.glass.borderSecondary,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[400],
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    ...GlassStyles.container,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GlassStyles.input,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.white,
  },
  button: {
    backgroundColor: Colors.accent.gold,
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      }
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: Colors.gray[400],
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.backgroundSubtle,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glass.borderSecondary,
  },
  linkText: {
    color: Colors.accent.gold,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  socialSignInContainer: {
    marginBottom: 32,
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
  socialButtonsContainer: {
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