import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAttemptFeedback } from '../../../../../../_queries/interviews/feedback';

export default function AttemptGradingScreen() {
  const { id, attemptId } = useLocalSearchParams<{ id: string; attemptId: string }>();
  const { data, isLoading, isFetching } = useAttemptFeedback(attemptId, { refetchInterval: (data) => (!data ? 2000 : false) });

  const loading = isLoading || (!data && isFetching);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Grading</Text>
      </View>
      {loading ? (
        <View style={styles.center}> 
          <ActivityIndicator color="#3B82F6" />
          <Text style={styles.subtle}>Evaluating your interview…</Text>
        </View>
      ) : data ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View style={styles.card}>
            <Text style={styles.score}>{data.overall_score}</Text>
            <Text style={styles.subtle}>Overall score</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Strengths</Text>
            {data.strengths.map((s, i) => (
              <Text key={i} style={styles.item}>• {s}</Text>
            ))}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Areas to improve</Text>
            {data.improvement_areas.map((s, i) => (
              <Text key={i} style={styles.item}>• {s}</Text>
            ))}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Detailed feedback</Text>
            <Text style={styles.item}>{data.detailed_feedback}</Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.center}><Text style={styles.subtle}>No feedback yet.</Text></View>
      )}
      <View style={styles.footer}>
        <Pressable style={styles.primary} onPress={() => router.replace({ pathname: '/interviews/[id]/details', params: { id } })}>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  subtle: { color: '#9CA3AF', marginTop: 8 },
  card: { backgroundColor: '#111', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 16 },
  cardTitle: { color: '#fff', fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
  item: { color: '#D1D5DB', lineHeight: 20 },
  score: { color: '#3B82F6', fontSize: 48, fontFamily: 'Inter_700Bold' }
});


