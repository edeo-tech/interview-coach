import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import GoogleSignIn from '../../components/(auth)/GoogleSignIn';
import AppleSignIn from '../../components/(auth)/AppleSignIn';
import { useToast } from '../../components/Toast';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';

const Welcome = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const { showToast } = useToast();
  const { posthogScreen, posthogCapture } = usePosthogSafely();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('onboarding_welcome');
    }, [posthogScreen])
  );

  const handleGetStarted = () => {
    posthogCapture('onboarding_get_started_clicked');
    setIsModalVisible(true);
  };

  const handleEmailSignIn = () => {
    posthogCapture('onboarding_email_signin_clicked');
    setIsModalVisible(false);
    router.push('/(auth)/register');
  };

  React.useEffect(() => {
    if (loginErrorMessage) {
      showToast(loginErrorMessage, 'error');
      setLoginErrorMessage('');
    }
  }, [loginErrorMessage, showToast]);

  return (
    <ChatGPTBackground style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Logo and branding */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="chatbubble-ellipses" size={64} color="#F59E0B" />
            </View>
          </View>

          {/* Title and subtitle */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Interview Coach</Text>
            <Text style={styles.subtitle}>
              Master your interviews with AI-powered practice sessions
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="sparkles" size={24} color="#F59E0B" />
              <Text style={styles.featureText}>Personalized interview questions</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={24} color="#F59E0B" />
              <Text style={styles.featureText}>Real-time feedback & coaching</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
              <Text style={styles.featureText}>Track your progress & improve</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* Subtle login link */}
          <TouchableOpacity 
            style={styles.loginLink} 
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginLinkText}>Already have an account?</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Sheet Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setIsModalVisible(false)}
          >
            <Pressable 
              style={styles.modalContent} 
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHandle} />
              
              <Text style={styles.modalTitle}>Create your account</Text>
              <Text style={styles.modalSubtitle}>
                Choose how you'd like to sign up
              </Text>

              <View style={styles.signInOptions}>
                <GoogleSignIn setLoginErrorMessage={setLoginErrorMessage} />
                <AppleSignIn setLoginErrorMessage={setLoginErrorMessage} />
                
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.divider} />
                </View>

                <TouchableOpacity 
                  style={styles.emailButton} 
                  onPress={handleEmailSignIn}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="mail" size={22} color="#F59E0B" />
                  </View>
                  <Text style={styles.emailButtonText}>Continue with Email</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginBottom: 48,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 16,
  },
  getStartedButton: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  loginLink: {
    paddingVertical: 8,
  },
  loginLinkText: {
    color: '#9ca3af',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  signInOptions: {
    gap: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  emailButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 12,
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  emailButtonText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginLeft: -36, // Offset for icon to center text
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Welcome;