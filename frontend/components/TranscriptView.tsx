import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type TranscriptTurn = {
  role: 'user' | 'agent';
  message: string;
  time_in_call_secs: number;
};

interface TranscriptViewProps {
  transcript: TranscriptTurn[];
}

export default function TranscriptView({ transcript }: TranscriptViewProps) {
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {transcript.map((turn, idx) => (
        <View
          key={`${idx}-${turn.time_in_call_secs || idx}`}
          style={[styles.messageContainer, turn.role === 'user' ? styles.userMessage : styles.agentMessage]}
        >
          <View style={[styles.messageBubble, turn.role === 'user' ? styles.userBubble : styles.agentBubble]}>
            <View style={styles.messageHeader}>
              <View style={styles.speakerContainer}>
                <View style={[styles.avatarIcon, turn.role === 'user' ? styles.userAvatar : styles.agentAvatar]}>
                  <Ionicons 
                    name={turn.role === 'user' ? 'person' : 'chatbubble-ellipses'} 
                    size={14} 
                    color={turn.role === 'user' ? '#ffffff' : '#3B82F6'} 
                  />
                </View>
                <Text style={[styles.speaker, turn.role === 'user' ? styles.userSpeaker : styles.agentSpeaker]}>
                  {turn.role === 'user' ? 'You' : 'AI Interviewer'}
                </Text>
              </View>
              {!!turn.time_in_call_secs && (
                <Text style={styles.timestamp}>
                  {Math.floor(turn.time_in_call_secs / 60)}:{(turn.time_in_call_secs % 60).toString().padStart(2, '0')}
                </Text>
              )}
            </View>
            <Text style={[styles.messageText, turn.role === 'user' ? styles.userText : styles.agentText]}>
              {turn.message}
            </Text>
          </View>
        </View>
      ))}
      {transcript.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color="#6B7280" />
          <Text style={styles.emptyTitle}>No transcript available</Text>
          <Text style={styles.emptyText}>The conversation transcript will appear here once the interview begins.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: { 
    padding: 20, 
    paddingBottom: 40,
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
    maxWidth: '85%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  userBubble: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  agentBubble: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  speakerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  agentAvatar: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  speaker: {
    fontSize: 13,
    fontWeight: '600',
  },
  userSpeaker: {
    color: 'rgba(255,255,255,0.9)',
  },
  agentSpeaker: {
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'monospace',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  agentText: {
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});


