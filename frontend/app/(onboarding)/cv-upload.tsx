import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import CVUploadProgress from '../../components/CVUploadProgress';
import OnboardingSkipWarning from '../../components/OnboardingSkipWarning';
import { useUploadCV } from '../../_queries/interviews/cv';
import { useToast } from '../../components/Toast';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle } from 'expo-haptics';
import { getNavigationDirection, setNavigationDirection } from '../../utils/navigationDirection';
import { TYPOGRAPHY } from '../../constants/Typography';
import Colors from '../../constants/Colors';

const SCREEN_WIDTH = 400; // For consistent animations

const OnboardingCVUpload = () => {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  
  const uploadCV = useUploadCV();
  const { showToast } = useToast();
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  const { impactAsync } = useHapticsSafely();

  // Animation values - matching other onboarding screens
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const buttonTranslateY = useRef(new Animated.Value(0)).current;

  // Entrance animation - matching profile-setup pattern
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('onboarding_cv_upload');

      // Determine slide direction based on last navigation direction
      const slideInFrom = getNavigationDirection() === 'back' ? -SCREEN_WIDTH : SCREEN_WIDTH;
      
      // Reset to slide-in position 
      contentTranslateX.setValue(slideInFrom);
      buttonTranslateY.setValue(30);
      contentOpacity.setValue(0);
      buttonOpacity.setValue(0);
      
      // Add a brief pause before sliding in new content
      setTimeout(() => {
        // Animate in content and button together with gentle timing
        Animated.parallel([
          Animated.timing(contentTranslateX, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          // Button animates in slightly after content starts, creating a nice cascade
          Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
              Animated.timing(buttonOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(buttonTranslateY, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              })
            ])
          ])
        ]).start();
      }, 100);
    }, [])
  );

  const handleFileSelect = async () => {
    try {
      impactAsync(ImpactFeedbackStyle.Light);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        // Validate file size (max 5MB)
        if (result.assets[0].size && result.assets[0].size > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 5MB.');
          return;
        }
        setSelectedFile(result.assets[0]);
        posthogCapture('onboarding_cv_file_selected', {
          file_type: result.assets[0].mimeType || 'unknown',
          file_size_kb: result.assets[0].size ? Math.round(result.assets[0].size / 1024) : null
        });
      }
    } catch (error) {
      showToast('Unable to select CV file. Please try again.', 'error');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select your CV file');
      return;
    }

    try {
      impactAsync(ImpactFeedbackStyle.Medium);
      setShowProgressModal(true);

      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || 'application/pdf',
        name: selectedFile.name || 'cv.pdf',
      } as any);
      
      await uploadCV.mutateAsync(formData);
      
      posthogCapture('onboarding_cv_upload_success', {
        file_type: selectedFile.mimeType || 'unknown',
        file_size_kb: selectedFile.size ? Math.round(selectedFile.size / 1024) : null
      });

      // Progress modal will handle navigation via onComplete
      
    } catch (error: any) {
      setShowProgressModal(false);
      posthogCapture('onboarding_cv_upload_failed', {
        error_message: error.response?.data?.detail || error.message,
        file_type: selectedFile.mimeType || 'unknown'
      });
      showToast('Problem uploading CV. Please try again.', 'error');
    }
  };

  const handleProgressComplete = () => {
    setShowProgressModal(false);
    showToast('CV uploaded successfully', 'success');
    navigateToJobCreation();
  };

  const handleSkipPress = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    setShowSkipWarning(true);
  };

  const handleSkipConfirm = () => {
    setShowSkipWarning(false);
    posthogCapture('onboarding_cv_upload_skipped');
    navigateToJobCreation();
  };

  const navigateToJobCreation = () => {
    setNavigationDirection('forward');
    
    // Slide out animation
    Animated.parallel([
      Animated.timing(contentTranslateX, {
        toValue: -SCREEN_WIDTH,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY, {
        toValue: 30,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      setTimeout(() => {
        router.push('/(onboarding)/job-creation');
      }, 100);
    });
  };

  const handleBack = () => {
    setNavigationDirection('back');
    
    // Slide out to right (back direction)
    Animated.parallel([
      Animated.timing(contentTranslateX, {
        toValue: SCREEN_WIDTH,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY, {
        toValue: 30,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      setTimeout(() => {
        router.back();
      }, 100);
    });
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <OnboardingProgress 
          currentStep={13} 
          totalSteps={12}
          onBack={handleBack}
        />
        
        {/* Animated content container */}
        <Animated.View 
          style={[
            styles.animatedContent,
            {
              transform: [{ translateX: contentTranslateX }],
              opacity: contentOpacity,
            }
          ]}
        >
          <View style={styles.content}>
            <Text style={styles.screenTitle}>Upload Your CV</Text>
            <Text style={styles.subtitle}>
              Help us personalize your interview experience by uploading your resume
            </Text>

            {/* File Upload Section */}
            <View style={styles.uploadSection}>
              <TouchableOpacity
                onPress={handleFileSelect}
                style={styles.fileButton}
                activeOpacity={0.8}
              >
                {selectedFile ? (
                  <View style={styles.selectedFileContainer}>
                    <Ionicons name="document-attach" size={24} color={Colors.semantic.successAlt} />
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName}>{selectedFile.name}</Text>
                      <Text style={styles.fileSize}>
                        {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Size unknown'}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedFile(null)}>
                      <Ionicons name="close-circle" size={24} color={Colors.semantic.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadPrompt}>
                    <Ionicons name="cloud-upload" size={32} color={Colors.brand.primary} />
                    <Text style={styles.uploadText}>Select your CV</Text>
                    <Text style={styles.uploadSubtext}>PDF, DOC, DOCX, TXT</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.semantic.successAlt} />
                <Text style={styles.benefitText}>Personalized interview questions</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.semantic.successAlt} />
                <Text style={styles.benefitText}>Tailored feedback and insights</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.semantic.successAlt} />
                <Text style={styles.benefitText}>Better preparation for real interviews</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Bottom buttons */}
        <Animated.View 
          style={[
            styles.bottomContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            }
          ]}
        >
          {selectedFile && (
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={handleUpload}
              disabled={uploadCV.isPending}
              activeOpacity={0.8}
            >
              <Text style={styles.uploadButtonText}>Upload CV</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={handleSkipPress}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Progress Modal */}
        <Modal
          visible={showProgressModal}
          transparent={true}
          animationType="fade"
          statusBarTranslucent={true}
        >
          <CVUploadProgress onComplete={handleProgressComplete} />
        </Modal>

        {/* Skip Warning Modal */}
        <OnboardingSkipWarning
          visible={showSkipWarning}
          type="cv"
          onClose={() => setShowSkipWarning(false)}
          onSkip={handleSkipConfirm}
        />
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
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
  },
  animatedContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    ...TYPOGRAPHY.heading1,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  uploadSection: {
    width: '100%',
    marginBottom: 32,
  },
  fileButton: {
    backgroundColor: Colors.glass.backgroundInput,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: Colors.glass.border,
    borderStyle: 'dashed',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  fileSize: {
    color: Colors.text.tertiary,
    fontSize: 14,
    marginTop: 2,
    fontFamily: 'Inter',
  },
  uploadPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    ...TYPOGRAPHY.labelLarge,
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  uploadSubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
  },
  benefitsContainer: {
    width: '100%',
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  benefitText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.secondary,
    marginLeft: 12,
    flex: 1,
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    alignItems: 'center',
    gap: 12,
  },
  uploadButton: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.glass.purple,
    borderWidth: 1,
    borderColor: Colors.brand.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  uploadButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.white,
    marginRight: 8,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    ...TYPOGRAPHY.buttonMedium,
    color: Colors.text.tertiary,
  },
});

export default OnboardingCVUpload;