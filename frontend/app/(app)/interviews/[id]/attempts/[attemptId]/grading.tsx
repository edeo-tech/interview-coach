import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAttemptFeedback } from '../../../../../../_queries/interviews/feedback';
import { useWebSocket } from '../../../../../../hooks/websocket/useWebSocket';
import usePosthogSafely from '../../../../../../hooks/posthog/usePosthogSafely';

export default function AttemptGradingScreen() {
  const { id, attemptId } = useLocalSearchParams<{ id: string; attemptId: string }>();
  const { data, isLoading, isFetching, refetch } = useAttemptFeedback(attemptId);
  const { posthogScreen } = usePosthogSafely();

  const [isGrading, setIsGrading] = useState(false);
  const [gradingStatus, setGradingStatus] = useState<string>('');

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('interview_grading');
    }, [posthogScreen])
  );

  // WebSocket for real-time updates
  const { isConnected } = useWebSocket(attemptId as string, {
    onGradingStarted: () => {
      console.log('🎯 [GRADING] Grading started');
      setIsGrading(true);
      setGradingStatus('Analyzing your responses...');
    },
    onGradingCompleted: (feedbackId) => {
      console.log('✅ [GRADING] Grading completed:', feedbackId);
      setIsGrading(false);
      setGradingStatus('');
      // Refetch feedback data
      refetch();
    },
    onError: (error) => {
      console.error('❌ [GRADING] WebSocket error:', error);
      setIsGrading(false);
      setGradingStatus('Error occurred during grading');
    }
  });

  const loading = isLoading || (!data && isFetching) || isGrading;

  const renderLoadingState = () => {
    return (
      <View style={styles.center}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingTitle}>Generating Feedback</Text>
          <Text style={styles.loadingSubtitle}>
            {gradingStatus || 'Our AI is analyzing your interview performance to provide personalized feedback.'}
          </Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
            <Text style={styles.statusText}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    if (score >= 60) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Work';
    return 'Poor';
  };

  const renderFeedback = () => (
    <ScrollView 
      style={styles.scrollView} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.overallScoreCard}>
        <Text style={styles.sectionTitle}>Overall Performance</Text>
        <View style={styles.scoreRow}>
          <View style={styles.scoreLeft}>
            <Text style={[styles.overallScore, { color: getScoreColor(data?.overall_score || 0) }]}>
              {data?.overall_score}
            </Text>
            <Text style={styles.scoreOutOf}>out of 100</Text>
          </View>
          <View style={styles.scoreRight}>
            <Text style={[styles.scoreLabel, { color: getScoreColor(data?.overall_score || 0) }]}>
              {getScoreLabel(data?.overall_score || 0)}
            </Text>
            <Text style={styles.performanceLevel}>Performance Level</Text>
          </View>
        </View>
        <View style={styles.overallProgressBar}>
          <View style={[styles.overallProgress, { backgroundColor: getScoreColor(data?.overall_score || 0), width: `${data?.overall_score || 0}%` }]} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Performance Breakdown</Text>
        {Object.entries(data?.rubric_scores || {}).map(([category, score]) => (
          <View key={category} style={styles.rubricItem}>
            <View style={styles.rubricHeader}>
              <Text style={styles.rubricCategory}>
                {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <Text style={[styles.rubricScore, { color: getScoreColor(score) }]}>{score}/100</Text>
            </View>
            <View style={styles.rubricBar}>
              <View style={[styles.rubricProgress, { backgroundColor: getScoreColor(score), width: `${score}%` }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.sectionTitle}>Strengths</Text>
        </View>
        {data?.strengths.map((s, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="trending-up" size={20} color="#F59E0B" />
          <Text style={styles.sectionTitle}>Areas to Improve</Text>
        </View>
        {data?.improvement_areas.map((s, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={[styles.bulletPoint, { color: '#f97316' }]}>•</Text>
            <Text style={styles.listText}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Detailed Feedback</Text>
        </View>
        <Text style={styles.detailedFeedback}>{data?.detailed_feedback}</Text>
      </View>

      {/* View Transcript Section */}
      <Pressable 
        style={[styles.transcriptCard, !data && styles.transcriptCardDisabled]}
        onPress={() => {
          if (data) {
            router.push({ 
              pathname: '/interviews/[id]/attempts/[attemptId]/transcript', 
              params: { id, attemptId } 
            });
          }
        }}
        disabled={!data}
      >
        <View style={styles.transcriptCardContent}>
          <View style={styles.transcriptCardLeft}>
            <View style={styles.transcriptIconContainer}>
              <Ionicons name="document-text-outline" size={24} color={data ? "#3B82F6" : "#6B7280"} />
            </View>
            <View style={styles.transcriptTextContainer}>
              <Text style={[styles.transcriptTitle, !data && styles.transcriptTitleDisabled]}>
                View Interview Transcript
              </Text>
              <Text style={[styles.transcriptSubtitle, !data && styles.transcriptSubtitleDisabled]}>
                Review the full conversation and your responses
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={data ? "#3B82F6" : "#6B7280"} />
        </View>
      </Pressable>
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={["#0B1023", "#0E2B3A", "#2C7A91"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Interview Feedback</Text>
        </View>
        
        {loading ? renderLoadingState() : data ? renderFeedback() : (
          <View style={styles.center}>
            <View style={styles.emptyCard}>
              <Ionicons name="document-text" size={48} color="#6B7280" />
              <Text style={styles.emptyTitle}>No Feedback Available</Text>
              <Text style={styles.emptySubtitle}>
                Your interview feedback will appear here once it's ready.
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.footer}>
          <Pressable 
            style={[styles.practiceAgainButton, !data && styles.practiceAgainButtonDisabled]} 
            onPress={() => {
              if (data) {
                router.replace({ pathname: '/interviews/[id]/details', params: { id } });
              }
            }}
            disabled={!data}
          >
            <Ionicons name="refresh-circle" size={24} color={data ? "#fff" : "#6B7280"} />
            <Text style={[styles.practiceAgainText, !data && styles.practiceAgainTextDisabled]}>
              Practice Again & Improve
            </Text>
            <Ionicons name="arrow-forward" size={20} color={data ? "#fff" : "#6B7280"} />
          </Pressable>
        </View>
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
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold', 
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 24,
  },
  footer: { 
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  // Transcript Card Styles
  transcriptCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  transcriptCardDisabled: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  transcriptCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transcriptCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transcriptIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transcriptTextContainer: {
    flex: 1,
  },
  transcriptTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transcriptTitleDisabled: {
    color: '#6B7280',
  },
  transcriptSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 18,
  },
  transcriptSubtitleDisabled: {
    color: '#6B7280',
  },

  // Practice Again Button Styles
  practiceAgainButton: {
    backgroundColor: '#F43F5E',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  practiceAgainButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowOpacity: 0,
    elevation: 0,
  },
  practiceAgainText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  practiceAgainTextDisabled: {
    color: '#6B7280',
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  
  // Loading states
  loadingCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxWidth: 320,
    marginHorizontal: 20,
  },
  loadingTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connected: {
    backgroundColor: '#10B981',
  },
  disconnected: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },

  // Empty state
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxWidth: 320,
    marginHorizontal: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Feedback content
  overallScoreCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreLeft: {
    alignItems: 'flex-start',
  },
  scoreRight: {
    alignItems: 'flex-end',
  },
  overallScore: { 
    fontSize: 48, 
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreOutOf: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  performanceLevel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  overallProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  overallProgress: {
    height: '100%',
    borderRadius: 4,
  },

  card: { 
    backgroundColor: 'rgba(255,255,255,0.06)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)', 
    borderRadius: 16, 
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  rubricItem: {
    marginBottom: 16,
  },
  rubricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rubricCategory: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  rubricScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  rubricBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  rubricProgress: {
    height: '100%',
    borderRadius: 3,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    color: '#10b981',
    marginRight: 12,
    fontSize: 16,
    lineHeight: 20,
  },
  listText: {
    color: '#d1d5db',
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  detailedFeedback: {
    color: '#d1d5db',
    lineHeight: 22,
    fontSize: 15,
  },
});