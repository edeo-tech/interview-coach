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
import { TYPOGRAPHY } from '../../constants/Typography';
import Colors from '../../constants/Colors';
import { BlurView } from 'expo-blur';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import GoogleSignIn from '../../components/(auth)/GoogleSignIn';
import AppleSignIn from '../../components/(auth)/AppleSignIn';
import { useToast } from '../../components/Toast';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle } from 'expo-haptics';
import { fonts } from '../../constants/Fonts';

const Welcome = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const { showToast } = useToast();
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  const { impactAsync } = useHapticsSafely();

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
      toValue: -20,
      duration: 800,
      useNativeDriver: true,
    }).start((finished) => {
      console.log('✅ Logo animation finished:', finished);
    });

    // Step 2: Text appears
    setTimeout(() => {
      console.log('🔄 Step 2: Text appearing...');
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
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
    }, 1600);
  };


  const handleGetStarted = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    posthogCapture('onboarding_get_started_clicked');
    setIsModalVisible(true);
  };

  const handleEmailSignIn = () => {
    impactAsync(ImpactFeedbackStyle.Light);
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
            <Text style={styles.messageText}>Get to the</Text>
            <Text style={styles.brandText}>nextround</Text>
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

        </View>

        {/* Subtle login link at bottom */}
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
            onPress={() => {
              impactAsync(ImpactFeedbackStyle.Light);
              router.push('/(auth)/login');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.loginLinkText}>Already have an account?</Text>
          </TouchableOpacity>
          
          {/* <TouchableOpacity 
            style={[styles.loginLink, { marginTop: 8 }]} 
            onPress={() => router.push('/(onboarding)/profile-setup')}
            activeOpacity={0.7}
          >
            <Text style={[styles.loginLinkText, { color: '#F59E0B' }]}>Test Onboarding Flow</Text>
          </TouchableOpacity> */}
        </Animated.View>

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
                  Takes 2 mins to personalize your roadmap
                </Text>

                <View style={styles.signInOptions}>
                  <GoogleSignIn />
                  <AppleSignIn />
                  
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
                      <Ionicons name="mail" size={22} color="#ffffff" />
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
    marginBottom: 24,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  
  // Message section
  messageContainer: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 32,
  },
  messageText: {
    ...TYPOGRAPHY.welcomeIntro,
    color: Colors.white,
    textAlign: 'center',
    maxWidth: 360, // Increased for larger text
  },
  brandText: {
    ...TYPOGRAPHY.welcomeHero,
    color: Colors.brand.primary,
    marginTop: -8, // Adjusted for larger text
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
    height: 60, // Increased from 56 to accommodate larger text
    borderRadius: 30, // Adjusted proportionally
    backgroundColor: Colors.glass.purple, // Slightly opaque purple
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.brand.primaryRGB,
  },
  getStartedText: {
    ...TYPOGRAPHY.primaryCTA,
    color: Colors.white,
    marginRight: 8,
    textAlignVertical: 'center', // Ensure vertical centering
  },
  
  // Login section
  loginContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  loginLink: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  loginLinkText: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.quaternary,
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
    backgroundColor: Colors.glass.border,
    borderWidth: 1,
    borderColor: Colors.glass.borderInteractive,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    paddingTop: 16,
    flexShrink: 1,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.glass.borderPressed,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    ...TYPOGRAPHY.pageTitle,
    color: Colors.text.primary, // Design system text.primary
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.tertiary, // Design system text.tertiary
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
    backgroundColor: Colors.glass.border, // Glass border color
  },
  dividerText: {
    ...TYPOGRAPHY.labelMedium,
    color: Colors.text.muted, // Design system text.muted
    marginHorizontal: 16,
  },
  emailButton: {
    height: 56,
    borderRadius: 28, // Match Google/Apple buttons
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Match glass effect
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 12,
    width: '100%',
  },
  emailButtonText: {
    color: '#ffffff', // Match Google/Apple button text
    fontSize: 16,
    fontWeight: '600',
  },
  iconContainer: {
    width: 22, // Match Google/Apple icon size
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Welcome;