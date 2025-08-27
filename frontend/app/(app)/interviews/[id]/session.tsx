import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useStartAttempt, useFinishAttempt, useAddTranscript } from '../../../../_queries/interviews/interviews';
import usePosthogSafely from '../../../../hooks/posthog/usePosthogSafely';
import { useToast } from '../../../../components/Toast';
import { TYPOGRAPHY } from '../../../../constants/Typography';
import Colors from '../../../../constants/Colors';

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
  const { showToast } = useToast();

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
      showToast('Unable to start interview session. Please try again.', 'error');
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
      showToast('Problem ending interview session. Please try again.', 'error');
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
        colors={[Colors.background.primary, Colors.gray[800], Colors.gray[600]]}
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
      colors={[Colors.background.primary, Colors.gray[800], Colors.gray[600]]}
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
            <Ionicons name="mic" size={48} color={Colors.gray[500]} />
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
    paddingHorizontal: 20, // layout.screenPadding
  },
  loadingCard: {
    backgroundColor: Colors.glass.background, // glass.background
    borderRadius: 16, // glass.borderRadius
    padding: 32, // spacing.8
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.border, // glass.border
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  spinner: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: Colors.semantic.infoAlt, // semantic.info.main
    borderTopColor: 'transparent',
    borderRadius: 24,
    marginBottom: 16, // spacing.4
  },
  loadingTitle: {
    color: Colors.text.primary, // text.primary
    fontSize: 20, // typography.heading.h3.fontSize
    fontWeight: '600', // typography.heading.h3.fontWeight
    marginBottom: 8, // spacing.2
    textAlign: 'center',
    ...TYPOGRAPHY.heading3,
  },
  loadingSubtitle: {
    color: Colors.text.tertiary, // text.tertiary
    fontSize: 15, // typography.body.medium.fontSize (slightly smaller)
    textAlign: 'center',
    lineHeight: 20, // typography.body.medium.lineHeight
    ...TYPOGRAPHY.bodyMedium,
  },
  header: {
    paddingHorizontal: 20, // layout.screenPadding
    paddingVertical: 16, // spacing.4
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderSecondary, // glassSecondary.border
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
    marginRight: 12, // spacing.3
  },
  statusConnected: {
    backgroundColor: Colors.semantic.success, // semantic.success.main
  },
  statusDisconnected: {
    backgroundColor: Colors.semantic.error, // semantic.error.main
  },
  connectionText: {
    color: Colors.text.primary, // text.primary
    fontWeight: '600', // typography.label.large.fontWeight
    ...TYPOGRAPHY.labelLarge,
  },
  timerText: {
    color: Colors.text.tertiary, // text.tertiary
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 14, // typography.body.small.fontSize
  },
  transcriptContainer: {
    flex: 1,
    paddingHorizontal: 20, // layout.screenPadding
  },
  transcriptContent: {
    paddingVertical: 16, // spacing.4
  },
  emptyTranscript: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.glass.background, // glass.background
    borderRadius: 16, // glass.borderRadius
    padding: 32, // spacing.8
    marginHorizontal: 20, // layout.screenPadding
    marginVertical: 20, // spacing.5
    borderWidth: 1,
    borderColor: Colors.glass.border, // glass.border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  emptyTranscriptText: {
    color: Colors.text.tertiary, // text.tertiary
    textAlign: 'center',
    marginTop: 16, // spacing.4
    fontSize: 15, // typography.body.medium.fontSize (slightly smaller)
    lineHeight: 20, // typography.body.medium.lineHeight
    ...TYPOGRAPHY.bodyMedium,
  },
  messageContainer: {
    marginBottom: 16, // spacing.4
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  agentMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16, // spacing.4
    borderRadius: 12, // glassSecondary.borderRadius
  },
  userBubble: {
    backgroundColor: Colors.accent.goldAlt, // gold.400
    shadowColor: Colors.accent.gold, // gold.400
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4, // Android shadow
  },
  agentBubble: {
    backgroundColor: Colors.glass.backgroundSecondary, // glassSecondary.background
    borderWidth: 1,
    borderColor: Colors.glass.borderSecondary, // glassSecondary.border
  },
  messageText: {
    color: Colors.text.primary, // text.primary
    fontSize: 15, // typography.body.medium.fontSize (slightly smaller)
    lineHeight: 20, // typography.body.medium.lineHeight
    ...TYPOGRAPHY.bodyMedium,
  },
  messageInfo: {
    fontSize: 12, // typography.body.xsmall.fontSize
    marginTop: 4, // spacing.1
    ...TYPOGRAPHY.bodyXSmall,
  },
  userMessageInfo: {
    color: Colors.accent.blue, // semantic.info.main with higher opacity
  },
  agentMessageInfo: {
    color: Colors.text.muted, // text.muted
  },
  controls: {
    paddingHorizontal: 20, // layout.screenPadding
    paddingVertical: 24, // spacing.6
    borderTopWidth: 1,
    borderTopColor: Colors.glass.borderSecondary, // glassSecondary.border
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16, // spacing.4
  },
  recordingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8, // spacing.2
  },
  recordingActive: {
    backgroundColor: Colors.semantic.error, // semantic.error.main
  },
  recordingInactive: {
    backgroundColor: Colors.text.muted, // text.muted
  },
  statusText: {
    color: Colors.text.tertiary, // text.tertiary
    fontSize: 14, // typography.body.small.fontSize
    ...TYPOGRAPHY.bodySmall,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16, // spacing.4
  },
  actionButton: {
    paddingHorizontal: 24, // spacing.6
    paddingVertical: 16, // spacing.4
    borderRadius: 12, // glassSecondary.borderRadius
  },
  simulateButton: {
    backgroundColor: Colors.glass.backgroundSecondary, // glassSecondary.background
    borderWidth: 1,
    borderColor: Colors.glass.borderSecondary, // glassSecondary.border
  },
  endButton: {
    backgroundColor: Colors.semantic.error, // semantic.error.main
    shadowColor: Colors.semantic.error, // semantic.error.main
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4, // Android shadow
  },
  actionButtonText: {
    color: Colors.text.primary, // text.primary
    fontWeight: '600', // typography.button.medium.fontWeight
    fontSize: 16, // typography.button.medium.fontSize
    ...TYPOGRAPHY.buttonMedium,
  },
  instructionText: {
    color: Colors.text.muted, // text.muted
    fontSize: 12, // typography.body.xsmall.fontSize
    textAlign: 'center',
    marginTop: 16, // spacing.4
    ...TYPOGRAPHY.bodyXSmall,
  },
});

export default InterviewSession;