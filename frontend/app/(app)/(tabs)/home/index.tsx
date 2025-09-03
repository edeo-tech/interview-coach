import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserInterviews } from '../../../../_queries/interviews/interviews';
import usePosthogSafely from '../../../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../../../hooks/haptics/useHapticsSafely';
import ChatGPTBackground from '../../../../components/ChatGPTBackground';
import { GlassStyles } from '../../../../constants/GlassStyles';
import BrandfetchLogo from '../../../../components/BrandfetchLogo';
import { TYPOGRAPHY } from '../../../../constants/Typography';
import Colors from '../../../../constants/Colors';

export default function Home() {
  const { 
    data: interviewsData, 
    isLoading: interviewsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useUserInterviews(10);
  
  const insets = useSafeAreaInsets();
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  const { selectionAsync } = useHapticsSafely();
  
  // Flatten the paginated data - extract interviews from each page
  const interviews = interviewsData?.pages.flatMap(page => page.interviews) || [];
  
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

  const handleInterviewPress = (interviewId: string) => {
    selectionAsync();
    posthogCapture('view_interview_details', {
      source: 'home',
      interview_id: interviewId
    });
    router.push(`/home/interviews/${interviewId}/details` as any);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLikelihoodColor = (likelihood: number | null | undefined) => {
    if (!likelihood) return Colors.gray[500];
    if (likelihood < 40) return Colors.semantic.error;
    if (likelihood < 70) return Colors.accent.gold;
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
              <Text style={styles.headerTitle}>Recent interviews</Text>
              <Text style={styles.headerSubtitle}>
                Your interview practice sessions
              </Text>
            </View>
          </View>

          {/* Interviews List */}
          <View style={styles.section}>
            {interviewsLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={Colors.brand.primary} />
                <Text style={styles.emptyStateTitle}>
                  Loading your interviews...
                </Text>
              </View>
            ) : !interviews || interviews.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Ionicons name="briefcase-outline" size={32} color={Colors.text.tertiary} />
                </View>
                <Text style={styles.emptyStateTitle}>
                  No interviews yet
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  Your interview sessions will appear here
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    selectionAsync();
                    posthogCapture('create_interview_from_empty_state');
                    router.push('/(app)/interviews/create');
                  }}
                  style={styles.createInterviewButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={20} color={Colors.white} />
                  <Text style={styles.createInterviewButtonText}>Create Interview</Text>
                </TouchableOpacity>
              </View>
            ) : (
              interviews.map((interview) => (
                <TouchableOpacity
                  key={interview._id}
                  onPress={() => handleInterviewPress(interview._id)}
                  style={styles.interviewItem}
                  activeOpacity={0.8}
                >
                  <BrandfetchLogo
                    identifierType={interview.brandfetch_identifier_type}
                    identifierValue={interview.brandfetch_identifier_value}
                    fallbackUrl={interview.company_logo_url}
                    size={24}
                    imageStyle={styles.companyLogo}
                    fallbackIconColor={Colors.text.secondary}
                    fallbackIconName="briefcase-outline"
                  />
                  
                  <View style={styles.interviewItemContent}>
                    <View style={styles.interviewItemTop}>
                      <Text style={styles.interviewTitle} numberOfLines={1}>
                        {interview.role_title}
                      </Text>
                      <Text style={[styles.interviewLikelihood, { color: getLikelihoodColor(interview.average_score) }]}>
                        {interview.average_score ? `${Math.round(interview.average_score)}%` : 'Not started'}
                      </Text>
                    </View>
                    <Text style={styles.interviewCompany} numberOfLines={1}>
                      {interview.company}
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
                <Text style={styles.loadingMoreText}>Loading more interviews...</Text>
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
    marginBottom: 24,
  },
  createInterviewButton: {
    backgroundColor: Colors.glass.purple,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.glass.purpleTint,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createInterviewButtonText: {
    ...TYPOGRAPHY.labelMedium,
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  interviewItem: {
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
  interviewItemContent: {
    flex: 1,
    minWidth: 0,
  },
  interviewItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  interviewTitle: {
    ...TYPOGRAPHY.itemTitle,
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8, // Space between title and progress
  },
  interviewCompany: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
  },
  interviewLikelihood: {
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