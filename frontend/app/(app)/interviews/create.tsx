import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Animated, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../../components/ChatGPTBackground';
import InterviewCreationProgress from '../../../components/InterviewCreationProgress';
import * as DocumentPicker from 'expo-document-picker';
import { useCreateInterviewFromURL, useCreateInterviewFromFile } from '../../../_queries/interviews/interviews';
import { useCV, useUploadCV } from '../../../_queries/interviews/cv';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';
import { extractUrlFromText, cleanJobUrl } from '../../../utils/url/extractUrl';
import { useToast } from '../../../components/Toast';
import { TYPOGRAPHY } from '../../../constants/Typography';
import Colors from '../../../constants/Colors';


export default function CreateInterview() {
  const [currentStep, setCurrentStep] = useState<'cv' | 'job'>('cv');
  const [jobUrl, setJobUrl] = useState('');
  const [selectedCVFile, setSelectedCVFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [selectedJobFile, setSelectedJobFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const jobUrlInputRef = useRef<TextInput>(null);
  const keyboardAnimValue = useRef(new Animated.Value(0)).current;
  
  const { data: currentCV, isLoading: cvLoading } = useCV();
  const uploadCV = useUploadCV();
  const createFromURL = useCreateInterviewFromURL();
  const createFromFile = useCreateInterviewFromFile();
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  const { showToast } = useToast();
  
  const isLoading = createFromURL.isPending || uploadCV.isPending || createFromFile.isPending;

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('interview_create');
    }, [posthogScreen])
  );

  // If user already has CV, skip to job step
  React.useEffect(() => {
    if (currentCV && currentStep === 'cv') {
      setCurrentStep('job');
    }
  }, [currentCV, currentStep]);

  // Animate keyboard appearance when job step loads
  useEffect(() => {
    if (currentStep === 'job') {
      const timer = setTimeout(() => {
        setShowKeyboard(true);
        Animated.timing(keyboardAnimValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Focus the input after animation completes
          jobUrlInputRef.current?.focus();
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, keyboardAnimValue]);


  const handleCVFileSelect = async () => {
    try {
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
        setSelectedCVFile(result.assets[0]);
      }
    } catch (error) {
      showToast('Unable to select CV file. Please try again.', 'error');
    }
  };

  const handleCVUpload = async () => {
    if (!selectedCVFile) {
      Alert.alert('Error', 'Please select your CV file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedCVFile.uri,
        type: selectedCVFile.mimeType || 'application/pdf',
        name: selectedCVFile.name || 'cv.pdf',
      } as any);
      
      await uploadCV.mutateAsync(formData);
      posthogCapture('cv_upload_success', {
        source: 'create_interview',
        file_type: selectedCVFile.mimeType || 'unknown',
        file_size_kb: selectedCVFile.size ? Math.round(selectedCVFile.size / 1024) : null
      });
      showToast('CV uploaded successfully', 'success');
      setCurrentStep('job');
      
    } catch (error: any) {
      posthogCapture('cv_upload_failed', {
        source: 'create_interview',
        error_message: error.response?.data?.detail || error.message,
        file_type: selectedCVFile.mimeType || 'unknown'
      });
      showToast('Problem uploading CV. Please try again.', 'error');
    }
  };

  const handleJobFileSelect = async () => {
    try {
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
        setSelectedJobFile(result.assets[0]);
      }
    } catch (error) {
      showToast('Unable to select job file. Please try again.', 'error');
    }
  };

  const handleSubmit = async () => {
    // Determine which input method the user chose
    if (selectedJobFile) {
      // Handle file upload
      // Show progress modal immediately
      setShowProgressModal(true);

      try {
        const formData = new FormData();
        formData.append('file', {
          uri: selectedJobFile.uri,
          type: selectedJobFile.mimeType || 'application/pdf',
          name: selectedJobFile.name || 'job_description.pdf',
        } as any);
        
        const result = await createFromFile.mutateAsync(formData);
        
        posthogCapture('interview_created', {
          method: 'file',
          has_cv: !!currentCV,
          file_type: selectedJobFile.mimeType || 'unknown',
          file_size_kb: selectedJobFile.size ? Math.round(selectedJobFile.size / 1024) : null
        });
        
        console.log('Interview created from file:', result);
        
        // Store the result for navigation after progress completes
        (window as any).pendingInterviewResult = result;
        
      } catch (error: any) {
        // Hide progress modal on error
        setShowProgressModal(false);
        
        posthogCapture('interview_creation_failed', {
          method: 'file',
          error_message: error.response?.data?.detail || error.message,
          has_cv: !!currentCV,
          file_type: selectedJobFile.mimeType || 'unknown'
        });
        showToast('Unable to process job file. Please try again.', 'error');
      }
    } else if (jobUrl.trim()) {
      // Handle URL input
      // Validate the URL using our improved validation
      const { url: cleanedUrl, isValid } = cleanJobUrl(jobUrl);
      if (!isValid) {
        Alert.alert('Error', 'Please enter a valid URL');
        return;
      }

      // Show progress modal immediately
      setShowProgressModal(true);

      try {
        const result = await createFromURL.mutateAsync({
          job_url: cleanedUrl,
        });
        
        posthogCapture('interview_created', {
          method: 'url',
          has_cv: !!currentCV,
          job_url_domain: new URL(cleanedUrl).hostname
        });
        
        console.log('Interview created from URL:', result);
        
        // Store the result for navigation after progress completes
        (window as any).pendingInterviewResult = result;
        
      } catch (error: any) {
        // Hide progress modal on error
        setShowProgressModal(false);
        
        posthogCapture('interview_creation_failed', {
          method: 'url',
          error_message: error.response?.data?.detail || error.message,
          has_cv: !!currentCV
        });
        showToast('Unable to process job link. Please try again.', 'error');
      }
    } else {
      Alert.alert('Error', 'Please enter a job URL or select a job description file');
    }
  };

  const handleProgressComplete = () => {
    // Navigate to the interview details page
    const result = (window as any).pendingInterviewResult;
    if (result && result.data) {
      // Use replace to prevent going back to create screen
      router.replace(`/home/interviews/${result.data._id}/details` as any);
      // Clean up the stored result
      delete (window as any).pendingInterviewResult;
    } else {
      // Fallback: navigate back to home
      router.replace('/(app)/(tabs)/home');
    }
    
    // Delay modal close to prevent UI flash
    setTimeout(() => {
      setShowProgressModal(false);
    }, 100);
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode="interactive"
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            if (currentStep === 'job' && !currentCV) {
              setCurrentStep('cv');
            } else {
              router.back();
            }
          }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentStep === 'cv' ? 'Upload Your CV' : 'Create Interview'}
          </Text>
        </View>


        {/* CV Upload Step */}
        {currentStep === 'cv' && (
          <>
            <View style={styles.section}>
              <TouchableOpacity
                onPress={handleCVFileSelect}
                style={styles.fileButton}
              >
                {selectedCVFile ? (
                  <View style={styles.selectedFileContainer}>
                    <Ionicons name="document-attach" size={24} color={Colors.semantic.successAlt} />
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName}>{selectedCVFile.name}</Text>
                      <Text style={styles.fileSize}>
                        {selectedCVFile.size ? `${(selectedCVFile.size / 1024).toFixed(1)} KB` : 'Size unknown'}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedCVFile(null)}>
                      <Ionicons name="close-circle" size={24} color={Colors.semantic.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadPrompt}>
                    <Ionicons name="cloud-upload" size={24} color={Colors.brand.primary} />
                    <Text style={styles.uploadText} numberOfLines={1} ellipsizeMode="tail">Select your CV (PDF, DOC, DOCX, TXT)</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleCVUpload}
              disabled={!selectedCVFile || uploadCV.isPending}
              style={[
                styles.submitButton,
                (!selectedCVFile || uploadCV.isPending) && styles.submitButtonDisabled
              ]}
            >
              {uploadCV.isPending ? (
                <ActivityIndicator color={Colors.brand.primary} />
              ) : (
                <>
                  <Ionicons name="arrow-forward" size={24} color={Colors.white} />
                  <Text style={styles.submitText}>Continue</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Job Details Step */}
        {currentStep === 'job' && (
          <>
            {/* Instructions */}
            <View style={styles.section}>
              <Text style={styles.instructionText}>
                Please provide the job details by either pasting a URL or uploading a job description document.
              </Text>
            </View>

            {/* URL Input - with animation */}
            <Animated.View 
              style={[
                styles.section,
                {
                  opacity: keyboardAnimValue,
                  transform: [{
                    translateY: keyboardAnimValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  }],
                }
              ]}
            >
              <TextInput
                ref={jobUrlInputRef}
                style={styles.urlInput}
                placeholder="Paste job posting URL (LinkedIn, Indeed, etc.)"
                placeholderTextColor={Colors.gray[500]}
                value={jobUrl}
                onChangeText={(text) => {
                  // Extract URL from pasted text (handles LinkedIn shares, etc.)
                  const extractedUrl = extractUrlFromText(text);
                  setJobUrl(extractedUrl);
                  // Clear file selection when user types URL
                  if (selectedJobFile) {
                    setSelectedJobFile(null);
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
                      outputRange: [50, 0],
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
                      outputRange: [50, 0],
                    }),
                  }],
                }
              ]}
            >
              <TouchableOpacity
                onPress={handleJobFileSelect}
                style={styles.fileButton}
              >
                {selectedJobFile ? (
                  <View style={styles.selectedFileContainer}>
                    <Ionicons name="document-attach" size={24} color={Colors.semantic.successAlt} />
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName}>{selectedJobFile.name}</Text>
                      <Text style={styles.fileSize}>
                        {selectedJobFile.size ? `${(selectedJobFile.size / 1024).toFixed(1)} KB` : 'Size unknown'}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => {
                      setSelectedJobFile(null);
                      // Clear URL when file is deselected to avoid confusion
                      setJobUrl('');
                    }}>
                      <Ionicons name="close-circle" size={24} color={Colors.semantic.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadPrompt}>
                    <Ionicons name="cloud-upload" size={24} color={Colors.brand.primary} />
                    <Text style={styles.uploadText} numberOfLines={1} ellipsizeMode="tail">Upload job description (PDF, DOC, DOCX, TXT)</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Submit Button - with animation */}
            <Animated.View
              style={[
                {
                  opacity: keyboardAnimValue,
                  transform: [{
                    translateY: keyboardAnimValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  }],
                }
              ]}
            >
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading || (!jobUrl.trim() && !selectedJobFile) || !showKeyboard}
                style={[
                  styles.submitButton,
                  (isLoading || (!jobUrl.trim() && !selectedJobFile) || !showKeyboard) && styles.submitButtonDisabled
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.brand.primary} />
                ) : (
                  <>
                    <Ionicons name="add-circle" size={24} color={Colors.white} />
                    <Text style={styles.submitText}>Create Interview</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Progress Modal */}
      <Modal
        visible={showProgressModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <InterviewCreationProgress onComplete={handleProgressComplete} />
      </Modal>
    </SafeAreaView>
    </ChatGPTBackground>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20, // layout.screenPadding
  },
  scrollViewContent: {
    paddingBottom: 100, // Extra space at bottom for keyboard
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20, // spacing.5
  },
  headerTitle: {
    ...TYPOGRAPHY.pageTitle,
    color: Colors.text.primary,
    marginLeft: 16,
  },
  inputTypeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.glass.backgroundSecondary, // glassSecondary.background
    borderRadius: 12, // glassSecondary.borderRadius
    padding: 4, // spacing.1
    marginBottom: 24, // spacing.6
    borderWidth: 1,
    borderColor: Colors.glass.borderSecondary, // glassSecondary.border
  },
  inputTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12, // spacing.3
    borderRadius: 8, // borderRadius.default
  },
  inputTypeButtonActive: {
    backgroundColor: Colors.glass.goldLight, // gold.400 with opacity
  },
  inputTypeText: {
    ...TYPOGRAPHY.labelMedium,
    color: Colors.text.tertiary,
    marginLeft: 8,
    fontWeight: '600',
  },
  inputTypeTextActive: {
    color: Colors.text.primary, // text.primary
  },
  section: {
    marginBottom: 24, // spacing.6
  },
  urlInput: {
    backgroundColor: Colors.glass.backgroundInput, // glassInput.background
    borderRadius: 50, // Pill-shaped like other touchable elements
    paddingHorizontal: 20, // Increased horizontal padding for pill shape
    paddingVertical: 16, // Keep vertical padding
    color: Colors.text.primary, // text.primary
    fontSize: 16, // typography.body.medium.fontSize
    height: 56, // layout.inputHeight.medium - consistent with other inputs
    fontFamily: 'Inter', // typography.body.medium.fontFamily
  },
  fileButton: {
    backgroundColor: Colors.glass.backgroundInput, // glassInput.background
    borderRadius: 50, // Pill-shaped like the input
    paddingHorizontal: 20, // Horizontal padding for pill shape
    paddingVertical: 12, // Reduced vertical padding to prevent cutoff
    borderWidth: 1,
    borderColor: Colors.glass.border, // glassInput.border
    height: 48, // Reduced height to prevent cutoff
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
    marginLeft: 12, // spacing.3 - keep space between icon and file info
  },
  fileName: {
    color: Colors.text.primary, // text.primary
    fontSize: 16, // typography.body.medium.fontSize
    fontWeight: '500', // typography.label.large.fontWeight
    fontFamily: 'Inter', // typography.body.medium.fontFamily
  },
  fileSize: {
    color: Colors.text.tertiary, // text.tertiary
    fontSize: 14, // typography.body.small.fontSize
    marginTop: 2, // spacing.0.5
    fontFamily: 'Inter', // typography.body.small.fontFamily
  },
  uploadPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    gap: 12, // Consistent spacing between icon and text
  },
  uploadText: {
    color: Colors.text.tertiary, // text.tertiary
    fontSize: 12, // Reduced from 16 to 14 (two sizes smaller)
    fontFamily: 'Inter', // typography.body.small.fontFamily
    flex: 1, // Take remaining space
  },
  submitButton: {
    // Primary button with gradient border effect
    backgroundColor: Colors.glass.purple, // glass-like transparent fill
    borderRadius: 28, // Fully rounded (height/2 = 56/2 = 28)
    paddingHorizontal: 24, // Horizontal padding only
    paddingVertical: 0, // Remove vertical padding to prevent cutoff
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24, // spacing.6
    height: 56, // layout.buttonHeight.medium
    borderWidth: 2,
    borderColor: Colors.glass.purpleTint, // purple.400 with opacity for gradient effect
    shadowColor: Colors.brand.primary, // purple.400
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8, // Android shadow
  },
  submitButtonDisabled: {
    backgroundColor: Colors.glass.backgroundSubtle, // glassInteractive.disabled.background
    borderColor: Colors.glass.backgroundSecondary, // glassInteractive.disabled.border
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: Colors.text.primary, // text.primary
    fontSize: 16, // Reduced from 18 to prevent cutoff
    fontWeight: '600', // typography.button.large.fontWeight
    marginLeft: 8, // spacing.2
    fontFamily: 'Inter', // typography.button.large.fontFamily
    letterSpacing: 0.005, // typography.button.large.letterSpacing
    textAlign: 'center',
    includeFontPadding: false, // Prevent extra padding that causes cutoff
  },
  cvStatusCard: {
    backgroundColor: Colors.glass.success, // semantic.success.light
    borderColor: Colors.glass.successBorder, // semantic.success.main with opacity
    borderWidth: 1,
    borderRadius: 12, // glassSecondary.borderRadius
    padding: 16, // spacing.4
    marginBottom: 24, // spacing.6
  },
  cvStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // spacing.2
  },
  cvStatusTitle: {
    color: Colors.semantic.success, // semantic.success.main
    fontWeight: '600', // typography.label.large.fontWeight
    fontSize: 16, // typography.label.large.fontSize
    marginLeft: 8, // spacing.2
    fontFamily: 'Inter', // typography.label.large.fontFamily
  },
  cvStatusDescription: {
    color: 'rgba(255, 255, 255, 0.85)', // text.secondary
    fontSize: 14, // typography.body.small.fontSize
    fontFamily: 'Inter', // typography.body.small.fontFamily
  },
  infoBox: {
    backgroundColor: Colors.glass.info, // semantic.info.light
    borderRadius: 12, // glassSecondary.borderRadius
    padding: 16, // spacing.4
    flexDirection: 'row',
    marginBottom: 24, // spacing.6
    borderWidth: 1,
    borderColor: Colors.glass.infoBorder, // semantic.info.main with opacity
  },
  infoText: {
    color: Colors.semantic.infoAlt, // semantic.info.main
    fontSize: 14, // typography.body.small.fontSize
    marginLeft: 12, // spacing.3
    flex: 1,
    lineHeight: 20, // typography.body.small.lineHeight
    fontFamily: 'Inter', // typography.body.small.fontFamily
  },
  sectionTitle: {
    color: '#FFFFFF', // text.primary
    fontSize: 18, // typography.heading.h4.fontSize
    fontWeight: '600', // typography.heading.h4.fontWeight
    marginBottom: 16, // spacing.4
    fontFamily: 'Inter', // typography.heading.h4.fontFamily
  },
  interviewTypeContainer: {
    flexDirection: 'column',
    gap: 12, // spacing.3
    marginBottom: 16, // spacing.4
  },
  interviewTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.10)', // glassInput.background
    borderRadius: 20, // borderRadius.lg
    paddingHorizontal: 16, // spacing.4
    paddingVertical: 14, // spacing.3.5
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // glassInput.border
    justifyContent: 'center',
  },
  interviewTypeButtonWide: {
    width: '100%',
  },
  interviewTypeButtonActive: {
    backgroundColor: 'rgba(252, 180, 0, 0.2)', // gold.400 with opacity
    borderColor: 'rgba(252, 180, 0, 0.4)', // gold.400 with opacity
  },
  interviewTypeText: {
    color: 'rgba(255, 255, 255, 0.70)', // text.tertiary
    marginLeft: 8, // spacing.2
    fontWeight: '600', // typography.label.medium.fontWeight
    fontSize: 14, // typography.label.medium.fontSize
    fontFamily: 'Inter', // typography.label.medium.fontFamily
  },
  interviewTypeTextActive: {
    color: '#FFFFFF', // text.primary
  },
  typeDescriptionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // glassSecondary.background with lower opacity
    borderRadius: 8, // borderRadius.default
    padding: 12, // spacing.3
  },
  typeDescription: {
    color: 'rgba(255, 255, 255, 0.85)', // text.secondary
    fontSize: 14, // typography.body.small.fontSize
    lineHeight: 20, // typography.body.small.lineHeight
    fontFamily: 'Inter', // typography.body.small.fontFamily
  },
  typeDescriptionBold: {
    fontWeight: 'bold',
    color: 'rgba(252, 180, 0, 1)', // gold.400
  },
  instructionText: {
    color: Colors.text.secondary, // text.secondary
    fontSize: 16, // typography.body.medium.fontSize
    lineHeight: 24, // typography.body.medium.lineHeight
    textAlign: 'left',
    fontFamily: 'Inter', // typography.body.medium.fontFamily
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24, // spacing.6
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.glass.border, // glass.border
  },
  orText: {
    color: Colors.text.tertiary, // text.tertiary
    fontSize: 14, // typography.body.small.fontSize
    marginHorizontal: 16, // spacing.4
    fontFamily: 'Inter', // typography.body.small.fontFamily
    fontWeight: '600',
  },
});