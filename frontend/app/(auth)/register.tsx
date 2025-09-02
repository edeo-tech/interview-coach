import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { useToast } from '@/components/Toast';
import Colors from '../../constants/Colors';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import { useRegister, useLogin } from '@/_queries/users/auth/users';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle } from 'expo-haptics';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showToast } = useToast();
  const { posthogScreen, posthogCapture, posthogIdentify } = usePosthogSafely();
  const { impactAsync } = useHapticsSafely();
  
  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  const startAnimationSequence = useCallback(() => {
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
  }, [logoOpacity, contentTranslateY, contentOpacity]);
  
  // Run intro animation once on mount
  useEffect(() => {
    startAnimationSequence();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('auth_register');
    }, [posthogScreen])
  );
  
  const { mutate: login, isPending: loginLoading } = useLogin({posthogIdentify, posthogCapture, isFromRegistration: true});
  const { mutate: register, isPending: registerLoading, error: registerError, isSuccess: registerSuccess, reset: resetRegister } = useRegister();

  useEffect(() => {
    if (registerError) {
      const errorMessage = registerError.response?.data?.detail || 'Registration failed. Please try again.';
      posthogCapture('registration_failed', {
        error_message: errorMessage,
        email_domain: email.split('@')[1] || 'unknown'
      });
      showToast(errorMessage, 'error');
      resetRegister();
    }
  }, [registerError, posthogCapture, email, showToast, resetRegister]);

  useEffect(() => {
    if (registerSuccess) {
      posthogCapture('registration_successful', {
        email_domain: email.split('@')[1] || 'unknown'
      });
      showToast('Registration successful! Logging you in...', 'success');
      // Auto-login after successful registration
      login({ email, password });
      resetRegister();
    }
  }, [registerSuccess, posthogCapture, email, login, password, showToast, resetRegister]);


  const handleRegister = useCallback(() => {
    impactAsync(ImpactFeedbackStyle.Light);
    
    // Validation
    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'warning');
      return;
    }

    if (password.length < 8) {
      showToast('Password must be at least 8 characters long', 'warning');
      return;
    }

    posthogCapture('registration_attempted', {
      email_domain: email.split('@')[1] || 'unknown',
      password_length: password.length
    });
    register({ email, password });
  }, [email, password, showToast, posthogCapture, impactAsync, register]);
  
  // Memoize text input handlers to prevent unnecessary re-renders
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
  }, []);

  const isLoading = registerLoading || loginLoading;

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
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.welcomeText}>Create Account</Text>
                <Text style={styles.subtitle}>Join us to start your interview prep</Text>
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
                      onChangeText={handleEmailChange}
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
                      placeholder="Minimum 8 characters"
                      placeholderTextColor={Colors.text.tertiary}
                      value={password}
                      onChangeText={handlePasswordChange}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>
                  {password.length > 0 && (
                    <View style={styles.passwordStrength}>
                      <View style={[styles.strengthBar, password.length >= 8 ? styles.strengthBarStrong : styles.strengthBarWeak]} />
                      <Text style={[styles.strengthText, password.length >= 8 ? styles.strengthTextStrong : styles.strengthTextWeak]}>
                        {password.length >= 8 ? 'Strong password' : `${8 - password.length} more characters needed`}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.termsContainer}>
                  <Text style={styles.termsText}>
                    By registering you accept our{' '}
                    <Text
                      style={styles.termsLinkText}
                      onPress={() => {
                        impactAsync(ImpactFeedbackStyle.Light);
                        router.push('/(auth)/terms');
                      }}
                    >
                      terms of service
                    </Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.text.primary} size="small" />
                  ) : (
                    <>
                      <Text style={styles.registerButtonText}>Create Account</Text>
                      <Ionicons name="arrow-forward" size={20} color={Colors.text.primary} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
            
            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => router.replace('/(auth)/login')}
              >
                <Text style={styles.loginText}>Already have an account? Sign in</Text>
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
    color: Colors.white,
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
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.primary,
    textAlign: 'left',
    textAlignVertical: 'center',
    includeFontPadding: false,
    paddingVertical: 0,
    lineHeight: undefined,
  },
  
  // Password strength indicator
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  strengthBar: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginRight: 8,
  },
  strengthBarWeak: {
    backgroundColor: Colors.accent.gold,
  },
  strengthBarStrong: {
    backgroundColor: Colors.semantic.successAlt,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  strengthTextWeak: {
    color: Colors.accent.gold,
  },
  strengthTextStrong: {
    color: Colors.semantic.successAlt,
  },
  
  // Terms section
  termsContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  termsText: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    paddingVertical: 2,
  },
  termsLinkText: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
    textDecorationLine: 'underline',
  },
  
  // Register button
  registerButton: {
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
  registerButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.text.primary,
  },
  
  // Footer section
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  loginButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  loginText: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.quaternary,
    textAlign: 'center',
  },
});

export default Register;