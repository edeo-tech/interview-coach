import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import TranscriptView from '../../../../../../components/TranscriptView';
import { useInterview } from '../../../../../../_queries/interviews/interviews';

export default function AttemptTranscriptScreen() {
  const { id, attemptId } = useLocalSearchParams<{ id: string; attemptId: string }>();
  const { data, isLoading } = useInterview(id);

  const attempt = useMemo(() => {
    const attempts = data?.attempts || [];
    return attempts.find((a: any) => a.id === attemptId || a._id === attemptId);
  }, [data, attemptId]);

  if (isLoading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transcript</Text>
      </View>
      <TranscriptView transcript={(attempt?.transcript || []) as any} />
      <View style={styles.footer}>
        <Pressable style={styles.primary} onPress={() => router.push({ pathname: '/interviews/[id]/attempts/[attemptId]/grading', params: { id, attemptId } })}>
          <Text style={styles.primaryText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  title: { color: '#fff', fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#333' },
  primary: { backgroundColor: '#3B82F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' },
});


