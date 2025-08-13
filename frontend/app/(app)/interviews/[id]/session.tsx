import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useStartAttempt, useFinishAttempt, useAddTranscript } from '../../../../_queries/interviews/interviews';
import usePosthogSafely from '../../../../hooks/posthog/usePosthogSafely';

const InterviewSession = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isConnected, setIsConnected] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Array<{role: string; message: string; time_in_call_secs: number}>>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const startAttemptMutation = useStartAttempt();
  const finishAttemptMutation = useFinishAttempt();
  const addTranscriptMutation = useAddTranscript();
  const { posthogScreen } = usePosthogSafely();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('interview_session');
    }, [posthogScreen])
  );

  useEffect(() => {
    if (id && !attemptId) {
      startSession();
    }
  }, [id]);

  const startSession = async () => {
    try {
      const response = await startAttemptMutation.mutateAsync(id);
      // Backend doesn't provide agent_id anymore since ElevenLabs is handled on frontend
      setAgentId('frontend-managed');
      setAttemptId(response.data.attempt_id);
      setSessionStartTime(new Date());
      setIsSessionActive(true);
      
      // Here you would initialize the ElevenLabs conversation
      // For now, we'll simulate the interview process
      simulateInterview();
      
    } catch (error: any) {
      Alert.alert(
        'Error', 
        error.response?.data?.detail || 'Failed to start interview session'
      );
      router.back();
    }
  };

  const simulateInterview = () => {
    // Simulate AI interviewer speaking
    setTimeout(() => {
      addToTranscript('agent', "Hello! I'm excited to interview you today. Let's start with you telling me a bit about yourself and your background.");
      setIsConnected(true);
    }, 2000);
  };

  const addToTranscript = async (role: 'user' | 'agent', message: string) => {
    const callStartTime = sessionStartTime?.getTime() || Date.now();
    const currentTime = Date.now();
    const timeInCallSecs = Math.floor((currentTime - callStartTime) / 1000);
    
    const newTurn = {
      role,
      message,
      time_in_call_secs: timeInCallSecs
    };
    
    // Update local state immediately for UI responsiveness
    setTranscript(prev => [...prev, newTurn]);
    
    // Save to backend
    try {
      await addTranscriptMutation.mutateAsync({
        interviewId: id,
        turn: newTurn
      });
      console.log(`✅ Transcript saved: ${role} - ${message.substring(0, 50)}...`);
    } catch (error) {
      console.error('❌ Failed to save transcript:', error);
      // Could show a toast here, but continue with the interview
    }
  };

  const handleEndInterview = () => {
    Alert.alert(
      'End Interview',
      'Are you sure you want to end this interview session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Session', style: 'destructive', onPress: finishSession }
      ]
    );
  };

  const finishSession = async () => {
    if (!attemptId) return;

    try {
      setIsSessionActive(false);
      setIsConnected(false);

      const duration = sessionStartTime ? 
        Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000) : 0;

      await finishAttemptMutation.mutateAsync({
        interviewId: id,
        attemptId,
        durationSeconds: duration
      });

      router.replace(`/interviews/${id}/results?attemptId=${attemptId}`);
    } catch (error: any) {
      Alert.alert(
        'Error', 
        error.response?.data?.detail || 'Failed to end interview session'
      );
    }
  };

  const formatDuration = (startTime: Date | null) => {
    if (!startTime) return '00:00';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!agentId) {
    return (
      <LinearGradient
        colors={["#0B1023", "#0E2B3A", "#2C7A91"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <View style={styles.spinner} />
              <Text style={styles.loadingTitle}>Preparing your interview...</Text>
              <Text style={styles.loadingSubtitle}>Setting up AI interviewer</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0B1023", "#0E2B3A", "#2C7A91"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.connectionInfo}>
          <View style={[
            styles.statusDot,
            isConnected ? styles.statusConnected : styles.statusDisconnected
          ]} />
          <Text style={styles.connectionText}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Text>
        </View>
        
        <Text style={styles.timerText}>
          {formatDuration(sessionStartTime)}
        </Text>
      </View>

      {/* Transcript */}
      <ScrollView style={styles.transcriptContainer} contentContainerStyle={styles.transcriptContent}>
        {transcript.length === 0 ? (
          <View style={styles.emptyTranscript}>
            <Ionicons name="mic" size={48} color="#6b7280" />
            <Text style={styles.emptyTranscriptText}>
              Waiting for the interview to begin...
            </Text>
          </View>
        ) : (
          transcript.map((turn, index) => (
            <View key={index} style={[
              styles.messageContainer,
              turn.role === 'user' ? styles.userMessage : styles.agentMessage
            ]}>
              <View style={[
                styles.messageBubble,
                turn.role === 'user' ? styles.userBubble : styles.agentBubble
              ]}>
                <Text style={styles.messageText}>{turn.message}</Text>
                <Text style={[
                  styles.messageInfo,
                  turn.role === 'user' ? styles.userMessageInfo : styles.agentMessageInfo
                ]}>
                  {turn.role === 'user' ? 'You' : 'Interviewer'} • {
                    Math.floor(turn.time_in_call_secs / 60)}:{(turn.time_in_call_secs % 60).toString().padStart(2, '0')
                  }
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Microphone Status */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.recordingDot,
            isSessionActive ? styles.recordingActive : styles.recordingInactive
          ]} />
          <Text style={styles.statusText}>
            {isSessionActive ? 'Interview in progress' : 'Interview paused'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Simulated Response Button - for demo purposes */}
          <TouchableOpacity
            style={[styles.actionButton, styles.simulateButton]}
            onPress={() => addToTranscript('user', 'Thank you for the question. Let me think about this...')}
            disabled={!isSessionActive}
          >
            <Text style={styles.actionButtonText}>Simulate Response</Text>
          </TouchableOpacity>

          {/* End Interview Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.endButton]}
            onPress={handleEndInterview}
            disabled={finishAttemptMutation.isPending}
          >
            <Text style={styles.actionButtonText}>
              {finishAttemptMutation.isPending ? 'Ending...' : 'End Interview'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <Text style={styles.instructionText}>
          In a real implementation, this would connect to ElevenLabs for voice conversation
        </Text>
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxWidth: 320,
  },
  spinner: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderTopColor: 'transparent',
    borderRadius: 24,
    marginBottom: 16,
  },
  loadingTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusConnected: {
    backgroundColor: '#10b981',
  },
  statusDisconnected: {
    backgroundColor: '#ef4444',
  },
  connectionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  timerText: {
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  transcriptContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transcriptContent: {
    paddingVertical: 16,
  },
  emptyTranscript: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emptyTranscriptText: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
    lineHeight: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  agentMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: '#F59E0B',
  },
  agentBubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  messageText: {
    color: '#ffffff',
  },
  messageInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  userMessageInfo: {
    color: '#bfdbfe',
  },
  agentMessageInfo: {
    color: '#6b7280',
  },
  controls: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  recordingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  recordingActive: {
    backgroundColor: '#ef4444',
  },
  recordingInactive: {
    backgroundColor: '#6b7280',
  },
  statusText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  simulateButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  endButton: {
    backgroundColor: '#F43F5E',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  instructionText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default InterviewSession;