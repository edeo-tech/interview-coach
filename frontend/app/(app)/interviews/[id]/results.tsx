import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAttemptFeedback } from '../../../../_queries/interviews/feedback';
import usePosthogSafely from '../../../../hooks/posthog/usePosthogSafely';
import { useFeedbackCheck } from '../../../../hooks/premium/usePremiumCheck';
import { TYPOGRAPHY } from '../../../../constants/Typography';
import Colors from '../../../../constants/Colors';

const BlurredSection = ({ 
  children, 
  isBlurred, 
  onUpgradePress,
  showPaywall 
}: { 
  children: React.ReactNode; 
  isBlurred: boolean; 
  onUpgradePress?: () => void;
  showPaywall?: boolean;
}) => {
  if (!isBlurred) {
    return <>{children}</>;
  }

  return (
    <View style={styles.blurredContainer}>
      <BlurView intensity={20} tint="dark" style={styles.blurredContent}>
        {children}
      </BlurView>
      {showPaywall && (
        <View style={styles.upgradeOverlay}>
          <Ionicons name="diamond" size={32} color={Colors.accent.gold} />
          <Text style={styles.upgradeTitle}>Premium Feature</Text>
          <Text style={styles.upgradeMessage}>
            Upgrade to Premium to see detailed feedback and scores
          </Text>
          <TouchableOpacity onPress={onUpgradePress} style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const InterviewResults = () => {
  const { id, attemptId } = useLocalSearchParams<{ id: string; attemptId: string }>();
  const { data: feedback, isLoading, error } = useAttemptFeedback(attemptId);
  const { posthogScreen } = usePosthogSafely();
  const { canViewDetailedFeedback, isPaywallEnabled } = useFeedbackCheck();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('interview_results');
    }, [posthogScreen])
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    if (score >= 60) return '#f97316';
    return '#ef4444';
  };

  const getScoreBackgroundStyle = (score: number) => {
    if (score >= 90) return { backgroundColor: 'rgba(5, 46, 22, 0.15)', borderColor: 'rgba(34, 197, 94, 0.25)' };
    if (score >= 80) return { backgroundColor: 'rgba(30, 58, 138, 0.15)', borderColor: 'rgba(59, 130, 246, 0.25)' };
    if (score >= 70) return { backgroundColor: 'rgba(146, 64, 14, 0.15)', borderColor: 'rgba(245, 158, 11, 0.25)' };
    if (score >= 60) return { backgroundColor: 'rgba(154, 52, 18, 0.15)', borderColor: 'rgba(249, 115, 22, 0.25)' };
    return { backgroundColor: 'rgba(127, 29, 29, 0.15)', borderColor: 'rgba(239, 68, 68, 0.25)' };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Work';
    return 'Poor';
  };

  const RubricScore = ({ category, score }: { category: string; score: number }) => (
    <View style={styles.rubricItem}>
      <Text style={styles.rubricCategory}>{category.replace('_', ' ')}</Text>
      <View style={styles.rubricRight}>
        <Text style={[styles.rubricScore, { color: getScoreColor(score) }]}>
          {score}/100
        </Text>
        <View style={styles.progressBarContainer}>
          <View 
            style={[styles.progressBar, { backgroundColor: getScoreColor(score), width: `${score}%` }]}
          />
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <LinearGradient
        colors={["#0B1023", "#0E2B3A", "#2C7A91"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <View style={styles.spinner} />
            <Text style={styles.loadingTitle}>Analyzing your interview...</Text>
            <Text style={styles.loadingSubtitle}>This may take a few moments</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error || !feedback) {
    return (
      <LinearGradient
        colors={["#0B1023", "#0E2B3A", "#2C7A91"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color={Colors.semantic.error} />
            <Text style={styles.errorTitle}>Analysis Failed</Text>
            <Text style={styles.errorSubtitle}>
              We couldn't analyze your interview. Please try again.
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.errorButton}
            >
              <Text style={styles.errorButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const feedbackAccess = canViewDetailedFeedback();

  return (
    <LinearGradient
      colors={["#0B1023", "#0E2B3A", "#2C7A91"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/interviews/index' as any)}>
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Interview Results</Text>
          </View>

          {/* Overall Score */}
          <View style={[styles.scoreCard, getScoreBackgroundStyle(feedback.overall_score)]}>
            <Text style={styles.sectionTitle}>Overall Performance</Text>
            <View style={styles.scoreRow}>
              <View style={styles.scoreLeft}>
                <Text style={[styles.overallScore, { color: getScoreColor(feedback.overall_score) }]}>
                  {feedback.overall_score}
                </Text>
                <Text style={styles.scoreOutOf}>out of 100</Text>
              </View>
              <View style={styles.scoreRight}>
                <Text style={[styles.scoreLabel, { color: getScoreColor(feedback.overall_score) }]}>
                  {getScoreLabel(feedback.overall_score)}
                </Text>
                <Text style={styles.performanceLevel}>Performance Level</Text>
              </View>
            </View>
          </View>

          {/* Rubric Breakdown */}
          <BlurredSection 
            isBlurred={feedbackAccess.shouldBlur} 
            onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
            showPaywall={isPaywallEnabled}
          >
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Detailed Scores</Text>
              {Object.entries(feedback.rubric_scores).map(([category, score]) => (
                <RubricScore key={category} category={category} score={score} />
              ))}
            </View>
          </BlurredSection>

          {/* Strengths */}
          <BlurredSection 
            isBlurred={feedbackAccess.shouldBlur} 
            onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
            showPaywall={isPaywallEnabled}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.semantic.success} />
                <Text style={styles.sectionTitle}>Strengths</Text>
              </View>
              {feedback.strengths.map((strength, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.listText}>{strength}</Text>
                </View>
              ))}
            </View>
          </BlurredSection>

          {/* Areas for Improvement */}
          <BlurredSection 
            isBlurred={feedbackAccess.shouldBlur} 
            onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
            showPaywall={isPaywallEnabled}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="trending-up" size={20} color={Colors.accent.gold} />
                <Text style={styles.sectionTitle}>Areas for Improvement</Text>
              </View>
              {feedback.improvement_areas.map((area, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={[styles.bulletPoint, { color: Colors.semantic.warning }]}>•</Text>
                  <Text style={styles.listText}>{area}</Text>
                </View>
              ))}
            </View>
          </BlurredSection>

          {/* Detailed Feedback */}
          <BlurredSection 
            isBlurred={feedbackAccess.shouldBlur} 
            onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
            showPaywall={isPaywallEnabled}
          >
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Detailed Feedback</Text>
              <Text style={styles.detailedText}>{feedback.detailed_feedback}</Text>
            </View>
          </BlurredSection>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => router.push('/interviews/setup')}
              style={[styles.actionButton, styles.primaryButton]}
            >
              <Ionicons name="refresh" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Practice Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/interviews/${id}/details`)}
              style={[styles.actionButton, styles.secondaryButton]}
            >
              <Ionicons name="list" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>View All Attempts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/interviews/index' as any)}
              style={[styles.actionButton, styles.tertiaryButton]}
            >
              <Ionicons name="home" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Back to Interviews</Text>
            </TouchableOpacity>
          </View>

          {/* Tips for Improvement */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Next Steps</Text>
            <Text style={styles.tipText}>• Review the areas for improvement above</Text>
            <Text style={styles.tipText}>• Practice common questions for similar roles</Text>
            <Text style={styles.tipText}>• Work on specific technical concepts mentioned</Text>
            <Text style={styles.tipText}>• Try another practice interview to track progress</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

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
    paddingHorizontal: 20, // layout.screenPadding
  },
  scrollContent: {
    paddingBottom: 24, // spacing.6
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20, // layout.screenPadding
  },
  spinner: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: Colors.semantic.infoAlt,
    borderTopColor: 'transparent',
    borderRadius: 24,
    marginBottom: 16, // spacing.4
  },
  loadingTitle: {
    color: Colors.white,
    fontSize: 18, // typography.heading.h4.fontSize
    fontWeight: '600', // typography.heading.h4.fontWeight
    marginBottom: 8, // spacing.2
    ...TYPOGRAPHY.heading4,
  },
  loadingSubtitle: {
    color: Colors.text.tertiary,
    fontSize: 14, // typography.body.small.fontSize
    textAlign: 'center',
    ...TYPOGRAPHY.bodySmall,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20, // layout.screenPadding
  },
  errorTitle: {
    color: Colors.white,
    fontSize: 20, // typography.heading.h3.fontSize
    fontWeight: '600', // typography.heading.h3.fontWeight
    marginTop: 16, // spacing.4
    textAlign: 'center',
    ...TYPOGRAPHY.heading3,
  },
  errorSubtitle: {
    color: Colors.text.tertiary,
    fontSize: 15, // typography.body.medium.fontSize (slightly smaller)
    textAlign: 'center',
    marginTop: 8, // spacing.2
    lineHeight: 20, // typography.body.medium.lineHeight
    ...TYPOGRAPHY.bodyMedium,
  },
  errorButton: {
    backgroundColor: Colors.semantic.infoAlt,
    paddingHorizontal: 24, // spacing.6
    paddingVertical: 12, // spacing.3
    borderRadius: 12, // glassSecondary.borderRadius
    marginTop: 24, // spacing.6
    shadowColor: Colors.semantic.infoAlt,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4, // Android shadow
  },
  errorButtonText: {
    color: Colors.white,
    fontWeight: '600', // typography.button.medium.fontWeight
    fontSize: 16, // typography.button.medium.fontSize
    ...TYPOGRAPHY.buttonMedium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20, // spacing.5
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20, // typography.heading.h3.fontSize
    fontWeight: '600', // typography.heading.h3.fontWeight
    marginLeft: 16, // spacing.4
    ...TYPOGRAPHY.heading3,
  },
  scoreCard: {
    borderRadius: 16, // glass.borderRadius
    padding: 24, // spacing.6
    marginBottom: 16, // spacing.4
    borderWidth: 1,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18, // typography.heading.h4.fontSize
    fontWeight: '600', // typography.heading.h4.fontWeight
    marginBottom: 16, // spacing.4
    ...TYPOGRAPHY.heading4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreLeft: {
    alignItems: 'flex-start',
  },
  scoreRight: {
    alignItems: 'flex-end',
  },
  overallScore: {
    ...TYPOGRAPHY.heroMedium,
    fontWeight: '700',
    marginBottom: 4, // spacing.1
  },
  scoreOutOf: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
  },
  scoreLabel: {
    fontSize: 18, // typography.heading.h4.fontSize
    fontWeight: '600', // typography.heading.h4.fontWeight
    marginBottom: 4, // spacing.1
    ...TYPOGRAPHY.heading4,
  },
  performanceLevel: {
    color: Colors.text.tertiary,
    fontSize: 12, // typography.body.xsmall.fontSize
    ...TYPOGRAPHY.bodyXSmall,
  },
  card: {
    backgroundColor: Colors.glass.background,
    borderRadius: 16, // glass.borderRadius
    padding: 20, // spacing.5
    marginBottom: 16, // spacing.4
    borderWidth: 1,
    borderColor: Colors.glass.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // spacing.3
  },
  rubricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12, // spacing.3
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderSecondary,
  },
  rubricCategory: {
    color: Colors.white,
    fontSize: 15, // typography.body.medium.fontSize (slightly smaller)
    textTransform: 'capitalize',
    flex: 1,
    ...TYPOGRAPHY.bodyMedium,
  },
  rubricRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rubricScore: {
    fontWeight: '600', // typography.label.large.fontWeight
    marginRight: 12, // spacing.3
    fontSize: 14, // typography.body.small.fontSize
    ...TYPOGRAPHY.bodySmall,
  },
  progressBarContainer: {
    width: 64,
    height: 8,
    backgroundColor: Colors.glass.borderSecondary,
    borderRadius: 4, // borderRadius.sm
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4, // borderRadius.sm
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12, // spacing.3
  },
  bulletPoint: {
    color: Colors.semantic.success,
    marginRight: 12, // spacing.3
    fontSize: 16, // typography.body.medium.fontSize
    lineHeight: 20, // typography.body.medium.lineHeight
    ...TYPOGRAPHY.bodyMedium,
  },
  listText: {
    color: Colors.text.secondary,
    fontSize: 15, // typography.body.medium.fontSize (slightly smaller)
    lineHeight: 20, // typography.body.medium.lineHeight
    flex: 1,
    ...TYPOGRAPHY.bodyMedium,
  },
  detailedText: {
    color: Colors.text.secondary,
    fontSize: 15, // typography.body.medium.fontSize (slightly smaller)
    lineHeight: 22, // typography.body.medium.lineHeight
    ...TYPOGRAPHY.bodyMedium,
  },
  buttonContainer: {
    marginBottom: 16, // spacing.4
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16, // spacing.4
    borderRadius: 12, // glassSecondary.borderRadius
    marginBottom: 12, // spacing.3
  },
  primaryButton: {
    backgroundColor: Colors.semantic.infoAlt,
    shadowColor: Colors.semantic.infoAlt,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4, // Android shadow
  },
  secondaryButton: {
    backgroundColor: Colors.glass.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  tertiaryButton: {
    backgroundColor: Colors.glass.backgroundSubtle,
    borderWidth: 1,
    borderColor: Colors.glass.backgroundSecondary,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 16, // typography.button.medium.fontSize
    fontWeight: '600', // typography.button.medium.fontWeight
    marginLeft: 8, // spacing.2
    ...TYPOGRAPHY.buttonMedium,
    letterSpacing: 0.005, // typography.button.medium.letterSpacing
  },
  tipsCard: {
    backgroundColor: Colors.glass.info,
    borderColor: Colors.glass.infoBorder,
    borderWidth: 1,
    borderRadius: 12, // glassSecondary.borderRadius
    padding: 16, // spacing.4
    marginBottom: 24, // spacing.6
  },
  tipsTitle: {
    color: Colors.accent.blue,
    fontSize: 16, // typography.body.medium.fontSize
    fontWeight: '600', // typography.label.large.fontWeight
    marginBottom: 12, // spacing.3
    ...TYPOGRAPHY.bodyMedium,
  },
  tipText: {
    color: 'rgba(191, 219, 254, 1)',
    fontSize: 14, // typography.body.small.fontSize
    lineHeight: 20, // typography.body.small.lineHeight
    marginBottom: 4, // spacing.1
    ...TYPOGRAPHY.bodySmall,
  },
  blurredContainer: {
    position: 'relative',
    marginBottom: 16, // spacing.4
  },
  blurredContent: {
    borderRadius: 16, // glass.borderRadius
    overflow: 'hidden',
  },
  upgradeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16, // glass.borderRadius
    padding: 20, // spacing.5
  },
  upgradeTitle: {
    color: Colors.accent.goldAlt,
    fontSize: 18, // typography.heading.h4.fontSize
    fontWeight: '600', // typography.heading.h4.fontWeight
    marginTop: 8, // spacing.2
    marginBottom: 8, // spacing.2
    ...TYPOGRAPHY.heading4,
  },
  upgradeMessage: {
    color: Colors.white,
    fontSize: 14, // typography.body.small.fontSize
    textAlign: 'center',
    marginBottom: 16, // spacing.4
    lineHeight: 20, // typography.body.small.lineHeight
    ...TYPOGRAPHY.bodySmall,
  },
  upgradeButton: {
    backgroundColor: Colors.accent.goldAlt,
    paddingHorizontal: 20, // spacing.5
    paddingVertical: 10, // spacing.2.5
    borderRadius: 8, // borderRadius.default
    shadowColor: Colors.accent.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4, // Android shadow
  },
  upgradeButtonText: {
    color: Colors.white,
    fontSize: 14, // typography.button.small.fontSize
    fontWeight: '600', // typography.button.small.fontWeight
    ...TYPOGRAPHY.buttonSmall,
    letterSpacing: 0.01, // typography.button.small.letterSpacing
  },
});

export default InterviewResults;