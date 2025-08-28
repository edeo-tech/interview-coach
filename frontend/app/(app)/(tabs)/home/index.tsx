import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserJobs } from '../../../../_queries/jobs/jobs';
import usePosthogSafely from '../../../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../../../hooks/haptics/useHapticsSafely';
import ChatGPTBackground from '../../../../components/ChatGPTBackground';
import { GlassStyles } from '../../../../constants/GlassStyles';
import BrandfetchLogo from '../../../../components/BrandfetchLogo';
import { TYPOGRAPHY } from '../../../../constants/Typography';
import Colors from '../../../../constants/Colors';

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
    router.push(`/home/jobs/${jobId}` as any);
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
      case 'junior': return Colors.semantic.successAlt;
      case 'mid': return Colors.accent.gold;
      case 'senior': return Colors.semantic.error;
      default: return Colors.gray[500];
    }
  };

  const getJobProgressColor = (stagesCompleted: number, totalStages: number) => {
    const progress = stagesCompleted / totalStages;
    if (progress === 0) return Colors.gray[500];
    if (progress < 0.5) return Colors.accent.gold;
    if (progress < 1) return Colors.semantic.infoAlt;
    return Colors.semantic.successAlt;
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
                <ActivityIndicator size="large" color={Colors.brand.primary} />
                <Text style={styles.emptyStateTitle}>
                  Loading your jobs...
                </Text>
              </View>
            ) : !jobs || jobs.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Ionicons name="briefcase-outline" size={32} color={Colors.text.tertiary} />
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
                    fallbackIconColor={Colors.text.secondary}
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
                  
                  <Ionicons name="chevron-forward" size={20} color={Colors.text.disabled} />
                </TouchableOpacity>
              ))
            )}
            
            {/* Loading more indicator */}
            {isFetchingNextPage && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={Colors.brand.primary} />
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
    color: Colors.text.primary,
    marginBottom: 6,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.secondary,
  },

  section: {
    marginBottom: 24,
  },
  emptyState: {
    backgroundColor: Colors.glass.background,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.border,
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
    backgroundColor: Colors.glass.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.glass.borderSecondary,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.heading3,
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  jobItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.background,
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
    backgroundColor: Colors.white,
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
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8, // Space between title and progress
  },
  jobCompany: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
  },
  jobProgress: {
    ...TYPOGRAPHY.labelMedium,
    color: Colors.semantic.successAlt,
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
    color: Colors.brand.primary,
  },
});