import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Platform, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ChatGPTBackground from '../../../components/ChatGPTBackground';
import BrandfetchLogo from '../../../components/BrandfetchLogo';
import { useJobDetails, useStartJobInterviewAttempt } from '../../../_queries/jobs/jobs';
import { InterviewType } from '../../../_interfaces/interviews/interview-types';
import { JobInterview } from '../../../_interfaces/jobs/job';
import { GlassStyles, GlassTextColors } from '../../../constants/GlassStyles';
import { TYPOGRAPHY } from '../../../constants/Typography';

const getInterviewTypeDisplayName = (type: InterviewType | string): string => {
  const displayNames: Record<string, string> = {
    [InterviewType.PhoneScreen]: 'Phone Screen',
    [InterviewType.InitialHRInterview]: 'HR Interview',
    [InterviewType.MockSalesCall]: 'Sales Call',
    [InterviewType.PresentationPitch]: 'Presentation',
    [InterviewType.TechnicalScreeningCall]: 'Technical Screen',
    [InterviewType.SystemDesignInterview]: 'System Design',
    [InterviewType.PortfolioReview]: 'Portfolio Review',
    [InterviewType.CaseStudy]: 'Case Study',
    [InterviewType.BehavioralInterview]: 'Behavioral',
    [InterviewType.ValuesInterview]: 'Values Interview',
    [InterviewType.TeamFitInterview]: 'Team Fit',
    [InterviewType.InterviewWithBusinessPartnerClientStakeholder]: 'Stakeholder Interview',
    [InterviewType.ExecutiveLeadershipRound]: 'Executive Round',
  };
  return displayNames[type] || String(type);
};

const getInterviewTypeIcon = (type: InterviewType | string): string => {
  const iconMap: Record<string, string> = {
    [InterviewType.PhoneScreen]: 'call',
    [InterviewType.InitialHRInterview]: 'people',
    [InterviewType.MockSalesCall]: 'megaphone',
    [InterviewType.PresentationPitch]: 'easel',
    [InterviewType.TechnicalScreeningCall]: 'code',
    [InterviewType.SystemDesignInterview]: 'git-network',
    [InterviewType.PortfolioReview]: 'images',
    [InterviewType.CaseStudy]: 'document-text',
    [InterviewType.BehavioralInterview]: 'chatbubbles',
    [InterviewType.ValuesInterview]: 'heart',
    [InterviewType.TeamFitInterview]: 'people-circle',
    [InterviewType.InterviewWithBusinessPartnerClientStakeholder]: 'business',
    [InterviewType.ExecutiveLeadershipRound]: 'trending-up',
  };
  return iconMap[type] || 'chatbubble';
};

const getStatusColor = (status: string, isLocked: boolean = false): string => {
  if (isLocked) return '#4b5563'; // Muted gray for locked
  switch (status) {
    case 'completed': return '#10b981';
    case 'active': return '#3b82f6';
    case 'pending': return '#6b7280';
    default: return '#6b7280';
  }
};

const isStageUnlocked = (interviews: any[], currentIndex: number): boolean => {
  // First stage is always unlocked
  if (currentIndex === 0) return true;
  
  // Check if previous stage is completed
  const previousInterview = interviews[currentIndex - 1];
  return previousInterview && previousInterview.status === 'completed';
};

const isCurrentActiveStage = (interviews: any[], currentIndex: number): boolean => {
  // Must be unlocked and not completed
  const isUnlocked = isStageUnlocked(interviews, currentIndex);
  const interview = interviews[currentIndex];
  return isUnlocked && interview.status !== 'completed';
};

