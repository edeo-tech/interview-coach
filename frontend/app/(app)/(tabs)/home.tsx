import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserJobs } from '../../../_queries/jobs/jobs';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../../hooks/haptics/useHapticsSafely';
import ChatGPTBackground from '../../../components/ChatGPTBackground';
import { GlassStyles } from '../../../constants/GlassStyles';
import BrandfetchLogo from '../../../components/BrandfetchLogo';

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
  
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: { layoutMeasurement: any, contentOffset: any, contentSize: any }) => {
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
                <ActivityIndicator size="large" color="#A855F7" />
                <Text style={styles.emptyStateTitle}>
                  Loading your jobs...
                </Text>
              </View>
            ) : !jobs || jobs.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Ionicons name="briefcase-outline" size={32} color="rgba(255, 255, 255, 0.7)" />
                </View>
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
                  activeOpacity={0.8}
                >
                  <View style={styles.interviewCardContent}>
                    <View style={styles.cardLeftAccent}>
                      <BrandfetchLogo
                        identifierType={job.brandfetch_identifier_type}
                        identifierValue={job.brandfetch_identifier_value}
                        fallbackUrl={job.company_logo_url}
                        size={32}
                        imageStyle={styles.companyLogo}
                        fallbackIconColor="rgba(255, 255, 255, 0.8)"
                        fallbackIconName="briefcase-outline"
                      />
                    </View>
                    
                    <View style={styles.interviewCardMain}>
                      <Text style={styles.interviewTitle}>
                        {job.role_title}
                      </Text>
                      
                      <View style={styles.interviewCompany}>
                        <Ionicons name="business-outline" size={14} color="rgba(255, 255, 255, 0.7)" style={{flexShrink: 0}} />
                        <Text style={styles.companyText} numberOfLines={1}>
                          {job.company.length > 30 ? job.company.substring(0, 30) + '...' : job.company}
                        </Text>
                      </View>
                      
                      <View style={styles.interviewLocation}>
                        <Ionicons name="location-outline" size={14} color="rgba(255, 255, 255, 0.7)" style={{flexShrink: 0}} />
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
                          Created {formatDate(job.created_at)}
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
                <ActivityIndicator size="small" color="#A855F7" />
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
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.02,
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'SpaceGrotesk' : 'sans-serif',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
  },

  section: {
    marginBottom: 24,
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    }),
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    letterSpacing: 0,
  },
  emptyStateSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontWeight: '400',
  },
  interviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    }),
  },
  interviewCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 20,
    paddingHorizontal: 20,
    minHeight: 80,
    gap: 16,
  },
  cardLeftAccent: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  interviewCardMain: {
    flex: 1,
    minWidth: 0, // Ensures text truncation works properly
  },
  interviewTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    flexShrink: 1,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    letterSpacing: 0,
  },
  interviewCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
    marginBottom: 6,
  },
  companyText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    marginLeft: 6,
    flexShrink: 1,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    letterSpacing: 0.01,
  },
  interviewLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
    marginBottom: 12,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginLeft: 6,
    flexShrink: 1,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    letterSpacing: 0.02,
  },
  interviewDate: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    letterSpacing: 0.02,
  },

  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    letterSpacing: 0.02,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingMoreText: {
    color: '#A855F7',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    letterSpacing: 0.01,
  },
});

