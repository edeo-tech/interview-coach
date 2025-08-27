import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInterviews } from '../../../_queries/interviews/interviews';
import { useCV } from '../../../_queries/interviews/cv';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';
import ChatGPTBackground from '../../../components/ChatGPTBackground';
import Colors from '../../../constants/Colors';
import { TYPOGRAPHY } from '../../../constants/Typography';

const InterviewsHome = () => {
  const { data: interviews, isLoading: interviewsLoading } = useInterviews(); // No limit for full interviews list
  const { data: cv } = useCV();
  const { posthogScreen } = usePosthogSafely();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('interviews_list');
    }, [posthogScreen])
  );

  const handleStartNewInterview = () => {
    if (!cv) {
      Alert.alert(
        'CV Required',
        'Please upload your CV first to create interview sessions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upload CV', onPress: () => router.push('/interviews/cv-upload') }
        ]
      );
      return;
    }
    
    router.push('/interviews/setup');
  };

  const handleInterviewPress = (interviewId: string) => {
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
      case 'junior': return Colors.semantic.success;
      case 'mid': return Colors.accent.goldAlt;
      case 'senior': return Colors.semantic.error;
      default: return Colors.text.muted;
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

  return (
    <ChatGPTBackground style={{flex: 1}}>
      <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Interviews</Text>
            <Text style={styles.headerSubtitle}>
              Practice with AI-powered mock interviews
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => router.push('/interviews/cv-upload')}
            style={styles.cvButton}
          >
            <Ionicons name="document-text" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* CV Status */}
        {!cv && (
          <View style={styles.cvWarningCard}>
            <View style={styles.cvWarningHeader}>
              <Ionicons name="warning" size={20} color={Colors.accent.goldAlt} />
              <Text style={styles.cvWarningTitle}>CV Required</Text>
            </View>
            <Text style={styles.cvWarningText}>
              Upload your CV to get personalized interview questions and feedback.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/interviews/cv-upload')}
              style={styles.cvWarningButton}
            >
              <Text style={styles.cvWarningButtonText}>Upload CV →</Text>
            </TouchableOpacity>
          </View>
        )}

        {cv && (
          <View style={styles.cvSuccessCard}>
            <View style={styles.cvSuccessHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.semantic.success} />
              <Text style={styles.cvSuccessTitle}>Your CV</Text>
            </View>
            <Text style={styles.cvSuccessText}>
              {cv.skills.length} skills • {cv.experience_years} years experience
            </Text>
          </View>
        )}

        {/* New Interview Button */}
        <TouchableOpacity
          onPress={handleStartNewInterview}
          style={styles.newInterviewButton}
        >
          <Ionicons name="add-circle" size={24} color={Colors.text.primary} />
          <Text style={styles.newInterviewButtonText}>
            Start New Interview
          </Text>
        </TouchableOpacity>

        {/* Recent Interviews */}
        <View style={styles.interviewsSection}>
          <Text style={styles.sectionTitle}>
            Recent Interviews
          </Text>
          
          {interviewsLoading ? (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading interviews...</Text>
            </View>
          ) : !interviews || interviews.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="chatbubble-outline" size={48} color={Colors.text.muted} />
              <Text style={styles.emptyTitle}>
                No interviews yet
              </Text>
              <Text style={styles.emptyText}>
                Start your first mock interview to begin practicing
              </Text>
            </View>
          ) : (
            interviews.map((interview) => (
              <TouchableOpacity
                key={interview.id}
                onPress={() => handleInterviewPress(interview.id)}
                style={styles.interviewCard}
              >
                <View style={styles.interviewCardContent}>
                  <View style={styles.interviewCardLeft}>
                    {interview.company_logo_url ? (
                      <Image 
                        source={{ uri: interview.company_logo_url }}
                        style={styles.companyLogo}
                      />
                    ) : (
                      <View style={styles.logoPlaceholder}>
                        <Ionicons 
                          name={getInterviewTypeIcon(interview.interview_type) as any}
                          size={20} 
                          color={Colors.text.tertiary}
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.interviewCardRight}>
                    <View style={styles.interviewHeader}>
                      <Ionicons 
                        name={getInterviewTypeIcon(interview.interview_type) as any}
                        size={16} 
                        color={Colors.text.tertiary}
                      />
                      <Text style={styles.roleTitle}>
                        {interview.role_title}
                      </Text>
                    </View>
                    
                    <Text style={styles.companyName}>
                      {interview.company}
                    </Text>
                    
                    <View style={styles.metaRow}>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(interview.difficulty) }]}>
                        {interview.difficulty}
                      </Text>
                      <Text style={styles.separator}>•</Text>
                      <Text style={styles.typeText}>
                        {interview.interview_type}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>
                      {formatDate(interview.created_at)}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.text.muted} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
      </SafeAreaView>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20, // layout.screenPadding
  },
  scrollViewContent: {
    paddingBottom: 40, // spacing.10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24, // spacing.6
  },
  headerTitle: {
    color: Colors.text.primary,
    ...TYPOGRAPHY.heading2,
  },
  headerSubtitle: {
    color: Colors.text.muted,
    marginTop: 4,
    ...TYPOGRAPHY.bodySmall,
  },
  cvButton: {
    backgroundColor: Colors.glass.backgroundInput,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  cvWarningCard: {
    backgroundColor: Colors.glass.goldLight,
    borderColor: Colors.glass.goldBorder,
    borderWidth: 1,
    borderRadius: 12, // glassSecondary.borderRadius
    padding: 16, // spacing.4
    marginBottom: 24, // spacing.6
  },
  cvWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cvWarningTitle: {
    color: Colors.accent.goldAlt,
    marginLeft: 8,
    ...TYPOGRAPHY.labelMedium,
    fontWeight: '600',
  },
  cvWarningText: {
    color: Colors.text.secondary,
    marginTop: 8,
    ...TYPOGRAPHY.bodySmall,
  },
  cvWarningButton: {
    marginTop: 12, // spacing.3
  },
  cvWarningButtonText: {
    color: Colors.accent.goldAlt,
    ...TYPOGRAPHY.labelMedium,
    fontWeight: '600',
  },
  cvSuccessCard: {
    backgroundColor: Colors.glass.successSecondary,
    borderColor: Colors.glass.successBorderAlt,
    borderWidth: 1,
    borderRadius: 12, // glassSecondary.borderRadius
    padding: 16, // spacing.4
    marginBottom: 24, // spacing.6
  },
  cvSuccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cvSuccessTitle: {
    color: Colors.semantic.success,
    marginLeft: 8,
    ...TYPOGRAPHY.labelMedium,
    fontWeight: '600',
  },
  cvSuccessText: {
    color: Colors.text.secondary,
    marginTop: 4,
    ...TYPOGRAPHY.bodySmall,
  },
  newInterviewButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4, // Android shadow
  },
  newInterviewButtonText: {
    color: Colors.text.primary,
    marginLeft: 8,
    ...TYPOGRAPHY.buttonLarge,
  },
  interviewsSection: {
    marginBottom: 24, // spacing.6
  },
  sectionTitle: {
    color: Colors.text.primary,
    marginBottom: 16,
    ...TYPOGRAPHY.heading4,
  },
  loadingCard: {
    backgroundColor: Colors.glass.background,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  loadingText: {
    color: Colors.text.tertiary,
    ...TYPOGRAPHY.bodyMedium,
  },
  emptyCard: {
    backgroundColor: Colors.glass.background,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  emptyTitle: {
    color: Colors.text.tertiary,
    marginTop: 16,
    ...TYPOGRAPHY.heading4,
  },
  emptyText: {
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: 8,
    ...TYPOGRAPHY.bodySmall,
  },
  interviewCard: {
    backgroundColor: Colors.glass.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // Android shadow
  },
  interviewCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  interviewCardLeft: {
    marginRight: 12, // spacing.3
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8, // borderRadius.default
    backgroundColor: Colors.white,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8, // borderRadius.default
    backgroundColor: Colors.glass.backgroundInput,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  interviewCardRight: {
    flex: 1,
  },
  interviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // spacing.2
  },
  roleTitle: {
    color: Colors.text.primary,
    marginLeft: 8,
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
  },
  companyName: {
    color: Colors.text.secondary,
    marginBottom: 4,
    ...TYPOGRAPHY.bodySmall,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyText: {
    textTransform: 'capitalize',
    ...TYPOGRAPHY.bodyXSmall,
    fontWeight: '500',
  },
  separator: {
    color: Colors.text.muted,
    marginHorizontal: 8,
    ...TYPOGRAPHY.bodyXSmall,
  },
  typeText: {
    color: Colors.text.muted,
    textTransform: 'capitalize',
    ...TYPOGRAPHY.bodyXSmall,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    color: Colors.text.muted,
    fontSize: 11,
    marginBottom: 4,
    ...TYPOGRAPHY.bodyXSmall,
  },
});

export default InterviewsHome;