import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ChatGPTBackground from '../../../../../components/ChatGPTBackground';
import BrandfetchLogo from '../../../../../components/BrandfetchLogo';
import { useJobDetails, useStartJobInterviewAttempt } from '../../../../../_queries/jobs/jobs';
import { InterviewType } from '../../../../../_interfaces/interviews/interview-types';
import { JobInterview } from '../../../../../_interfaces/jobs/job';
import { GlassStyles, GlassTextColors } from '../../../../../constants/GlassStyles';
import { TYPOGRAPHY } from '../../../../../constants/Typography';
import Colors from '../../../../../constants/Colors';

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

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return Colors.semantic.successAlt;
    case 'active': return Colors.accent.blueAlt;
    case 'pending': return Colors.gray[500];
    default: return Colors.gray[500];
  }
};

const isCurrentActiveStage = (interview: any): boolean => {
  // Active if not completed
  return interview.status !== 'completed' && interview.best_score < 90;
};

export default function JobDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: jobData, isLoading, error } = useJobDetails(id);
  const startAttempt = useStartJobInterviewAttempt();

  const handleInterviewPress = (interview: any, index: number) => {
    const isUnlocked = isStageUnlocked(interviews, index);
    if (isUnlocked) {
      // Success haptic for unlocked stages
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push(`/home/interviews/${interview._id}/details` as any);
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


  if (isLoading) {
    return (
      <ChatGPTBackground style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.brand.primary} />
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
            <Ionicons name="alert-circle" size={64} color={Colors.semantic.error} />
            <Text style={styles.errorTitle}>Failed to load job</Text>
            <LinearGradient
              colors={[Colors.brand.primary, Colors.special.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonOuter}
            >
              <TouchableOpacity onPress={() => router.back()} style={styles.primaryButtonInner} activeOpacity={0.9}>
                <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
                <Text style={styles.primaryButtonText}>Go Back</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.text.primary} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </ChatGPTBackground>
    );
  }

  const { job, interviews } = jobData;
  const completedInterviews = interviews.filter(i => 
    i.status === 'completed' || i.best_score >= 90
  ).length;
  const progress = completedInterviews / interviews.length;

  return (
    <ChatGPTBackground style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}>
              <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
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
              fallbackIconColor={Colors.text.primary}
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
                const isActive = isCurrentActiveStage(interview);
                const isCompleted = interview.status === 'completed';
                return (
                  <TouchableOpacity
                    key={interview._id}
                    onPress={() => handleInterviewPress(interview)}
                    style={styles.stageCard}
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
                      
                      {interview.total_attempts > 0 && (
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
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
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
    backgroundColor: Colors.background.transparent,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding to account for tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.gray[400],
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
    color: Colors.text.primary,
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
    color: Colors.text.primary,
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
    backgroundColor: Colors.text.primary,
    marginRight: 16,
    overflow: 'hidden',
  },
  jobHeaderText: {
    flex: 1,
  },
  roleTitle: {
    ...TYPOGRAPHY.pageTitle,
    color: Colors.text.primary,
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
    color: Colors.gray[300],
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
    color: Colors.semantic.successAlt,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.glass.backgroundInput,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
    marginHorizontal: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.semantic.successAlt,
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
    borderColor: Colors.background.transparent,
    paddingVertical: 14,
    paddingHorizontal: 16,
    position: 'relative',
  },
  stageNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.glass.backgroundInput,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stageNumberActive: {
    backgroundColor: Colors.glass.purpleMedium, // Opaque purple background
    borderWidth: 2,
    borderColor: Colors.brand.primary, // Solid purple border
  },
  stageNumberCompleted: {
    backgroundColor: Colors.glass.successAlt, // Opaque green background
    borderWidth: 2,
    borderColor: Colors.semantic.successAlt, // Solid green border
  },
  stageNumberText: {
    ...TYPOGRAPHY.labelMedium,
    color: Colors.text.primary,
  },
  stageNumberTextActive: {
    color: Colors.text.primary,
    fontWeight: '600' as const,
  },
  stageNumberTextCompleted: {
    color: Colors.text.primary,
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
    color: Colors.gray[500],
    marginTop: 4,
  },
  primaryButtonOuter: {
    borderRadius: 28,
    padding: 2,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: Colors.brand.primary,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      }
    }),
  },
  primaryButtonInner: {
    backgroundColor: Colors.glass.backgroundSubtle,
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
});