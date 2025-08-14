import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../../components/ChatGPTBackground';
import * as DocumentPicker from 'expo-document-picker';
import { useCV, useUploadCV, useDeleteCV } from '../../../_queries/interviews/cv';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';

const CVUpload = () => {
  const { data: currentCV, isLoading: cvLoading } = useCV();
  const uploadMutation = useUploadCV();
  const deleteMutation = useDeleteCV();
  const [uploadProgress, setUploadProgress] = useState(false);
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
      
      Alert.alert(
        'Success!', 
        'Your CV has been uploaded and processed successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      
    } catch (error: any) {
      console.error('Upload error:', error);
      posthogCapture('cv_upload_failed', {
        source: 'cv_upload_page',
        error_message: error.response?.data?.detail || error.message,
        file_type: file.mimeType || 'unknown',
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
      <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CV Management</Text>
        </View>

        {/* Current CV Status */}
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
        ) : (
          <View style={styles.noCvCard}>
            <Ionicons name="document-outline" size={48} color="#6b7280" />
            <Text style={styles.noCvTitle}>No CV Uploaded</Text>
            <Text style={styles.noCvSubtitle}>
              Upload your CV to get personalized interview questions
            </Text>
          </View>
        )}

        {/* Upload Section */}
        <View style={styles.uploadCard}>
          <Text style={styles.uploadTitle}>
            {currentCV ? 'Replace CV' : 'Upload CV'}
          </Text>
          
          <TouchableOpacity
            onPress={handleUpload}
            disabled={uploadMutation.isPending || uploadProgress}
            style={[
              styles.uploadArea,
              (uploadMutation.isPending || uploadProgress) && styles.uploadAreaDisabled
            ]}
          >
            {uploadMutation.isPending || uploadProgress ? (
              <ActivityIndicator size="large" color="#F59E0B" />
            ) : (
              <Ionicons name="cloud-upload" size={48} color="#F59E0B" />
            )}
            
            <Text style={styles.uploadText}>
              {uploadMutation.isPending || uploadProgress 
                ? 'Processing CV...' 
                : 'Choose file to upload'
              }
            </Text>
            
            <Text style={styles.uploadSubtext}>
              PDF, DOC, DOCX, or TXT files (max 5MB)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Supported Formats */}
        <View style={styles.formatsCard}>
          <Text style={styles.formatsTitle}>Supported Formats</Text>
          <View style={styles.formatsList}>
            {[
              { type: 'PDF', desc: 'Portable Document Format', icon: 'document-text' },
              { type: 'DOC/DOCX', desc: 'Microsoft Word Document', icon: 'document' },
              { type: 'TXT', desc: 'Plain Text File', icon: 'document-outline' }
            ].map((format) => (
              <View key={format.type} style={styles.formatItem}>
                <Ionicons name={format.icon as any} size={20} color="#9ca3af" />
                <View style={styles.formatInfo}>
                  <Text style={styles.formatType}>{format.type}</Text>
                  <Text style={styles.formatDesc}>{format.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips for best results</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipText}>• Use a well-formatted, recent CV</Text>
            <Text style={styles.tipText}>• Include specific skills and technologies</Text>
            <Text style={styles.tipText}>• List your work experience clearly</Text>
            <Text style={styles.tipText}>• Avoid images or complex formatting</Text>
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <Ionicons name="shield-checkmark" size={16} color="#10b981" />
            <Text style={styles.privacyTitle}>Privacy Protected</Text>
          </View>
          <Text style={styles.privacyText}>
            Your CV is processed securely and used only to personalize your interview experience. 
            We don't share your information with third parties.
          </Text>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 8,
  },
  cvCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  cvCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    gap: 12,
  },
  cvInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cvInfoText: {
    color: '#d1d5db',
    marginLeft: 8,
  },
  cvInfoTextWrap: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: 'rgba(153, 27, 27, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#ef4444',
    marginLeft: 8,
    fontWeight: '600',
  },
  noCvCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  noCvTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  noCvSubtitle: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  uploadCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  uploadTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4b5563',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
  },
  uploadAreaDisabled: {
    opacity: 0.5,
  },
  uploadText: {
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  uploadSubtext: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  formatsCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  formatsTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  formatsList: {
    gap: 12,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatInfo: {
    marginLeft: 12,
    flex: 1,
  },
  formatType: {
    color: '#ffffff',
    fontWeight: '600',
  },
  formatDesc: {
    color: '#9ca3af',
    fontSize: 14,
  },
  tipsCard: {
    backgroundColor: 'rgba(30, 64, 175, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    color: '#60a5fa',
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsList: {
    gap: 4,
  },
  tipText: {
    color: '#bfdbfe',
    fontSize: 14,
  },
  privacyCard: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  privacyTitle: {
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 8,
  },
  privacyText: {
    color: '#d1d5db',
    fontSize: 14,
  },
});

export default CVUpload;