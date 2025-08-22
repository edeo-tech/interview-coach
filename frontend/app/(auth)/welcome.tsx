import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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

  // Animation values - Let's use useRef to ensure they persist
  const logoTranslateY = React.useRef(new Animated.Value(0)).current;
  const textOpacity = React.useRef(new Animated.Value(0)).current;
  const buttonOpacity = React.useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('onboarding_welcome');
    }, [posthogScreen])
  );

  useEffect(() => {
    // Start animation sequence when component mounts
    const timer = setTimeout(() => {
      startAnimationSequence();
    }, 300); // Small delay to ensure component is mounted

    return () => clearTimeout(timer);
  }, []);

  const startAnimationSequence = () => {
    console.log('🎬 Starting animation sequence...');
    
    // Reset all values to initial state
    logoTranslateY.setValue(0);
    textOpacity.setValue(0);
    buttonOpacity.setValue(0);
    
    console.log('📍 Initial values set');

    // Step 1: Logo moves up
    console.log('🔄 Step 1: Logo moving up...');
    Animated.timing(logoTranslateY, {
      toValue: -40,
      duration: 1000,
      useNativeDriver: true,
    }).start((finished) => {
      console.log('✅ Logo animation finished:', finished);
    });

    // Step 2: Text appears
    setTimeout(() => {
      console.log('🔄 Step 2: Text appearing...');
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start((finished) => {
        console.log('✅ Text animation finished:', finished);
      });
    }, 800);

    // Step 3: Button appears
    setTimeout(() => {
      console.log('🔄 Step 3: Button appearing...');
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start((finished) => {
        console.log('✅ Button animation finished:', finished);
      });
    }, 2000);
  };


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
          {/* Animated Logo */}
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                transform: [{ translateY: logoTranslateY }]
              }
            ]}
          >
            <Image 
              source={require('../../assets/images/FinalAppIconTransparent.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Animated Message */}
          <Animated.View 
            style={[
              styles.messageContainer,
              {
                opacity: textOpacity
              }
            ]}
          >
            <Text style={styles.messageText}>
              Get to the nextround
            </Text>
          </Animated.View>

          {/* Animated Button */}
          <Animated.View 
            style={[
              styles.buttonContainer,
              {
                opacity: buttonOpacity
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.getStartedButton} 
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedText}>Start practicing now</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>

          {/* Subtle login link */}
          <Animated.View 
            style={[
              styles.loginContainer,
              {
                opacity: buttonOpacity
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.loginLink} 
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLinkText}>Already have an account?</Text>
            </TouchableOpacity>
          </Animated.View>
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
            <BlurView
              intensity={80}
              tint="dark"
              style={styles.modalBlurOverlay}
            />
            <Pressable 
              style={styles.modalContent} 
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalContainer}>
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
                    activeOpacity={0.8}
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons name="mail" size={22} color="#F59E0B" />
                    </View>
                    <Text style={styles.emailButtonText}>Continue with Email</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  // Layout
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  
  // Logo section
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  
  // Message section
  messageContainer: {
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: 32,
  },
  messageText: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk',
    letterSpacing: -0.01,
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: 320,
  },
  
  // Button section
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  
  // Primary CTA button
  getStartedButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(168, 85, 247, 0.15)', // Slightly opaque purple
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgb(169, 85, 247)',
  },
  getStartedText: {
    fontSize: 18, // Design system typography.button.large
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'Inter',
    letterSpacing: 0.005,
    color: '#ffffff',
    marginRight: 8,
  },
  
  // Login section
  loginContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loginLink: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  loginLinkText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
  },
  
  // Modal styling
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBlurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    paddingTop: 16,
    maxHeight: '75%',
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
    fontSize: 24, // Design system typography.heading.h2
    lineHeight: 30,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk',
    letterSpacing: -0.005,
    color: '#FFFFFF', // Design system text.primary
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16, // Design system typography.body.medium
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: 'rgba(255, 255, 255, 0.70)', // Design system text.tertiary
    textAlign: 'center',
    marginBottom: 32,
  },
  
  // Sign in options
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glass border color
  },
  dividerText: {
    fontSize: 14, // Design system typography.label.medium
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter',
    letterSpacing: 0.01,
    color: 'rgba(255, 255, 255, 0.55)', // Design system text.muted
    marginHorizontal: 16,
  },
  emailButton: {
    height: 56, // Design system buttonHeight.large
    borderRadius: 12, // Design system borderRadius.md
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 12,
    width: '100%',
  },
  emailButtonText: {
    fontSize: 16, // Design system typography.button.medium
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Inter',
    letterSpacing: 0.005,
    color: '#F59E0B',
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