import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAttemptFeedback } from '../../../../_queries/interviews/feedback';

const InterviewResults = () => {
  const { id, attemptId } = useLocalSearchParams<{ id: string; attemptId: string }>();
  const { data: feedback, isLoading, error } = useAttemptFeedback(attemptId);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-900/20 border-green-600/30';
    if (score >= 80) return 'bg-blue-900/20 border-blue-600/30';
    if (score >= 70) return 'bg-yellow-900/20 border-yellow-600/30';
    if (score >= 60) return 'bg-orange-900/20 border-orange-600/30';
    return 'bg-red-900/20 border-red-600/30';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Work';
    return 'Poor';
  };

  const RubricScore = ({ category, score }: { category: string; score: number }) => (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-700">
      <Text className="text-white capitalize">{category.replace('_', ' ')}</Text>
      <View className="flex-row items-center">
        <Text className={`font-bold mr-2 ${getScoreColor(score)}`}>
          {score}/100
        </Text>
        <View className="w-16 h-2 bg-gray-700 rounded-full">
          <View 
            className={`h-2 rounded-full ${
              score >= 90 ? 'bg-green-400' :
              score >= 80 ? 'bg-blue-400' :
              score >= 70 ? 'bg-yellow-400' :
              score >= 60 ? 'bg-orange-400' : 'bg-red-400'
            }`}
            style={{ width: `${score}%` }}
          />
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.spinner} />
          <Text style={styles.loadingTitle}>Analyzing your interview...</Text>
          <Text style={styles.loadingSubtitle}>This may take a few moments</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !feedback) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorSubtitle}>
            We couldn't analyze your interview. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.errorButton}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/interviews/' as any)}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interview Results</Text>
        </View>

        {/* Overall Score */}
        <View className={`rounded-lg p-6 mb-6 border ${getScoreBackground(feedback.overall_score)}`}>
          <Text className="text-white text-lg font-semibold mb-2">Overall Performance</Text>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className={`text-4xl font-bold ${getScoreColor(feedback.overall_score)}`}>
                {feedback.overall_score}
              </Text>
              <Text className="text-gray-400">out of 100</Text>
            </View>
            <View className="items-end">
              <Text className={`text-lg font-semibold ${getScoreColor(feedback.overall_score)}`}>
                {getScoreLabel(feedback.overall_score)}
              </Text>
              <Text className="text-gray-400 text-sm">Performance Level</Text>
            </View>
          </View>
        </View>

        {/* Rubric Breakdown */}
        <View className="bg-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Detailed Scores</Text>
          {Object.entries(feedback.rubric_scores).map(([category, score]) => (
            <RubricScore key={category} category={category} score={score} />
          ))}
        </View>

        {/* Strengths */}
        <View className="bg-gray-800 rounded-lg p-6 mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text className="text-white text-lg font-semibold ml-2">Strengths</Text>
          </View>
          {feedback.strengths.map((strength, index) => (
            <View key={index} className="flex-row items-start mb-3 last:mb-0">
              <Text className="text-green-400 mr-3">•</Text>
              <Text className="text-gray-300 flex-1">{strength}</Text>
            </View>
          ))}
        </View>

        {/* Areas for Improvement */}
        <View className="bg-gray-800 rounded-lg p-6 mb-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="trending-up" size={20} color="#f59e0b" />
            <Text className="text-white text-lg font-semibold ml-2">Areas for Improvement</Text>
          </View>
          {feedback.improvement_areas.map((area, index) => (
            <View key={index} className="flex-row items-start mb-3 last:mb-0">
              <Text className="text-orange-400 mr-3">•</Text>
              <Text className="text-gray-300 flex-1">{area}</Text>
            </View>
          ))}
        </View>

        {/* Detailed Feedback */}
        <View className="bg-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Detailed Feedback</Text>
          <Text className="text-gray-300 leading-6">{feedback.detailed_feedback}</Text>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3 mb-8">
          <TouchableOpacity
            onPress={() => router.push('/interviews/setup')}
            className="bg-blue-600 rounded-lg p-4 flex-row items-center justify-center"
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Practice Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push(`/interviews/${id}/details`)}
            className="bg-gray-700 rounded-lg p-4 flex-row items-center justify-center"
          >
            <Ionicons name="list" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">View All Attempts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/interviews/' as any)}
            className="bg-gray-600 rounded-lg p-4 flex-row items-center justify-center"
          >
            <Ionicons name="home" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Back to Interviews</Text>
          </TouchableOpacity>
        </View>

        {/* Tips for Improvement */}
        <View className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-8">
          <Text className="text-blue-400 font-semibold mb-2">💡 Next Steps</Text>
          <View className="space-y-1">
            <Text className="text-blue-100 text-sm">• Review the areas for improvement above</Text>
            <Text className="text-blue-100 text-sm">• Practice common questions for similar roles</Text>
            <Text className="text-blue-100 text-sm">• Work on specific technical concepts mentioned</Text>
            <Text className="text-blue-100 text-sm">• Try another practice interview to track progress</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 18,
  },
  loadingSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  errorSubtitle: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  errorButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  errorButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
});

export default InterviewResults;