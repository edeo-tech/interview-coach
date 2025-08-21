import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StyleSheet, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../../components/ChatGPTBackground';
import CVUploadProgress from '../../../components/CVUploadProgress';
import * as DocumentPicker from 'expo-document-picker';
import { useCV, useUploadCV, useDeleteCV } from '../../../_queries/interviews/cv';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';

const CVUpload = () => {
  const { data: currentCV, isLoading: cvLoading } = useCV();
  const uploadMutation = useUploadCV();
  const deleteMutation = useDeleteCV();
  const [uploadProgress, setUploadProgress] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const { posthogScreen, posthogCapture } = usePosthogSafely();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('cv_upload');
    }, [posthogScreen])
  );

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Validate file size (max 5MB)
      if (file.size && file.size > 5 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select a file smaller than 5MB.');
        return;
      }

      setUploadProgress(true);
      setShowProgressModal(true);

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'application/pdf',
        name: file.name || 'cv.pdf',
      } as any);
      
      await uploadMutation.mutateAsync(formData);
      
      posthogCapture('cv_upload_success', {
        source: 'cv_upload_page',
        file_type: file.mimeType || 'unknown',
        file_size_kb: file.size ? Math.round(file.size / 1024) : null,
        is_replacement: !!currentCV
      });
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setShowProgressModal(false);
      posthogCapture('cv_upload_failed', {
        source: 'cv_upload_page',
        error_message: error.response?.data?.detail || error.message,
        file_type: file?.mimeType || 'unknown',
        is_replacement: !!currentCV
      });
      Alert.alert(
        'Upload Error', 
        error.response?.data?.detail || 'Failed to upload CV. Please try again.'
      );
    } finally {
      setUploadProgress(false);
    }
  };

  const handleProgressComplete = () => {
    setShowProgressModal(false);
    router.push('/cv-profile');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete CV',
      'Are you sure you want to delete your CV? This will remove it from all future interviews.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync();
              posthogCapture('cv_deleted', {
                source: 'cv_upload_page',
                had_skills_count: currentCV?.skills?.length || 0,
                had_experience_years: currentCV?.experience_years || 0
              });
              Alert.alert('Success', 'CV deleted successfully');
            } catch (error: any) {
              posthogCapture('cv_deletion_failed', {
                source: 'cv_upload_page',
                error_message: error.message
              });
              Alert.alert('Error', 'Failed to delete CV');
            }
          }
        }
      ]
    );
  };

  const formatSkills = (skills: string[]) => {
    if (skills.length <= 5) return skills.join(', ');
    return skills.slice(0, 5).join(', ') + ` +${skills.length - 5} more`;
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'document-text';
    if (mimeType.includes('word')) return 'document';
    return 'document-outline';
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload CV</Text>
        </View>

        <View style={styles.content}>
          {/* Current CV Status - Only show if CV exists */}
          {cvLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color="#F59E0B" />
              <Text style={styles.loadingText}>Loading CV information...</Text>
            </View>
          ) : currentCV ? (
            <View style={styles.cvCard}>
              <View style={styles.cvCardHeader}>
                <Text style={styles.cvCardTitle}>Current CV</Text>
                <View style={styles.activeStatus}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={styles.activeText}>Active</Text>
                </View>
              </View>
              
              <View style={styles.cvInfo}>
                <View style={styles.cvInfoItem}>
                  <Ionicons name="briefcase" size={16} color="#9ca3af" />
                  <Text style={styles.cvInfoText}>
                    {currentCV.experience_years} years experience
                  </Text>
                </View>
                
                <View style={styles.cvInfoItem}>
                  <Ionicons name="code" size={16} color="#9ca3af" />
                  <Text style={[styles.cvInfoText, styles.cvInfoTextWrap]}>
                    {currentCV.skills.length > 0 
                      ? formatSkills(currentCV.skills)
                      : 'Skills not specified'
                    }
                  </Text>
                </View>
                
                <View style={styles.cvInfoItem}>
                  <Ionicons name="calendar" size={16} color="#9ca3af" />
                  <Text style={styles.cvInfoText}>
                    Uploaded {new Date(currentCV.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleDelete}
                disabled={deleteMutation.isPending}
                style={styles.deleteButton}
              >
                <Ionicons name="trash" size={16} color="#ef4444" />
                <Text style={styles.deleteButtonText}>
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete CV'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Main Upload Area */}
          <View style={styles.uploadContainer}>
            <TouchableOpacity
              onPress={handleUpload}
              disabled={uploadProgress}
              style={[
                styles.uploadArea,
                uploadProgress && styles.uploadAreaDisabled
              ]}
            >
              <View style={styles.uploadIconContainer}>
                <Ionicons name="cloud-upload" size={64} color="#8b5cf6" />
              </View>
              
              <Text style={styles.uploadTitle}>
                {currentCV ? 'Replace your CV' : 'Upload your CV'}
              </Text>
              
              <Text style={styles.uploadSubtitle}>
                Get personalized interview questions based on your experience
              </Text>
              
              <View style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Choose file</Text>
              </View>
              
              <Text style={styles.formatHint}>
                PDF, DOC, DOCX, or TXT • Max 5MB
              </Text>
            </TouchableOpacity>
          </View>

          {/* Trust Indicators */}
          <View style={styles.trustIndicators}>
            <View style={styles.trustItem}>
              <Ionicons name="shield-checkmark" size={16} color="#10b981" />
              <Text style={styles.trustText}>Secure & Private</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="time" size={16} color="#8b5cf6" />
              <Text style={styles.trustText}>Processed in seconds</Text>
            </View>
          </View>
        </View>

        {/* Progress Modal */}
        <Modal
          visible={showProgressModal}
          transparent={true}
          animationType="fade"
          statusBarTranslucent={true}
        >
          <CVUploadProgress onComplete={handleProgressComplete} />
        </Modal>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  loadingCard: {
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    backdropFilter: 'blur(10px)',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 8,
    fontSize: 16,
  },
  cvCard: {
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    backdropFilter: 'blur(10px)',
  },
  cvCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cvCardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  activeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeText: {
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 8,
  },
  cvInfo: {
    gap: 16,
  },
  cvInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cvInfoText: {
    color: '#d1d5db',
    marginLeft: 12,
    fontSize: 15,
  },
  cvInfoTextWrap: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: 'rgba(153, 27, 27, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#ef4444',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 40,
  },
  uploadArea: {
    backgroundColor: 'rgba(55, 65, 81, 0.6)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    minHeight: 320,
    justifyContent: 'center',
  },
  uploadAreaDisabled: {
    opacity: 0.5,
  },
  uploadIconContainer: {
    marginBottom: 24,
  },
  uploadTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  uploadSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    maxWidth: 280,
  },
  uploadButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  formatHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    textAlign: 'center',
  },
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingTop: 20,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CVUpload;