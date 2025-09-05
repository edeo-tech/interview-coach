import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, Modal, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import InterviewCreationProgress from '../../components/InterviewCreationProgress';
import OnboardingSkipWarning from '../../components/OnboardingSkipWarning';
import { useCreateInterviewFromURL, useCreateInterviewFromFile, useUserInterviews } from '../../_queries/interviews/interviews';
import { useToast } from '../../components/Toast';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle } from 'expo-haptics';
import { getNavigationDirection, setNavigationDirection } from '../../utils/navigationDirection';
import { extractUrlFromText, cleanJobUrl } from '../../utils/url/extractUrl';
import { TYPOGRAPHY } from '../../constants/Typography';
import Colors from '../../constants/Colors';

const SCREEN_WIDTH = 400; // For consistent animations

const OnboardingJobCreation = () => {
  const [jobUrl, setJobUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  
  const createFromURL = useCreateInterviewFromURL();
  const createFromFile = useCreateInterviewFromFile();
  const { data: interviewsData, isLoading: interviewsLoading } = useUserInterviews(5); // Get first 5 interviews
  const { showToast } = useToast();
  
  // Get existing interviews
  const existingInterviews = interviewsData?.pages.flatMap(page => page.interviews) || [];
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  const { impactAsync } = useHapticsSafely();

  // Animation values - matching other onboarding screens
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const buttonTranslateY = useRef(new Animated.Value(0)).current;
  const keyboardAnimValue = useRef(new Animated.Value(0)).current;

  // Entrance animation - matching profile-setup pattern
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('onboarding_job_creation');

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

  // Animate keyboard appearance
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowKeyboard(true);
      Animated.timing(keyboardAnimValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

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
        // Clear URL when file is selected
        setJobUrl('');
        posthogCapture('onboarding_job_file_selected', {
          file_type: result.assets[0].mimeType || 'unknown',
          file_size_kb: result.assets[0].size ? Math.round(result.assets[0].size / 1024) : null
        });
      }
    } catch (error) {
      showToast('Unable to select job file. Please try again.', 'error');
    }
  };

  const handleSubmit = async () => {
    // Determine which input method the user chose
    if (selectedFile) {
      // Handle file upload
      setShowProgressModal(true);
      impactAsync(ImpactFeedbackStyle.Medium);

      try {
        const formData = new FormData();
        formData.append('file', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType || 'application/pdf',
          name: selectedFile.name || 'job_description.pdf',
        } as any);
        
        const result = await createFromFile.mutateAsync(formData);
        
        posthogCapture('onboarding_interview_created', {
          method: 'file',
          file_type: selectedFile.mimeType || 'unknown',
          file_size_kb: selectedFile.size ? Math.round(selectedFile.size / 1024) : null
        });
        
        // Store the result for navigation after progress completes
        (global as any).pendingOnboardingInterviewResult = result;
        
      } catch (error: any) {
        setShowProgressModal(false);
        posthogCapture('onboarding_interview_creation_failed', {
          method: 'file',
          error_message: error.response?.data?.detail || error.message,
          file_type: selectedFile.mimeType || 'unknown'
        });
        showToast('Unable to process job file. Please try again.', 'error');
      }
    } else if (jobUrl.trim()) {
      // Handle URL input
      const { url: cleanedUrl, isValid } = cleanJobUrl(jobUrl);
      if (!isValid) {
        Alert.alert('Error', 'Please enter a valid URL');
        return;
      }

      setShowProgressModal(true);
      impactAsync(ImpactFeedbackStyle.Medium);

      try {
        const result = await createFromURL.mutateAsync({
          job_url: cleanedUrl,
        });
        
        posthogCapture('onboarding_interview_created', {
          method: 'url',
          job_url_domain: new URL(cleanedUrl).hostname
        });
        
        // Store the result for navigation after progress completes
        (global as any).pendingOnboardingInterviewResult = result;
        
      } catch (error: any) {
        setShowProgressModal(false);
        posthogCapture('onboarding_interview_creation_failed', {
          method: 'url',
          error_message: error.response?.data?.detail || error.message,
        });
        showToast('Unable to process job link. Please try again.', 'error');
      }
    } else {
      Alert.alert('Error', 'Please enter a job URL or select a job description file');
    }
  };

  const handleProgressComplete = () => {
    setShowProgressModal(false);
    showToast('Interview created successfully', 'success');
    
    // Clean up the stored result
    const result = (global as any).pendingOnboardingInterviewResult;
    if (result) {
      delete (global as any).pendingOnboardingInterviewResult;
    }
    
    navigateToReviews();
  };

  const handleSkipPress = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    setShowSkipWarning(true);
  };

  const handleSkipConfirm = () => {
    setShowSkipWarning(false);
    posthogCapture('onboarding_job_creation_skipped');
    navigateToReviews();
  };

  const navigateToReviews = () => {
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
        router.push('/(onboarding)/reviews');
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

  const isLoading = createFromURL.isPending || createFromFile.isPending;
  const canSubmit = (jobUrl.trim() || selectedFile) && showKeyboard;

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress 
          currentStep={6} 
          totalSteps={6}
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
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <Text style={styles.screenTitle}>Add Job Details</Text>
              <Text style={styles.subtitle}>
                Share the job you're interviewing for so we can create targeted practice questions
              </Text>

              {/* Existing Interviews Section */}
              {existingInterviews.length > 0 ? (
                <View style={styles.existingInterviewsSection}>
                  <Text style={styles.existingInterviewsTitle}>Your existing interviews</Text>
                  {existingInterviews.slice(0, 2).map((interview) => (
                    <View key={interview._id} style={styles.existingInterviewContainer}>
                      <Ionicons name="briefcase" size={20} color={Colors.brand.primary} />
                      <View style={styles.existingInterviewInfo}>
                        <Text style={styles.existingInterviewTitle}>{interview.role_title}</Text>
                        <Text style={styles.existingInterviewCompany}>{interview.company}</Text>
                      </View>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.semantic.successAlt} />
                    </View>
                  ))}
                  {existingInterviews.length > 2 && (
                    <Text style={styles.moreInterviewsText}>
                      +{existingInterviews.length - 2} more interview{existingInterviews.length - 2 > 1 ? 's' : ''}
                    </Text>
                  )}
                  <Text style={styles.existingInterviewsNote}>
                    You can continue with existing interviews or create a new one
                  </Text>
                </View>
              ) : null}

              {/* URL Input - with animation */}
              <Animated.View 
                style={[
                  styles.section,
                  {
                    opacity: keyboardAnimValue,
                    transform: [{
                      translateY: keyboardAnimValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    }],
                  }
                ]}
              >
                <TextInput
                  style={styles.urlInput}
                  placeholder="Paste job posting URL (LinkedIn, Indeed, etc.)"
                  placeholderTextColor={Colors.gray[500]}
                  value={jobUrl}
                  onChangeText={(text) => {
                    // Extract URL from pasted text
                    const extractedUrl = extractUrlFromText(text);
                    setJobUrl(extractedUrl);
                    // Clear file selection when user types URL
                    if (selectedFile) {
                      setSelectedFile(null);
                    }
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardAppearance="dark"
                  editable={showKeyboard}
                />
              </Animated.View>

              {/* Or Separator */}
              <Animated.View 
                style={[
                  styles.orContainer,
                  {
                    opacity: keyboardAnimValue,
                    transform: [{
                      translateY: keyboardAnimValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    }],
                  }
                ]}
              >
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
              </Animated.View>

              {/* File Upload Option */}
              <Animated.View 
                style={[
                  styles.section,
                  {
                    opacity: keyboardAnimValue,
                    transform: [{
                      translateY: keyboardAnimValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    }],
                  }
                ]}
              >
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
                      <TouchableOpacity onPress={() => {
                        setSelectedFile(null);
                        setJobUrl('');
                      }}>
                        <Ionicons name="close-circle" size={24} color={Colors.semantic.error} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.uploadPrompt}>
                      <Ionicons name="cloud-upload" size={24} color={Colors.brand.primary} />
                      <Text style={styles.uploadText}>Upload job description</Text>
                      <Text style={styles.uploadSubtext}>PDF, DOC, DOCX, TXT</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Benefits */}
              <View style={styles.benefitsContainer}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.semantic.successAlt} />
                  <Text style={styles.benefitText}>Role-specific interview questions</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.semantic.successAlt} />
                  <Text style={styles.benefitText}>Company-tailored scenarios</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.semantic.successAlt} />
                  <Text style={styles.benefitText}>Industry-relevant practice</Text>
                </View>
              </View>
            </View>
          </ScrollView>
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
          {canSubmit ? (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading || !canSubmit}
              style={[
                styles.createButton,
                (!canSubmit || isLoading) && styles.createButtonDisabled
              ]}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={24} color={Colors.white} />
              <Text style={styles.createButtonText}>Create Practice Interview</Text>
            </TouchableOpacity>
          ) : existingInterviews.length > 0 ? (
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={navigateToReviews}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continue with existing interviews</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </TouchableOpacity>
          ) : null}
          
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
          <InterviewCreationProgress onComplete={handleProgressComplete} />
        </Modal>

        {/* Skip Warning Modal */}
        <OnboardingSkipWarning
          visible={showSkipWarning}
          type="job"
          onClose={() => setShowSkipWarning(false)}
          onSkip={handleSkipConfirm}
        />
      </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
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
  section: {
    marginBottom: 24,
  },
  urlInput: {
    backgroundColor: Colors.glass.backgroundInput,
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: Colors.text.primary,
    fontSize: 16,
    height: 56,
    fontFamily: 'Inter',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.glass.border,
  },
  orText: {
    color: Colors.text.tertiary,
    fontSize: 14,
    marginHorizontal: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  fileButton: {
    backgroundColor: Colors.glass.backgroundInput,
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  uploadText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '500',
    marginTop: 8,
  },
  uploadSubtext: {
    color: Colors.text.tertiary,
    fontSize: 12,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  benefitsContainer: {
    width: '100%',
    gap: 16,
    marginTop: 24,
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
  createButton: {
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
  createButtonDisabled: {
    backgroundColor: Colors.glass.backgroundSubtle,
    borderColor: Colors.glass.backgroundSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.white,
    marginLeft: 8,
  },
  continueButton: {
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
  continueButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.white,
    marginRight: 8,
  },
  existingInterviewsSection: {
    width: '100%',
    marginBottom: 24,
  },
  existingInterviewsTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  existingInterviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  existingInterviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  existingInterviewTitle: {
    ...TYPOGRAPHY.labelMedium,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  existingInterviewCompany: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  moreInterviewsText: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  existingInterviewsNote: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: 8,
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

export default OnboardingJobCreation;