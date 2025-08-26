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
import { TYPOGRAPHY } from '../../../constants/Typography';

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
                  style={styles.jobItem}
                  activeOpacity={0.8}
                >
                  <BrandfetchLogo
                    identifierType={job.brandfetch_identifier_type}
                    identifierValue={job.brandfetch_identifier_value}
                    fallbackUrl={job.company_logo_url}
                    size={24}
                    imageStyle={styles.companyLogo}
                    fallbackIconColor="rgba(255, 255, 255, 0.8)"
                    fallbackIconName="briefcase-outline"
                  />
                  
                  <View style={styles.jobItemContent}>
                    <View style={styles.jobItemTop}>
                      <Text style={styles.jobTitle} numberOfLines={1}>
                        {job.role_title}
                      </Text>
                      <Text style={styles.jobProgress}>
                        {job.stages_completed}/{job.interview_stages.length}
                      </Text>
                    </View>
                    <Text style={styles.jobCompany} numberOfLines={1}>
                      {job.company}
                    </Text>
                  </View>
                  
                  <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
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
    ...TYPOGRAPHY.displayMedium,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: 'rgba(255, 255, 255, 0.85)',
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
    ...TYPOGRAPHY.heading3,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  jobItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 50, // Pill-shaped like other touchables
    paddingVertical: 16, // Increased from 14 to accommodate larger logo
    paddingHorizontal: 18, // Slightly increased
    marginBottom: 12,
    gap: 14, // Increased gap for better spacing
  },
  companyLogo: {
    width: 32, // Increased from 24 to make room for images
    height: 32, // Increased from 24 to make room for images
    borderRadius: 8, // Increased border radius proportionally
    backgroundColor: '#ffffff',
  },
  jobItemContent: {
    flex: 1,
    minWidth: 0,
  },
  jobItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  jobTitle: {
    ...TYPOGRAPHY.itemTitle,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8, // Space between title and progress
  },
  jobCompany: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.70)',
  },
  jobProgress: {
    ...TYPOGRAPHY.labelMedium,
    color: '#10b981',
    fontWeight: '600',
    flexShrink: 0, // Prevent shrinking
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingMoreText: {
    ...TYPOGRAPHY.labelMedium,
    color: '#A855F7',
  },
});

