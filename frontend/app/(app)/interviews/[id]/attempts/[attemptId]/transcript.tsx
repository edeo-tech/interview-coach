import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TranscriptView from '../../../../../../components/TranscriptView';
import { useInterview } from '../../../../../../_queries/interviews/interviews';
import { useWebSocket } from '../../../../../../hooks/websocket/useWebSocket';
import usePosthogSafely from '../../../../../../hooks/posthog/usePosthogSafely';

export default function AttemptTranscriptScreen() {
  const { id, attemptId } = useLocalSearchParams<{ id: string; attemptId: string }>();
  const { data, isLoading, refetch } = useInterview(id);
  const { posthogScreen } = usePosthogSafely();
  
  const [transcript, setTranscript] = useState<any[]>([]);
  const [hasTranscript, setHasTranscript] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('interview_transcript');
    }, [posthogScreen])
  );

  const attempt = useMemo(() => {
    const attempts = data?.attempts || [];
    return attempts.find((a: any) => a.id === attemptId || a._id === attemptId);
  }, [data, attemptId]);

  // Initialize transcript from attempt data
  useEffect(() => {
    if (attempt?.transcript && Array.isArray(attempt.transcript)) {
      setTranscript(attempt.transcript);
      setHasTranscript(attempt.transcript.length > 0);
      // If we have a transcript and status is graded, we can proceed
      if (attempt.status === 'graded') {
        setCanProceed(true);
      }
    }
  }, [attempt]);

  // WebSocket for real-time updates
  const { isConnected } = useWebSocket(attemptId as string, {
    onTranscriptUpdate: (newTranscript) => {
      console.log('📝 [TRANSCRIPT] Received transcript update:', newTranscript.length, 'turns');
      setTranscript(newTranscript);
      setHasTranscript(newTranscript.length > 0);
      // Refetch the interview data to get updated attempt
      refetch();
    },
    onGradingStarted: () => {
      console.log('🎯 [TRANSCRIPT] Grading started');
      setIsGrading(true);
    },
    onGradingCompleted: (feedbackId) => {
      console.log('✅ [TRANSCRIPT] Grading completed:', feedbackId);
      setIsGrading(false);
      setCanProceed(true);
      // Refetch to get updated status
      refetch();
    },
    onError: (error) => {
      console.error('❌ [TRANSCRIPT] WebSocket error:', error);
    }
  });

  if (isLoading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator color="#3B82F6" />
        <Text style={styles.loadingText}>Loading interview...</Text>
      </View>
    );
  }

  const renderContent = () => {
    if (!hasTranscript) {
      return (
        <View style={styles.center}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingTitle}>Processing Interview</Text>
            <Text style={styles.loadingSubtitle}>
              Your interview is being processed. The transcript will appear here shortly.
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
    }

    return <TranscriptView transcript={transcript} />;
  };

  const renderFooter = () => {
    if (!hasTranscript) {
      return null; // No footer while loading
    }

    if (isGrading) {
      return (
        <View style={styles.footer}>
          <View style={styles.gradingContainer}>
            <ActivityIndicator color="#3B82F6" />
            <Text style={styles.gradingText}>Generating feedback...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.footer}>
        <Pressable 
          style={[styles.primary, !canProceed && styles.primaryDisabled]} 
          onPress={() => {
            if (canProceed) {
              router.push({ 
                pathname: '/interviews/[id]/attempts/[attemptId]/grading', 
                params: { id, attemptId } 
              });
            }
          }}
          disabled={!canProceed}
        >
          <Text style={[styles.primaryText, !canProceed && styles.primaryTextDisabled]}>
            {canProceed ? 'View Feedback' : 'Generating Feedback...'}
          </Text>
          {canProceed && <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.arrowIcon} />}
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Interview Transcript</Text>
      </View>
      {renderContent()}
      {renderFooter()}
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
  arrowIcon: { marginLeft: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' },
  loadingText: { 
    color: '#6B7280', 
    fontSize: 16, 
    fontFamily: 'Inter_400Regular', 
    marginTop: 16 
  },
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
  gradingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  gradingText: {
    color: '#3B82F6',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});


