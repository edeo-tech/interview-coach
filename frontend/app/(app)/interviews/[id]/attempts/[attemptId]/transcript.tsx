import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
      <LinearGradient
        colors={["#0B1023", "#0E2B3A", "#2C7A91"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.center}> 
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingTitle}>Loading interview...</Text>
          </View>
        </View>
      </LinearGradient>
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
          <Text style={styles.headerTitle}>Interview Transcript</Text>
        </View>
        {renderContent()}
        {renderFooter()}
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
  footer: { 
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  primary: { 
    backgroundColor: '#3B82F6', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  primaryDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  primaryText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600',
  },
  primaryTextDisabled: { 
    color: '#9CA3AF',
  },
  arrowIcon: { 
    marginLeft: 4,
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
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
    fontWeight: '600',
  },
});