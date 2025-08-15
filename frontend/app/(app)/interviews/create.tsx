import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../../components/ChatGPTBackground';
import * as DocumentPicker from 'expo-document-picker';
import { useCreateInterviewFromURL, useCreateInterviewFromFile } from '../../../_queries/interviews/interviews';
import { useCV, useUploadCV } from '../../../_queries/interviews/cv';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';

type InterviewType = 'technical' | 'behavioral' | 'leadership' | 'sales';

export default function CreateInterview() {
  const [currentStep, setCurrentStep] = useState<'cv' | 'job'>('cv');
  const [inputType, setInputType] = useState<'url' | 'file'>('url');
  const [interviewType, setInterviewType] = useState<InterviewType>('technical');
  const [jobUrl, setJobUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [selectedCVFile, setSelectedCVFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  
  const { data: currentCV, isLoading: cvLoading } = useCV();
  const uploadCV = useUploadCV();
  const createFromURL = useCreateInterviewFromURL();
  const createFromFile = useCreateInterviewFromFile();
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  
  const isLoading = createFromURL.isPending || createFromFile.isPending || uploadCV.isPending;

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

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword', 
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select file');
    }
  };

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
    if (inputType === 'url') {
      if (!jobUrl.trim()) {
        Alert.alert('Error', 'Please enter a job posting URL');
        return;
      }

      // Basic URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(jobUrl)) {
        Alert.alert('Error', 'Please enter a valid URL');
        return;
      }

      try {
        const result = await createFromURL.mutateAsync({
          job_url: jobUrl,
          interview_type: interviewType,
        });
        
        posthogCapture('interview_created', {
          method: 'url',
          has_cv: !!currentCV,
          job_url_domain: new URL(jobUrl).hostname,
          interview_type: interviewType
        });
        
        console.log('Interview created from URL:', result.data);
        Alert.alert('Success', 'Interview created successfully!', [
          { text: 'OK', onPress: () => router.push(`/interviews/${result.data.id}/details` as any) }
        ]);
      } catch (error: any) {
        posthogCapture('interview_creation_failed', {
          method: 'url',
          error_message: error.response?.data?.detail || error.message,
          interview_type: interviewType
        });
        Alert.alert('Error', error.response?.data?.detail || 'Failed to create interview from URL');
      }
    } else {
      if (!selectedFile) {
        Alert.alert('Error', 'Please select a job description file');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType || 'application/octet-stream',
          name: selectedFile.name,
        } as any);

        const result = await createFromFile.mutateAsync(formData, interviewType);
        
        posthogCapture('interview_created', {
          method: 'file',
          has_cv: !!currentCV,
          file_type: selectedFile.mimeType || 'unknown',
          file_size_kb: selectedFile.size ? Math.round(selectedFile.size / 1024) : null,
          interview_type: interviewType
        });
        
        console.log('Interview created from file:', result.data);
        Alert.alert('Success', 'Interview created successfully!', [
          { text: 'OK', onPress: () => router.push(`/interviews/${result.data.id}/details` as any) }
        ]);
      } catch (error: any) {
        posthogCapture('interview_creation_failed', {
          method: 'file',
          error_message: error.response?.data?.detail || error.message,
          file_type: selectedFile.mimeType || 'unknown',
          interview_type: interviewType
        });
        Alert.alert('Error', error.response?.data?.detail || 'Failed to create interview from file');
      }
    }
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
            {/* CV Status Display */}
            {currentCV && (
              <View style={styles.cvStatusCard}>
                <View style={styles.cvStatusHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={styles.cvStatusTitle}>Your CV</Text>
                </View>
                <Text style={styles.cvStatusDescription}>
                  {currentCV.skills.length} skills • {currentCV.experience_years} years experience
                </Text>
              </View>
            )}

            {/* Interview Type Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interview Type</Text>
              <View style={styles.interviewTypeContainer}>
                <TouchableOpacity
                  onPress={() => setInterviewType('technical')}
                  style={[styles.interviewTypeButton, styles.interviewTypeButtonWide, interviewType === 'technical' && styles.interviewTypeButtonActive]}
                >
                  <Ionicons 
                    name="chatbubble-ellipses" 
                    size={20} 
                    color={interviewType === 'technical' ? '#ffffff' : '#9ca3af'} 
                  />
                  <Text style={[styles.interviewTypeText, interviewType === 'technical' && styles.interviewTypeTextActive]}>
                    Interview Screening Call
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setInterviewType('sales')}
                  style={[styles.interviewTypeButton, styles.interviewTypeButtonWide, interviewType === 'sales' && styles.interviewTypeButtonActive]}
                >
                  <Ionicons 
                    name="trending-up" 
                    size={20} 
                    color={interviewType === 'sales' ? '#ffffff' : '#9ca3af'} 
                  />
                  <Text style={[styles.interviewTypeText, interviewType === 'sales' && styles.interviewTypeTextActive]}>
                    Mock Sales Call
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Description based on interview type */}
              <View style={styles.typeDescriptionContainer}>
                {interviewType === 'technical' && (
                  <Text style={styles.typeDescription}>
                    Practice for your initial screening interview with technical, behavioral, and leadership questions tailored to your role
                  </Text>
                )}
                {interviewType === 'sales' && (
                  <Text style={styles.typeDescription}>
                    🎯 <Text style={styles.typeDescriptionBold}>Mock sales call simulation</Text> - You'll act as the salesperson pitching to a prospect. Practice discovery, objection handling, and closing techniques.
                  </Text>
                )}
              </View>
            </View>

            {/* Input Type Selector */}
        <View style={styles.inputTypeContainer}>
          <TouchableOpacity
            onPress={() => setInputType('url')}
            style={[styles.inputTypeButton, inputType === 'url' && styles.inputTypeButtonActive]}
          >
            <Ionicons 
              name="link" 
              size={20} 
              color={inputType === 'url' ? '#ffffff' : '#9ca3af'} 
            />
            <Text style={[styles.inputTypeText, inputType === 'url' && styles.inputTypeTextActive]}>
              Job URL
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setInputType('file')}
            style={[styles.inputTypeButton, inputType === 'file' && styles.inputTypeButtonActive]}
          >
            <Ionicons 
              name="document-text" 
              size={20} 
              color={inputType === 'file' ? '#ffffff' : '#9ca3af'} 
            />
            <Text style={[styles.inputTypeText, inputType === 'file' && styles.inputTypeTextActive]}>
              Upload File
            </Text>
          </TouchableOpacity>
        </View>

        {/* URL Input */}
        {inputType === 'url' && (
          <View style={styles.section}>
            <TextInput
              style={styles.urlInput}
              placeholder="Paste job posting URL (LinkedIn, Indeed, etc.)"
              placeholderTextColor="#6b7280"
              value={jobUrl}
              onChangeText={setJobUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        {/* File Upload */}
        {inputType === 'file' && (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={handleFileSelect}
              style={styles.fileButton}
            >
              {selectedFile ? (
                <View style={styles.selectedFileContainer}>
                  <Ionicons name="document-attach" size={24} color="#10b981" />
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{selectedFile.name}</Text>
                    <Text style={styles.fileSize}>
                      {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Size unknown'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedFile(null)}>
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadPrompt}>
                  <Ionicons name="cloud-upload" size={32} color="#9ca3af" />
                  <Text style={styles.uploadText}>Select job description file</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}


            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading || (inputType === 'url' ? !jobUrl.trim() : !selectedFile)}
              style={[
                styles.submitButton,
                (isLoading || (inputType === 'url' ? !jobUrl.trim() : !selectedFile)) && styles.submitButtonDisabled
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

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#60a5fa" />
              <Text style={styles.infoText}>
                Our AI will analyze the job posting and create a personalized mock interview based on the role requirements and your CV.
              </Text>
            </View>
          </>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
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
});