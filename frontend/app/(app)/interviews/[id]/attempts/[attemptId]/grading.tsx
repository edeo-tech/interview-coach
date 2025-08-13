import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAttemptFeedback } from '../../../../../../_queries/interviews/feedback';
import { useWebSocket } from '../../../../../../hooks/websocket/useWebSocket';

export default function AttemptGradingScreen() {
  const { id, attemptId } = useLocalSearchParams<{ id: string; attemptId: string }>();
  const { data, isLoading, isFetching, refetch } = useAttemptFeedback(attemptId);

  const [isGrading, setIsGrading] = useState(false);
  const [gradingStatus, setGradingStatus] = useState<string>('');

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
    const statusMessages = [
      'Analyzing your responses...',
      'Evaluating technical knowledge...',
      'Assessing communication skills...',
      'Generating personalized feedback...'
    ];

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

  const renderFeedback = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View style={styles.scoreCard}>
        <Text style={styles.score}>{data.overall_score}</Text>
        <Text style={styles.scoreLabel}>Overall Score</Text>
        <View style={styles.scoreBar}>
          <View style={[styles.scoreProgress, { width: `${data.overall_score}%` }]} />
        </View>
      </View>

      <View style={styles.rubricContainer}>
        <Text style={styles.cardTitle}>Performance Breakdown</Text>
        {Object.entries(data.rubric_scores || {}).map(([category, score]) => (
          <View key={category} style={styles.rubricItem}>
            <View style={styles.rubricHeader}>
              <Text style={styles.rubricCategory}>
                {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <Text style={styles.rubricScore}>{score}/100</Text>
            </View>
            <View style={styles.rubricBar}>
              <View style={[styles.rubricProgress, { width: `${score}%` }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.cardTitle}>Strengths</Text>
        </View>
        {data.strengths.map((s, i) => (
          <Text key={i} style={styles.item}>• {s}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="trending-up" size={20} color="#F59E0B" />
          <Text style={styles.cardTitle}>Areas to Improve</Text>
        </View>
        {data.improvement_areas.map((s, i) => (
          <Text key={i} style={styles.item}>• {s}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text" size={20} color="#3B82F6" />
          <Text style={styles.cardTitle}>Detailed Feedback</Text>
        </View>
        <Text style={styles.detailedFeedback}>{data.detailed_feedback}</Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Interview Feedback</Text>
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
          style={[styles.primary, !data && styles.primaryDisabled]} 
          onPress={() => router.replace({ pathname: '/interviews/[id]/details', params: { id } })}
          disabled={!data}
        >
          <Text style={[styles.primaryText, !data && styles.primaryTextDisabled]}>
            Back to Interview
          </Text>
          <Ionicons name="arrow-forward" size={20} color={data ? "#fff" : "#9CA3AF"} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#333' 
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: { color: '#fff', fontSize: 18, fontFamily: 'Inter_600SemiBold', flex: 1 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#333' },
  primary: { 
    backgroundColor: '#3B82F6', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  primaryDisabled: {
    backgroundColor: '#374151',
  },
  primaryText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  primaryTextDisabled: { color: '#9CA3AF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  // Loading states
  loadingCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    maxWidth: 300,
  },
  loadingTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
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
    fontFamily: 'Inter_500Medium',
  },

  // Empty state
  emptyCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    maxWidth: 300,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Feedback content
  scoreCard: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  score: { 
    color: '#3B82F6', 
    fontSize: 48, 
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  scoreLabel: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    marginBottom: 16,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },

  rubricContainer: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
  },
  rubricItem: {
    marginBottom: 12,
  },
  rubricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rubricCategory: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  rubricScore: {
    color: '#3B82F6',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  rubricBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  rubricProgress: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },

  card: { 
    backgroundColor: '#111', 
    borderWidth: 1, 
    borderColor: '#333', 
    borderRadius: 12, 
    padding: 16 
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: { 
    color: '#fff', 
    fontFamily: 'Inter_600SemiBold', 
    fontSize: 16,
  },
  item: { 
    color: '#D1D5DB', 
    lineHeight: 20, 
    marginBottom: 8,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  detailedFeedback: {
    color: '#D1D5DB',
    lineHeight: 22,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
});


