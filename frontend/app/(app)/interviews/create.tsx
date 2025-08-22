import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Animated, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../../components/ChatGPTBackground';
import JobLinkProgress from '../../../components/JobLinkProgress';
import * as DocumentPicker from 'expo-document-picker';
import { useCreateInterviewFromURL } from '../../../_queries/interviews/interviews';
import { useCV, useUploadCV } from '../../../_queries/interviews/cv';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';
import { extractUrlFromText, cleanJobUrl } from '../../../utils/url/extractUrl';

type InterviewType = 'technical' | 'behavioral' | 'leadership' | 'sales';

export default function CreateInterview() {
  const [currentStep, setCurrentStep] = useState<'cv' | 'job'>('cv');
  const [interviewType, setInterviewType] = useState<InterviewType>('technical');
  const [jobUrl, setJobUrl] = useState('');
  const [selectedCVFile, setSelectedCVFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const jobUrlInputRef = useRef<TextInput>(null);
  const keyboardAnimValue = useRef(new Animated.Value(0)).current;
  
  const { data: currentCV, isLoading: cvLoading } = useCV();
  const uploadCV = useUploadCV();
  const createFromURL = useCreateInterviewFromURL();
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  
  const isLoading = createFromURL.isPending || uploadCV.isPending;

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
      Alert.alert('Error', 'Failed to select CV file');
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
      Alert.alert('Success!', 'Your CV has been uploaded successfully.', [
        { text: 'Continue', onPress: () => setCurrentStep('job') }
      ]);
      
    } catch (error: any) {
      posthogCapture('cv_upload_failed', {
        source: 'create_interview',
        error_message: error.response?.data?.detail || error.message,
        file_type: selectedCVFile.mimeType || 'unknown'
      });
      Alert.alert(
        'Upload Error', 
        error.response?.data?.detail || 'Failed to upload CV. Please try again.'
      );
    }
  };

  const handleSubmit = async () => {
    if (!jobUrl.trim()) {
      Alert.alert('Error', 'Please enter a job posting URL');
      return;
    }

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
        interview_type: interviewType,
      });
      
      posthogCapture('interview_created', {
        method: 'url',
        has_cv: !!currentCV,
        job_url_domain: new URL(cleanedUrl).hostname,
        interview_type: interviewType
      });
      
      console.log('Interview created from URL:', result.data);
      
      // Store the result for navigation after progress completes
      (window as any).pendingInterviewResult = result.data;
      
    } catch (error: any) {
      // Hide progress modal on error
      setShowProgressModal(false);
      
      posthogCapture('interview_creation_failed', {
        method: 'url',
        error_message: error.response?.data?.detail || error.message,
        interview_type: interviewType
      });
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create interview from URL');
    }
  };

  const handleProgressComplete = () => {
    // Navigate to the interview details page
    const result = (window as any).pendingInterviewResult;
    if (result) {
      router.push(`/interviews/${result.id}/details` as any);
      // Clean up the stored result
      delete (window as any).pendingInterviewResult;
    } else {
      // Fallback: navigate back to home
      router.push('/home');
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
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentStep === 'cv' ? 'Upload Your CV' : 
             currentCV ? 'Job Details' : 'Create New Interview'}
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
                    <Ionicons name="document-attach" size={24} color="#10b981" />
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName}>{selectedCVFile.name}</Text>
                      <Text style={styles.fileSize}>
                        {selectedCVFile.size ? `${(selectedCVFile.size / 1024).toFixed(1)} KB` : 'Size unknown'}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedCVFile(null)}>
                      <Ionicons name="close-circle" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadPrompt}>
                    <Ionicons name="cloud-upload" size={32} color="#9ca3af" />
                    <Text style={styles.uploadText}>Select your CV (PDF, DOC, DOCX, TXT)</Text>
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
                <ActivityIndicator color="#F59E0B" />
              ) : (
                <>
                  <Ionicons name="arrow-forward" size={24} color="white" />
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
                Please provide the URL link to the job you're interviewing for. This will help us create a tailored interview experience.
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
                placeholderTextColor="#6b7280"
                value={jobUrl}
                onChangeText={(text) => {
                  // Extract URL from pasted text (handles LinkedIn shares, etc.)
                  const extractedUrl = extractUrlFromText(text);
                  setJobUrl(extractedUrl);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardAppearance="dark"
                editable={showKeyboard}
              />
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
                disabled={isLoading || !jobUrl.trim() || !showKeyboard}
                style={[
                  styles.submitButton,
                  (isLoading || !jobUrl.trim() || !showKeyboard) && styles.submitButtonDisabled
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#F59E0B" />
                ) : (
                  <>
                    <Ionicons name="add-circle" size={24} color="white" />
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
        <JobLinkProgress onComplete={handleProgressComplete} />
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
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    paddingBottom: 100, // Extra space at bottom for keyboard
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  inputTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  inputTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  inputTypeButtonActive: {
    backgroundColor: '#F59E0B',
  },
  inputTypeText: {
    color: '#9ca3af',
    marginLeft: 8,
    fontWeight: '600',
  },
  inputTypeTextActive: {
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  urlInput: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  fileButton: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  fileSize: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 2,
  },
  uploadPrompt: {
    alignItems: 'center',
  },
  uploadText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#374151',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  cvStatusCard: {
    backgroundColor: 'rgba(5, 46, 22, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.25)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  cvStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cvStatusTitle: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  cvStatusDescription: {
    color: '#d1d5db',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  infoText: {
    color: '#93c5fd',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  interviewTypeContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  interviewTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
  },
  interviewTypeButtonWide: {
    width: '100%',
  },
  interviewTypeButtonActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  interviewTypeText: {
    color: '#9ca3af',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  interviewTypeTextActive: {
    color: '#ffffff',
  },
  typeDescriptionContainer: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    padding: 12,
  },
  typeDescription: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
  typeDescriptionBold: {
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  instructionText: {
    color: '#d1d5db',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
  },
});