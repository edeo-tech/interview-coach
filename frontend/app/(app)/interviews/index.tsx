import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInterviews } from '../../../_queries/interviews/interviews';
import { useCV } from '../../../_queries/interviews/cv';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';
import ChatGPTBackground from '../../../components/ChatGPTBackground';

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
      case 'junior': return 'rgba(34, 197, 94, 1)'; // semantic.success.main
      case 'mid': return 'rgba(252, 180, 0, 1)'; // gold.400
      case 'senior': return 'rgba(239, 68, 68, 1)'; // semantic.error.main
      default: return 'rgba(255, 255, 255, 0.55)'; // text.muted
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
            <Ionicons name="document-text" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* CV Status */}
        {!cv && (
          <View style={styles.cvWarningCard}>
            <View style={styles.cvWarningHeader}>
              <Ionicons name="warning" size={20} color="rgba(252, 180, 0, 1)" />
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
              <Ionicons name="checkmark-circle" size={20} color="rgba(34, 197, 94, 1)" />
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
          <Ionicons name="add-circle" size={24} color="white" />
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
              <Ionicons name="chatbubble-outline" size={48} color="rgba(255, 255, 255, 0.55)" />
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
                          color="rgba(255, 255, 255, 0.70)" 
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.interviewCardRight}>
                    <View style={styles.interviewHeader}>
                      <Ionicons 
                        name={getInterviewTypeIcon(interview.interview_type) as any}
                        size={16} 
                        color="rgba(255, 255, 255, 0.70)" 
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
                    <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.55)" />
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
    backgroundColor: 'transparent',
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
    color: '#FFFFFF', // text.primary
    fontSize: 24, // typography.heading.h2.fontSize
    fontWeight: '600', // typography.heading.h2.fontWeight
    fontFamily: 'SpaceGrotesk', // typography.heading.h2.fontFamily
    letterSpacing: -0.005, // typography.heading.h2.letterSpacing
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.55)', // text.muted
    fontSize: 14, // typography.body.small.fontSize
    marginTop: 4, // spacing.1
    fontFamily: 'Inter', // typography.body.small.fontFamily
  },
  cvButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)', // glassInput.background
    padding: 12, // spacing.3
    borderRadius: 12, // glassInput.borderRadius
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // glassInput.border
  },
  cvWarningCard: {
    backgroundColor: 'rgba(252, 180, 0, 0.1)', // semantic.warning.light
    borderColor: 'rgba(252, 180, 0, 0.3)', // gold.400 with opacity
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
    color: 'rgba(252, 180, 0, 1)', // gold.400
    fontWeight: '600', // typography.label.large.fontWeight
    marginLeft: 8, // spacing.2
    fontSize: 14, // typography.label.medium.fontSize
    fontFamily: 'Inter', // typography.label.medium.fontFamily
  },
  cvWarningText: {
    color: 'rgba(255, 255, 255, 0.85)', // text.secondary
    marginTop: 8, // spacing.2
    fontSize: 14, // typography.body.small.fontSize
    fontFamily: 'Inter', // typography.body.small.fontFamily
  },
  cvWarningButton: {
    marginTop: 12, // spacing.3
  },
  cvWarningButtonText: {
    color: 'rgba(252, 180, 0, 1)', // gold.400
    fontWeight: '600', // typography.label.medium.fontWeight
    fontSize: 14, // typography.label.medium.fontSize
    fontFamily: 'Inter', // typography.label.medium.fontFamily
  },
  cvSuccessCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)', // semantic.success.light
    borderColor: 'rgba(34, 197, 94, 0.3)', // semantic.success.main with opacity
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
    color: 'rgba(34, 197, 94, 1)', // semantic.success.main
    fontWeight: '600', // typography.label.large.fontWeight
    marginLeft: 8, // spacing.2
    fontSize: 14, // typography.label.medium.fontSize
    fontFamily: 'Inter', // typography.label.medium.fontFamily
  },
  cvSuccessText: {
    color: 'rgba(255, 255, 255, 0.85)', // text.secondary
    marginTop: 4, // spacing.1
    fontSize: 14, // typography.body.small.fontSize
    fontFamily: 'Inter', // typography.body.small.fontFamily
  },
  newInterviewButton: {
    backgroundColor: 'rgba(168, 85, 247, 1)', // purple.400
    borderRadius: 12, // glassSecondary.borderRadius
    padding: 16, // spacing.4
    marginBottom: 24, // spacing.6
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A855F7', // purple.400
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4, // Android shadow
  },
  newInterviewButtonText: {
    color: '#FFFFFF', // text.primary
    fontWeight: '600', // typography.button.medium.fontWeight
    marginLeft: 8, // spacing.2
    fontSize: 18, // typography.button.large.fontSize
    fontFamily: 'Inter', // typography.button.large.fontFamily
    letterSpacing: 0.005, // typography.button.large.letterSpacing
  },
  interviewsSection: {
    marginBottom: 24, // spacing.6
  },
  sectionTitle: {
    color: '#FFFFFF', // text.primary
    fontSize: 18, // typography.heading.h4.fontSize
    fontWeight: '600', // typography.heading.h4.fontWeight
    marginBottom: 16, // spacing.4
    fontFamily: 'Inter', // typography.heading.h4.fontFamily
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // glass.background
    borderRadius: 12, // glassSecondary.borderRadius
    padding: 24, // spacing.6
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // glass.border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.70)', // text.tertiary
    fontSize: 16, // typography.body.medium.fontSize
    fontFamily: 'Inter', // typography.body.medium.fontFamily
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // glass.background
    borderRadius: 12, // glassSecondary.borderRadius
    padding: 24, // spacing.6
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // glass.border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  emptyTitle: {
    color: 'rgba(255, 255, 255, 0.70)', // text.tertiary
    fontSize: 18, // typography.heading.h4.fontSize
    fontWeight: '600', // typography.heading.h4.fontWeight
    marginTop: 16, // spacing.4
    fontFamily: 'Inter', // typography.heading.h4.fontFamily
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.55)', // text.muted
    textAlign: 'center',
    marginTop: 8, // spacing.2
    fontSize: 14, // typography.body.small.fontSize
    fontFamily: 'Inter', // typography.body.small.fontFamily
  },
  interviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // glass.background
    borderRadius: 12, // glassSecondary.borderRadius
    padding: 16, // spacing.4
    marginBottom: 12, // spacing.3
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // glass.border
    shadowColor: '#000',
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
    backgroundColor: '#ffffff',
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8, // borderRadius.default
    backgroundColor: 'rgba(255, 255, 255, 0.10)', // glassInput.background
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // glassInput.border
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
    color: '#FFFFFF', // text.primary
    fontSize: 16, // typography.body.medium.fontSize
    fontWeight: '600', // typography.label.large.fontWeight
    marginLeft: 8, // spacing.2
    fontFamily: 'Inter', // typography.body.medium.fontFamily
  },
  companyName: {
    color: 'rgba(255, 255, 255, 0.85)', // text.secondary
    fontSize: 14, // typography.body.small.fontSize
    marginBottom: 4, // spacing.1
    fontFamily: 'Inter', // typography.body.small.fontFamily
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12, // typography.body.xsmall.fontSize
    fontWeight: '500', // typography.label.small.fontWeight
    textTransform: 'capitalize',
    fontFamily: 'Inter', // typography.body.xsmall.fontFamily
    letterSpacing: 0.02, // typography.label.small.letterSpacing
  },
  separator: {
    color: 'rgba(255, 255, 255, 0.55)', // text.muted
    fontSize: 12, // typography.body.xsmall.fontSize
    marginHorizontal: 8, // spacing.2
    fontFamily: 'Inter', // typography.body.xsmall.fontFamily
  },
  typeText: {
    color: 'rgba(255, 255, 255, 0.55)', // text.muted
    fontSize: 12, // typography.body.xsmall.fontSize
    textTransform: 'capitalize',
    fontFamily: 'Inter', // typography.body.xsmall.fontFamily
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.55)', // text.muted
    fontSize: 11, // typography.body.xsmall.fontSize (slightly smaller)
    marginBottom: 4, // spacing.1
    fontFamily: 'Inter', // typography.body.xsmall.fontFamily
  },
});

export default InterviewsHome;