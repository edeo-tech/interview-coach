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
                    color={turn.role === 'user' ? '#FFFFFF' : '#60A5FA'} 
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
          <Ionicons name="document-text-outline" size={48} color="rgba(255, 255, 255, 0.55)" />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  userBubble: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)', // Purple glass
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  agentBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // Glass background
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    backgroundColor: 'rgba(168, 85, 247, 0.25)', // Purple tint
  },
  agentAvatar: {
    backgroundColor: 'rgba(96, 165, 250, 0.20)', // Accent blue tint
  },
  speaker: {
    fontSize: 12, // Design system label medium
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  userSpeaker: {
    color: 'rgba(255, 255, 255, 0.85)', // Text secondary
  },
  agentSpeaker: {
    color: '#FFFFFF', // Text primary
  },
  timestamp: {
    fontSize: 12, // Label small per design system
    color: 'rgba(255, 255, 255, 0.55)', // Text muted
    fontFamily: 'Inter',
  },
  messageText: {
    fontSize: 16, // Body medium
    lineHeight: 24, // Body medium line height
    fontFamily: 'Inter',
  },
  userText: {
    color: '#FFFFFF', // Text primary on purple glass
  },
  agentText: {
    color: '#FFFFFF', // Text primary on glass
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#FFFFFF', // Text primary
    fontSize: 18, // Heading h5
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.70)', // Text tertiary
    fontSize: 14, // Body small
    textAlign: 'center',
    lineHeight: 20, // Body small line height
    fontFamily: 'Inter',
  },
});


