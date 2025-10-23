import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY } from '../constants/Typography';
import Colors from '../constants/Colors';

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
                    color={turn.role === 'user' ? Colors.white : Colors.accent.blue} 
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
          <Ionicons name="document-text-outline" size={48} color={Colors.text.muted} />
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
    backgroundColor: Colors.transparent,
  },
  contentContainer: { 
    padding: 20, // Design system screen padding
    paddingBottom: 40,
  },
  messageContainer: {
    marginBottom: 12, // Design system spacing
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  agentMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 16, // Design system card radius
    padding: 16, // Design system spacing
    borderWidth: 1,
    // Subtle shadow for depth
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  userBubble: {
    backgroundColor: Colors.glass.purple,
    borderColor: Colors.glass.purpleTint,
  },
  agentBubble: {
    backgroundColor: Colors.glass.background,
    borderColor: Colors.glass.border,
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
    borderRadius: 12, // Fully rounded
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatar: {
    backgroundColor: Colors.glass.purpleTint,
  },
  agentAvatar: {
    backgroundColor: Colors.glass.accentBlue,
  },
  speaker: {
    ...TYPOGRAPHY.labelSmall,
    fontWeight: '600',
  },
  userSpeaker: {
    color: Colors.text.secondary,
  },
  agentSpeaker: {
    color: Colors.text.primary,
  },
  timestamp: {
    ...TYPOGRAPHY.labelSmall,
    color: Colors.text.muted,
  },
  messageText: {
    ...TYPOGRAPHY.bodyMedium,
  },
  userText: {
    color: Colors.text.primary,
  },
  agentText: {
    color: Colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    ...TYPOGRAPHY.heading4,
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});