export default function JobDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: jobData, isLoading, error } = useJobDetails(id);
  const startAttempt = useStartJobInterviewAttempt();
  const [showLockedPopup, setShowLockedPopup] = useState(false);
  const [lockedStageInfo, setLockedStageInfo] = useState<{stageName: string, stageNumber: number} | null>(null);

  const handleInterviewPress = (interview: any, index: number) => {
    const isUnlocked = isStageUnlocked(interviews, index);
    if (isUnlocked) {
      // Success haptic for unlocked stages
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push(`/interviews/${interview._id}/details` as any);
    } else {
      // Warning haptic for locked stages
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      // Show popup for locked stage
      setLockedStageInfo({
        stageName: getInterviewTypeDisplayName(interview.interview_type),
        stageNumber: index + 1
      });
      setShowLockedPopup(true);
    }
  };

  const getPreviousStageName = (currentIndex: number): string => {
    if (currentIndex === 0) return '';
    const previousInterview = interviews[currentIndex - 1];
    return getInterviewTypeDisplayName(previousInterview.interview_type);
  };

  if (isLoading) {
    return (
      <ChatGPTBackground style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={styles.loadingText}>Loading job details...</Text>
          </View>
        </SafeAreaView>
      </ChatGPTBackground>
    );
  }

  if (error || !jobData) {
    return (
      <ChatGPTBackground style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color="#ef4444" />
            <Text style={styles.errorTitle}>Failed to load job</Text>
            <LinearGradient
              colors={["#A855F7", "#EC4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonOuter}
            >
              <TouchableOpacity onPress={() => router.back()} style={styles.primaryButtonInner} activeOpacity={0.9}>
                <Ionicons name="arrow-back" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Go Back</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </ChatGPTBackground>
    );
  }

  const { job, interviews } = jobData;
  const completedInterviews = interviews.filter(i => i.status === 'completed').length;
  const progress = completedInterviews / interviews.length;

  return (
    <ChatGPTBackground style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Job Details</Text>
          </View>

          {/* Job Info - No container for static content */}
          <View style={styles.jobHeader}>
            <BrandfetchLogo
              identifierType={job.brandfetch_identifier_type}
              identifierValue={job.brandfetch_identifier_value}
              fallbackUrl={job.company_logo_url}
              size={56}
              style={styles.companyLogoContainer}
              fallbackIconColor="#ffffff"
              fallbackIconName="briefcase-outline"
            />
            <View style={styles.jobHeaderText}>
              <Text style={styles.roleTitle}>{job.role_title}</Text>
              <Text style={styles.company}>Company: {job.company}</Text>
            </View>
          </View>
          
          <View style={styles.jobMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={GlassTextColors.muted} />
              <Text style={styles.metaText}>{job.location || 'Remote'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={16} color={GlassTextColors.muted} />
              <Text style={styles.metaText}>{job.experience_level}</Text>
            </View>
          </View>

          {/* Progress Overview */}
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${progress * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressSubtext}>
            {completedInterviews} of {interviews.length} interviews completed
          </Text>

          {/* Interview Stages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interview Stages</Text>
            
            <View style={styles.stagesContainer}>
              {interviews.map((interview, index) => {
                const isUnlocked = isStageUnlocked(interviews, index);
                const isActive = isCurrentActiveStage(interviews, index);
                const isCompleted = interview.status === 'completed';
                return (
                  <TouchableOpacity
                    key={interview._id}
                    onPress={() => handleInterviewPress(interview, index)}
                    style={[
                      styles.stageCard,
                      !isUnlocked && styles.stageCardLocked
                    ]}
                  >
                    <View style={[
                      styles.stageNumber,
                      isActive && styles.stageNumberActive,
                      isCompleted && styles.stageNumberCompleted
                    ]}>
                      <Text style={[
                        styles.stageNumberText,
                        isActive && styles.stageNumberTextActive,
                        isCompleted && styles.stageNumberTextCompleted
                      ]}>{index + 1}</Text>
                    </View>
                    
                    <View style={styles.stageContent}>
                      <View style={styles.stageHeader}>
                        <View style={styles.stageIconContainer}>
                          <Ionicons 
                            name={getInterviewTypeIcon(interview.interview_type) as any} 
                            size={20} 
                            color={getStatusColor(interview.status)} 
                          />
                        </View>
                        <Text style={styles.stageTitle}>
                          {getInterviewTypeDisplayName(interview.interview_type)}
                        </Text>
                      </View>
                      
                      {isUnlocked && interview.total_attempts > 0 && (
                        <Text style={styles.attemptsText}>
                          {interview.total_attempts} attempt{interview.total_attempts !== 1 ? 's' : ''}
                        </Text>
                      )}
                    </View>
                    
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={GlassTextColors.muted} 
                    />
                    
                    {/* Lock overlay for locked stages */}
                    {!isUnlocked && (
                      <View style={styles.lockOverlay}>
                        <Ionicons 
                          name="lock-closed" 
                          size={24} 
                          color="#ffffff" 
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Locked Stage Popup */}
      <Modal
        visible={showLockedPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLockedPopup(false)}
      >
        <View style={styles.popupBackdrop}>
          <TouchableOpacity 
            style={styles.popupBackdropTouchable}
            activeOpacity={1}
            onPress={() => setShowLockedPopup(false)}
          >
            <View style={styles.popupContainer}>
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <View style={styles.popupContent}>
                  {/* Lock Icon */}
                  <View style={styles.popupIconContainer}>
                    <Ionicons name="lock-closed" size={32} color="#A855F7" />
                  </View>
                  
                  {/* Title */}
                  <Text style={styles.popupTitle}>Stage Locked</Text>
                  
                  {/* Message */}
                  <Text style={styles.popupMessage}>
                    {lockedStageInfo ? (
                      `To unlock "${lockedStageInfo.stageName}" (Stage ${lockedStageInfo.stageNumber}), you need to complete the previous stage first.`
                    ) : (
                      'Complete the previous stage to unlock this interview step.'
                    )}
                  </Text>
                  
                  
                  {/* Close Button */}
                  <TouchableOpacity 
                    onPress={() => {
                      // Light haptic for dismissal
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowLockedPopup(false);
                    }}
                    style={styles.popupButton}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.popupButtonText}>Got it</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: '#9ca3af',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    ...TYPOGRAPHY.pageTitle,
    color: '#ffffff',
    marginTop: 16,
  },
  errorButton: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    ...TYPOGRAPHY.pageTitle,
    color: '#ffffff',
    marginLeft: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  companyLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginRight: 16,
    overflow: 'hidden',
  },
  jobHeaderText: {
    flex: 1,
  },
  roleTitle: {
    ...TYPOGRAPHY.pageTitle,
    color: '#ffffff',
    marginBottom: 4,
  },
  company: {
    ...TYPOGRAPHY.bodyMedium,
    color: GlassTextColors.secondary,
  },
  jobMeta: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...TYPOGRAPHY.bodySmall,
    color: '#d1d5db',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  progressTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: GlassTextColors.primary,
  },
  progressPercentage: {
    ...TYPOGRAPHY.labelLarge,
    fontWeight: '600' as const,
    color: '#10b981',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
    marginHorizontal: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressSubtext: {
    ...TYPOGRAPHY.bodyMedium,
    color: GlassTextColors.muted,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: GlassTextColors.primary,
    marginBottom: 16,
  },
  stagesContainer: {
    gap: 12,
  },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GlassStyles.container,
    borderRadius: 50,
    borderColor: 'rgba(255, 255, 255, 0.00)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    position: 'relative',
  },
  stageCardLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    opacity: 0.4,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  stageNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stageNumberActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)', // Opaque purple background
    borderWidth: 2,
    borderColor: '#A855F7', // Solid purple border
  },
  stageNumberCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)', // Opaque green background
    borderWidth: 2,
    borderColor: '#10b981', // Solid green border
  },
  stageNumberText: {
    ...TYPOGRAPHY.labelMedium,
    color: '#ffffff',
  },
  stageNumberTextActive: {
    color: '#ffffff',
    fontWeight: '600' as const,
  },
  stageNumberTextCompleted: {
    color: '#ffffff',
    fontWeight: '600' as const,
  },
  stageContent: {
    flex: 1,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageIconContainer: {
    marginRight: 8,
  },
  stageTitle: {
    ...TYPOGRAPHY.itemTitle,
    color: GlassTextColors.primary,
  },
  attemptsText: {
    ...TYPOGRAPHY.overline,
    color: '#6b7280',
    marginTop: 4,
  },
  primaryButtonOuter: {
    borderRadius: 28,
    padding: 2,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#A855F7',
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      }
    }),
  },
  primaryButtonInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 26,
    height: 52,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.buttonMedium,
    color: GlassTextColors.primary,
    marginHorizontal: 8,
  },
  // Popup Styles
  popupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupBackdropTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 340,
  },
  popupContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Solid dark background instead of glass
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    alignItems: 'center',
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      }
    }),
  },
  popupIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  popupTitle: {
    ...TYPOGRAPHY.pageTitle,
    color: GlassTextColors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  popupMessage: {
    ...TYPOGRAPHY.bodyMedium,
    color: GlassTextColors.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  popupButton: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderWidth: 2,
    borderColor: '#A855F7',
    borderRadius: 28,
    height: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  popupButtonText: {
    ...TYPOGRAPHY.buttonMedium,
    color: GlassTextColors.primary,
  },
});