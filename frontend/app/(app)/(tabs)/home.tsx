import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserJobs } from '../../../_queries/jobs/jobs';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../../hooks/haptics/useHapticsSafely';
import ChatGPTBackground from '../../../components/ChatGPTBackground';
import { GlassStyles } from '../../../constants/GlassStyles';

export default function Home() {
  const { 
    data: jobsData, 
    isLoading: jobsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useUserJobs(10);
  
  const insets = useSafeAreaInsets();
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  const { selectionAsync } = useHapticsSafely();
  
  // Flatten the paginated data - extract jobs from each page
  const jobs = jobsData?.pages.flatMap(page => page.jobs) || [];
  
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };
  
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('home');
    }, [posthogScreen])
  );


  const handleJobPress = (jobId: string) => {
    selectionAsync();
    posthogCapture('view_job_details', {
      source: 'home',
      job_id: jobId
    });
    router.push(`/jobs/${jobId}` as any);
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

  const getJobProgressColor = (stagesCompleted: number, totalStages: number) => {
    const progress = stagesCompleted / totalStages;
    if (progress === 0) return '#6b7280';
    if (progress < 0.5) return '#f59e0b';
    if (progress < 1) return '#3b82f6';
    return '#10b981';
  };


  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
          gap: 16,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Recent jobs</Text>
            <Text style={styles.headerSubtitle}>
              Your recent job applications
            </Text>
          </View>
        </View>

        {/* Jobs List */}
        <View style={styles.section}>
          {jobsLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>
                Loading your jobs...
              </Text>
            </View>
          ) : !jobs || jobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={48} color="#6b7280" />
              <Text style={styles.emptyStateTitle}>
                No jobs yet
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                Your recent job applications will appear here
              </Text>
            </View>
          ) : (
            jobs.map((job) => (
              <TouchableOpacity
                key={job._id}
                onPress={() => handleJobPress(job._id)}
                style={styles.interviewCard}
              >
                <View style={styles.interviewCardContent}>
                  <View style={styles.cardLeftAccent}>
                    {job.company_logo_url ? (
                      <Image 
                        source={{ uri: job.company_logo_url }}
                        style={styles.companyLogo}
                        onError={() => {
                          // Fallback handled by conditional rendering
                        }}
                      />
                    ) : (
                      <Ionicons 
                        name="briefcase-outline"
                        size={28} 
                        color="#ffffff" 
                      />
                    )}
                  </View>
                  
                  <View style={styles.interviewCardMain}>
                    <Text style={styles.interviewTitle}>
                      {job.role_title}
                    </Text>
                    
                    <View style={styles.interviewCompany}>
                      <Ionicons name="business-outline" size={14} color="#6b7280" style={{flexShrink: 0}} />
                      <Text style={styles.companyText} numberOfLines={1}>
                        {job.company.length > 30 ? job.company.substring(0, 30) + '...' : job.company}
                      </Text>
                    </View>
                    
                    <View style={styles.interviewLocation}>
                      <Ionicons name="location-outline" size={14} color="#6b7280" style={{flexShrink: 0}} />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {(job.location || 'Remote').length > 40 ? (job.location || 'Remote').substring(0, 40) + '...' : (job.location || 'Remote')}
                      </Text>
                    </View>
                    
                    <View style={styles.progressContainer}>
                      <Text style={styles.progressText}>
                        {job.stages_completed} / {job.interview_stages.length} interviews completed
                      </Text>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill,
                            { 
                              width: `${(job.stages_completed / job.interview_stages.length) * 100}%`,
                              backgroundColor: getJobProgressColor(job.stages_completed, job.interview_stages.length)
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.interviewDate}>
                        {formatDate(job.created_at)}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          
          {/* Loading more indicator */}
          {isFetchingNextPage && (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#8b5cf6" />
              <Text style={styles.loadingMoreText}>Loading more jobs...</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingTop: Platform.OS === 'android' ? 66 : 20,
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

  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '500',
  },

});

