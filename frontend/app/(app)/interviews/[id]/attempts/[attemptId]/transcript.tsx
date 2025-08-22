import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../../../../../components/ChatGPTBackground';
import TranscriptView from '../../../../../../components/TranscriptView';
import { useInterview } from '../../../../../../_queries/interviews/interviews';
import usePosthogSafely from '../../../../../../hooks/posthog/usePosthogSafely';

export default function AttemptTranscriptScreen() {
  const { id, attemptId, is_from_interview } = useLocalSearchParams<{ id: string; attemptId: string; is_from_interview?: string }>();
  const { data, isLoading, refetch } = useInterview(id);
  const { posthogScreen } = usePosthogSafely();
  
  const [transcript, setTranscript] = useState<any[]>([]);
  const [hasTranscript, setHasTranscript] = useState(false);

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
    }
  }, [attempt]);

  // No WebSocket needed - transcript is loaded from stored data only

  if (isLoading) {
    return (
      <ChatGPTBackground style={styles.gradient}>
        <View style={styles.center}> 
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={styles.loadingTitle}>Loading interview...</Text>
          </View>
        </View>
      </ChatGPTBackground>
    );
  }

  const renderContent = () => {
    if (!hasTranscript) {
      return (
        <View style={styles.center}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={styles.loadingTitle}>Processing Interview</Text>
            <Text style={styles.loadingSubtitle}>
              Your interview is being processed. The transcript will appear here shortly.
            </Text>
          </View>
        </View>
      );
    }

    return <TranscriptView transcript={transcript} />;
  };

  const renderFooter = () => {
    console.log('is_from_interview', is_from_interview);
    // Only show "View Feedback" button if coming from interview (not from grading) and transcript is available
    if (is_from_interview === 'true' && hasTranscript) {
      return (
        <View style={styles.footer}>
          <Pressable 
            style={styles.viewFeedbackButton}
            onPress={() => {
              router.push({ 
                pathname: '/interviews/[id]/attempts/[attemptId]/grading', 
                params: { id, attemptId } 
              });
            }}
          >
            <Ionicons name="analytics-outline" size={24} color="#fff" />
            <Text style={styles.viewFeedbackText}>
              View Feedback & Analysis
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </View>
      );
    }
    
    // No footer needed when coming from grading or when transcript is not available
    return null;
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
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
  footer: { 
    padding: 20, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  viewFeedbackButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      }
    }),
  },
  viewFeedbackText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
});