import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Platform, Image, ActivityIndicator, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useInterviews } from '../../../_queries/interviews/interviews';
import { useCV, useUploadCV } from '../../../_queries/interviews/cv';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';
import ChatGPTBackground from '../../../components/ChatGPTBackground';
import { GlassStyles } from '../../../constants/GlassStyles';
import CVUploadProgress from '../../../components/CVUploadProgress';

export default function Home() {
  const { data: cv } = useCV();
  const { data: interviews, isLoading: interviewsLoading } = useInterviews(!!cv);
  const uploadMutation = useUploadCV();
  const insets = useSafeAreaInsets();
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  
  const [uploadProgress, setUploadProgress] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('home');
    }, [posthogScreen])
  );

  const handleCreateNewInterview = () => {
    posthogCapture('navigate_to_create_interview', {
      source: 'home',
      has_cv: !!cv,
      total_existing_interviews: interviews?.length || 0
    });
    router.push('/interviews/create');
  };

  const handleInterviewPress = (interviewId: string) => {
    posthogCapture('view_interview_details', {
      source: 'home',
      interview_id: interviewId
    });
    router.push(`/interviews/${interviewId}/details` as any);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'junior': return '#10b981';
      case 'mid': return '#f59e0b';
      case 'senior': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'technical': return 'code';
      case 'behavioral': return 'people';
      case 'leadership': return 'trending-up';
      default: return 'chatbubble';
    }
  };

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
        source: 'home_embedded',
        file_type: file.mimeType || 'unknown',
        file_size_kb: file.size ? Math.round(file.size / 1024) : null,
        is_first_upload: true
      });
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setShowProgressModal(false);
      posthogCapture('cv_upload_failed', {
        source: 'home_embedded',
        error_message: error.response?.data?.detail || error.message,
        file_type: file?.mimeType || 'unknown'
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
    // Navigate directly to interview creation - seamless onboarding flow
    posthogCapture('cv_upload_onboarding_complete', {
      source: 'home_embedded'
    });
    
    // Navigate immediately, then close modal to prevent flash
    router.push('/interviews/create');
    
    // Delay modal close to prevent brief home screen flash
    setTimeout(() => {
      setShowProgressModal(false);
    }, 100);
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
          gap: 16,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Your interviews</Text>
            <Text style={styles.headerSubtitle}>
              Practice with AI-powered mock interviews
            </Text>
          </View>
        </View>

        {/* Quick Action: Create New Interview (only show when user has existing interviews) */}
        {interviews && interviews.length > 0 && (
          <TouchableOpacity onPress={handleCreateNewInterview} style={styles.createCard}>
            <View style={styles.createCardLeft}>
              <Ionicons name="add" size={24} color="#ffffff" />
            </View>
            <View style={styles.createCardRight}>
              <Text style={styles.createCardTitle}>Create new interview</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* CV Upload - Embedded for seamless onboarding */}
        {!cv && (
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
                <Ionicons name="cloud-upload" size={48} color="#8b5cf6" />
              </View>
              
              <Text style={styles.uploadTitle}>
                Upload your CV to get started
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
            
            {/* Trust Indicators */}
            <View style={styles.trustIndicators}>
              <View style={styles.trustItem}>
                <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                <Text style={styles.trustText}>Secure & Private</Text>
              </View>
              <View style={styles.trustItem}>
                <Ionicons name="time" size={14} color="#8b5cf6" />
                <Text style={styles.trustText}>Processed in seconds</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Interviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recent Interviews
          </Text>
          
          {!cv || interviewsLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={48} color="#6b7280" />
              <Text style={styles.emptyStateTitle}>
                No interviews yet
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {!cv ? 'Upload your CV first, then tap the + button above to create your first interview' : 'Loading your interviews...'}
              </Text>
            </View>
          ) : !interviews || interviews.length === 0 ? (
            <View style={styles.enhancedEmptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="rocket-outline" size={52} color="#8b5cf6" />
              </View>
              <Text style={styles.emptyStateTitle}>
                Ready to practice?
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                Create your first mock interview to start improving your skills
              </Text>
              <View style={styles.ctaContainer}>
                <View style={styles.ctaArrow}>
                  <Ionicons name="arrow-up" size={20} color="#8b5cf6" />
                </View>
                <Text style={styles.ctaText}>
                  Tap the + button above to get started
                </Text>
              </View>
            </View>
          ) : (
            interviews.map((interview) => (
              <TouchableOpacity
                key={interview.id}
                onPress={() => handleInterviewPress(interview.id)}
                style={styles.interviewCard}
              >
                                 <View style={styles.interviewCardContent}>
                   <View style={styles.cardLeftAccent}>
                     {interview.company_logo_url ? (
                       <Image 
                         source={{ uri: interview.company_logo_url }}
                         style={styles.companyLogo}
                         onError={() => {
                           // Fallback handled by conditional rendering
                         }}
                       />
                     ) : (
                       <Ionicons 
                         name={getInterviewTypeIcon(interview.interview_type) as any}
                         size={28} 
                         color="#ffffff" 
                       />
                     )}
                   </View>
                   
                   <View style={styles.interviewCardMain}>
                     <Text style={styles.interviewTitle}>
                       {interview.role_title}
                     </Text>
                     
                                           <View style={styles.interviewCompany}>
                        <Ionicons name="business-outline" size={14} color="#6b7280" style={{flexShrink: 0}} />
                        <Text style={styles.companyText} numberOfLines={1}>
                          {interview.company.length > 30 ? interview.company.substring(0, 30) + '...' : interview.company}
                        </Text>
                      </View>
                      
                      <View style={styles.interviewLocation}>
                        <Ionicons name="location-outline" size={14} color="#6b7280" style={{flexShrink: 0}} />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {(interview.location || 'Remote').length > 40 ? (interview.location || 'Remote').substring(0, 40) + '...' : (interview.location || 'Remote')}
                        </Text>
                      </View>
                     
                     <View style={styles.interviewBottomRow}>
                       <Text style={[styles.difficultyText, { color: getDifficultyColor(interview.difficulty) }]}>
                         {interview.experience_level || interview.difficulty}
                       </Text>
                       <Text style={styles.interviewDate}>
                         {formatDate(interview.created_at)}
                       </Text>
                     </View>
                   </View>
                 </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

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
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerText: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerSubtitle: {
    color: '#9ca3af',
    fontSize: 15,
    lineHeight: 20,
  },
  statusCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    ...GlassStyles.card,
  },
  createCardLeft: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...GlassStyles.interactive,
  },
  createCardRight: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  createCardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 4,
  },
  enhancedEmptyState: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    marginTop: 4,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  ctaArrow: {
    marginRight: 8,
  },
  ctaText: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateText: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: '80%',
  },
  emptyStateTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  interviewCard: {
    ...GlassStyles.card,
    borderRadius: 12,
    marginBottom: 10,
  },
  interviewCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 20,
    paddingHorizontal: 16,
    minHeight: 80,
    gap: 16,
  },
  cardLeftAccent: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  interviewCardMain: {
    flex: 1,
    minWidth: 0, // Ensures text truncation works properly
  },
  interviewTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    flexShrink: 1,
    marginBottom: 8,
  },
  interviewCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
    marginBottom: 6,
  },
  companyText: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginLeft: 4,
    flexShrink: 1,
  },
  interviewLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
    marginBottom: 8,
  },
  locationText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginLeft: 4,
    flexShrink: 1,
  },
  interviewBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
    flexShrink: 0,
  },
  metaSeparator: {
    color: '#6b7280',
    fontSize: 14,
    marginHorizontal: 4,
    lineHeight: 18,
    flexShrink: 0,
  },
  interviewType: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'capitalize',
    flexShrink: 1,
  },
  interviewCardRight: {
    flexShrink: 0,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  interviewDate: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
  },

  // Embedded CV Upload Styles
  uploadContainer: {
    marginBottom: 32,
  },
  uploadArea: {
    backgroundColor: 'rgba(55, 65, 81, 0.6)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadAreaDisabled: {
    opacity: 0.5,
  },
  uploadIconContainer: {
    marginBottom: 16,
  },
  uploadTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    maxWidth: 250,
  },
  uploadButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  formatHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },

});

