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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '@/components/Toast';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import { GlassStyles } from '../../constants/GlassStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRegister, useLogin } from '@/_queries/users/auth/users';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const { posthogScreen, posthogCapture, posthogIdentify } = usePosthogSafely();
  
  useFocusEffect(() => {
    posthogScreen('auth_register');
  });
  
  const { mutate: register, isPending: registerLoading, error: registerError, isSuccess: registerSuccess } = useRegister();
  const { mutate: login, isPending: loginLoading } = useLogin({posthogIdentify, posthogCapture, isFromRegistration: true});

  useEffect(() => {
    if (registerError) {
      const errorMessage = registerError.response?.data?.detail || 'Registration failed. Please try again.';
      posthogCapture('registration_failed', {
        error_message: errorMessage,
        email_domain: email.split('@')[1] || 'unknown'
      });
      showToast(errorMessage, 'error');
    }
  }, [registerError, posthogCapture, email]);

  useEffect(() => {
    if (registerSuccess) {
      posthogCapture('registration_successful', {
        email_domain: email.split('@')[1] || 'unknown'
      });
      showToast('Registration successful! Logging you in...', 'success');
      // Auto-login after successful registration
      login({ email, password });
    }
  }, [registerSuccess, posthogCapture, email, login, password]);


  const handleRegister = () => {
    // Validation
    if (!name || !email || !password) {
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
      password_length: password.length,
      name_provided: !!name
    });
    register({ name, email, password });
  };

  const isLoading = registerLoading || loginLoading;

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
              <Ionicons name="person-add" size={48} color="#ffffff" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to start your interview preparation</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#6B7280"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#6B7280"
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
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
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
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/terms')}
                  style={styles.termsLink}
                >
                  <Text style={styles.termsLinkText}>terms of service</Text>
                </TouchableOpacity>
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={20} color="#ffffff" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>
          </View>


          {/* Footer */}
          {/* <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => router.replace('/(auth)/welcome')}
            >
              <Text style={styles.linkText}>Sign In</Text>
              <Ionicons name="chevron-forward" size={16} color="#F59E0B" />
            </TouchableOpacity>
          </View> */}
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
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    ...GlassStyles.container,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthBar: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginRight: 8,
  },
  strengthBarWeak: {
    backgroundColor: '#F59E0B',
  },
  strengthBarStrong: {
    backgroundColor: '#10B981',
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  strengthTextWeak: {
    color: '#F59E0B',
  },
  strengthTextStrong: {
    color: '#10B981',
  },
  button: {
    backgroundColor: '#F59E0B',
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
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
    color: '#9CA3AF',
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  linkText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  termsContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    paddingVertical: 2,
  },
  termsLinkText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default Register;