import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useCreateInterviewFromURL, useCreateInterviewFromFile } from '../../../_queries/interviews/interviews';

export default function CreateInterview() {
  const [inputType, setInputType] = useState<'url' | 'file'>('url');
  const [jobUrl, setJobUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral' | 'leadership'>('technical');
  
  const createFromURL = useCreateInterviewFromURL();
  const createFromFile = useCreateInterviewFromFile();
  
  const isLoading = createFromURL.isPending || createFromFile.isPending;

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
        
        Alert.alert('Success', 'Interview created successfully!', [
          { text: 'OK', onPress: () => router.push(`/interviews/${result.data._id}/details` as any) }
        ]);
      } catch (error: any) {
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
        formData.append('interview_type', interviewType);

        const result = await createFromFile.mutateAsync(formData);
        
        Alert.alert('Success', 'Interview created successfully!', [
          { text: 'OK', onPress: () => router.push(`/interviews/${result.data._id}/details` as any) }
        ]);
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.detail || 'Failed to create interview from file');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Interview</Text>
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
            <Text style={styles.sectionTitle}>Job Posting URL</Text>
            <Text style={styles.sectionDescription}>
              Paste a link from LinkedIn, Indeed, or any company website
            </Text>
            <TextInput
              style={styles.urlInput}
              placeholder="https://www.linkedin.com/jobs/view/..."
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
            <Text style={styles.sectionTitle}>Job Description File</Text>
            <Text style={styles.sectionDescription}>
              Upload a PDF, Word, or text file containing the job description
            </Text>
            
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
                  <Text style={styles.uploadText}>Tap to select file</Text>
                  <Text style={styles.uploadFormats}>PDF, DOC, DOCX, or TXT</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Interview Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interview Type</Text>
          <View style={styles.typeContainer}>
            {(['technical', 'behavioral', 'leadership'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setInterviewType(type)}
                style={[styles.typeButton, interviewType === type && styles.typeButtonActive]}
              >
                <Ionicons
                  name={
                    type === 'technical' ? 'code-slash' :
                    type === 'behavioral' ? 'people' : 'trending-up'
                  }
                  size={20}
                  color={interviewType === type ? '#ffffff' : '#9ca3af'}
                />
                <Text style={[styles.typeText, interviewType === type && styles.typeTextActive]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
            <ActivityIndicator color="white" />
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
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
    backgroundColor: '#2563eb',
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
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 16,
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
  uploadFormats: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  typeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  typeText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#2563eb',
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
});