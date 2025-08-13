import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInterviews } from '../../../_queries/interviews/interviews';
import { useCV } from '../../../_queries/interviews/cv';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';

export default function Home() {
  const { data: interviews, isLoading: interviewsLoading } = useInterviews();
  const { data: cv } = useCV();
  const insets = useSafeAreaInsets();
  const { posthogScreen, posthogCapture } = usePosthogSafely();

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

  return (
    <LinearGradient
      colors={["#0B1023", "#0E2B3A", "#2C7A91"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
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

        {/* Quick Action: Create New Interview (card style) */}
        <TouchableOpacity onPress={handleCreateNewInterview} style={styles.createCard}>
          <View style={styles.createCardLeft}>
            <Ionicons name="add" size={24} color="#ffffff" />
          </View>
          <View style={styles.createCardRight}>
            <Text style={styles.createCardTitle}>Create new interview</Text>
          </View>
        </TouchableOpacity>

        {/* CV Status */}
        {!cv && (
          <View style={[styles.statusCard, styles.warningCard]}>
            <View style={styles.statusHeader}>
              <Ionicons name="warning" size={20} color="#fbbf24" />
              <Text style={styles.warningTitle}>CV Required</Text>
            </View>
            <Text style={styles.statusDescription}>
              Upload your CV to get personalized interview questions and feedback.
            </Text>
            <TouchableOpacity 
              onPress={() => {
                posthogCapture('navigate_to_cv_upload', {
                  source: 'home',
                  has_existing_cv: false
                });
                router.push('/interviews/cv-upload');
              }}
              style={styles.statusAction}
            >
              <Text style={styles.warningAction}>Upload CV →</Text>
            </TouchableOpacity>
          </View>
        )}

        {cv && (
          <View style={[styles.statusCard, styles.successCard]}>
            <View style={styles.statusHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.successTitle}>Your CV</Text>
            </View>
            <Text style={styles.statusDescription}> 
              {cv.skills.length} skills • {cv.experience_years} years experience
            </Text>
          </View>
        )}

        {/* Recent Interviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recent Interviews
          </Text>
          
          {interviewsLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading interviews...</Text>
            </View>
          ) : !interviews || interviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={48} color="#6b7280" />
              <Text style={styles.emptyStateTitle}>
                No interviews yet
              </Text>
              <Text style={styles.emptyStateSubtitle}>
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
                  <View style={styles.cardLeftAccent}>
                    <Ionicons 
                      name={getInterviewTypeIcon(interview.interview_type) as any}
                      size={14} 
                      color="#ffffff" 
                    />
                  </View>
                  
                  <View style={styles.interviewCardLeft}>
                    <View style={styles.interviewCardHeader}>
                      <Text style={styles.interviewTitle} numberOfLines={1}>
                        {interview.role_title}
                      </Text>
                      <Text style={styles.interviewCompany} numberOfLines={1}>
                        {" • "}{interview.company}
                      </Text>
                    </View>
                    
                    <View style={styles.interviewMeta}>
                      <View style={styles.interviewLocation}>
                        <Ionicons name="location-outline" size={12} color="#6b7280" style={{flexShrink: 0}} />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {interview.location || 'Remote'}
                        </Text>
                      </View>
                      <Text style={styles.metaSeparator}>•</Text>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(interview.difficulty) }]} numberOfLines={1}>
                        {interview.experience_level || interview.difficulty}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.interviewDate}>
                    {formatDate(interview.created_at)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

    </View>
    </LinearGradient>
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
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  createCardLeft: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)'
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
  warningCard: {
    backgroundColor: 'rgba(146, 64, 14, 0.15)',
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  successCard: {
    backgroundColor: 'rgba(5, 46, 22, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  warningTitle: {
    color: '#fbbf24',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
  successTitle: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
  statusDescription: {
    color: '#d1d5db',
    fontSize: 15,
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  statusAction: {
    marginTop: 12,
  },
  warningAction: {
    color: '#fbbf24',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  interviewCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 68,
    gap: 12,
  },
  cardLeftAccent: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  interviewCardLeft: {
    flex: 1,
    minWidth: 0, // Ensures text truncation works properly
  },
  interviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  interviewTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    flexShrink: 1,
  },
  interviewCompany: {
    color: '#d1d5db',
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  interviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  interviewLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
  },
  locationText: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 2,
    flexShrink: 1,
  },
  difficultyText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
    flexShrink: 0,
  },
  metaSeparator: {
    color: '#6b7280',
    fontSize: 12,
    marginHorizontal: 4,
    lineHeight: 16,
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
    lineHeight: 16,
  },

});

