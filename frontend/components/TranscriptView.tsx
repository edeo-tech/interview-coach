import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export type TranscriptTurn = {
  speaker: 'user' | 'agent';
  text: string;
  timestamp?: string;
};

interface TranscriptViewProps {
  transcript: TranscriptTurn[];
}

export default function TranscriptView({ transcript }: TranscriptViewProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {transcript.map((turn, idx) => (
        <View
          key={`${idx}-${turn.timestamp || idx}`}
          style={[styles.bubble, turn.speaker === 'user' ? styles.userBubble : styles.agentBubble]}
        >
          <Text style={styles.speaker}>{turn.speaker === 'user' ? 'You' : 'AI'}</Text>
          <Text style={styles.text}>{turn.text}</Text>
          {!!turn.timestamp && (
            <Text style={styles.timestamp}>{new Date(turn.timestamp).toLocaleTimeString()}</Text>
          )}
        </View>
      ))}
      {transcript.length === 0 && (
        <View style={styles.emptyState}><Text style={styles.emptyText}>No transcript yet.</Text></View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16, gap: 12 },
  bubble: { maxWidth: '85%', padding: 12, borderRadius: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#1E40AF' },
  agentBubble: { alignSelf: 'flex-start', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333' },
  speaker: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  text: { fontSize: 14, color: '#fff', lineHeight: 20 },
  timestamp: { fontSize: 10, color: '#6B7280', marginTop: 6 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#6B7280' },
});


