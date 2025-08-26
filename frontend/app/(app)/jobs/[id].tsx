import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Platform } from 'react-native';
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

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return '#10b981';
    case 'active': return '#3b82f6';
    case 'pending': return '#6b7280';
    default: return '#6b7280';
  }
};

export default function JobDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: jobData, isLoading, error } = useJobDetails(id);
  const startAttempt = useStartJobInterviewAttempt();

  const handleInterviewPress = (interview: any) => {
    // Always navigate to interview details screen
    router.push(`/interviews/${interview._id}/details` as any);
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
            <TouchableOpacity onPress={() => router.back()}>
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
              <Text style={styles.company}>{job.company}</Text>
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

          {/* Progress Overview - In its own container */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Interview Progress</Text>
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
          </View>

          {/* Interview Stages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interview Stages</Text>
            
            <View style={styles.stagesContainer}>
              {interviews.map((interview, index) => (
                <TouchableOpacity
                  key={interview._id}
                  onPress={() => handleInterviewPress(interview)}
                  style={styles.stageCard}
                >
                  <View style={styles.stageNumber}>
                    <Text style={styles.stageNumberText}>{index + 1}</Text>
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
                    
                    <View style={styles.stageMeta}>
                      <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(interview.status)}20` }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(interview.status) }]}>
                          {interview.status}
                        </Text>
                      </View>
                      <Text style={styles.difficultyText}>
                        {interview.difficulty} difficulty
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
              ))}
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
  progressContainer: {
    ...GlassStyles.card,
    padding: 20,
    marginBottom: 24,
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
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 4,
  },
  company: {
    ...TYPOGRAPHY.bodyLarge,
    color: '#60a5fa',
  },
  jobMeta: {
    flexDirection: 'row',
    gap: 20,
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
  },
  progressTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: GlassTextColors.primary,
  },
  progressPercentage: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700' as const,
    color: '#10b981',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressSubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: GlassTextColors.muted,
    marginTop: 8,
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
    borderRadius: 12,
    padding: 16,
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
  stageNumberText: {
    ...TYPOGRAPHY.labelMedium,
    color: '#ffffff',
  },
  stageContent: {
    flex: 1,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageIconContainer: {
    marginRight: 8,
  },
  stageTitle: {
    ...TYPOGRAPHY.itemTitle,
    color: GlassTextColors.primary,
  },
  stageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    ...TYPOGRAPHY.overline,
    textTransform: 'uppercase',
  },
  difficultyText: {
    ...TYPOGRAPHY.caption,
    color: GlassTextColors.muted,
    textTransform: 'capitalize',
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
});