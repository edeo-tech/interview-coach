import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInterviews } from '../../../_queries/interviews/interviews';
import { useCV } from '../../../_queries/interviews/cv';

const InterviewsHome = () => {
  const { data: interviews, isLoading: interviewsLoading } = useInterviews();
  const { data: cv } = useCV();

  const handleStartNewInterview = () => {
    if (!cv) {
      Alert.alert(
        'CV Required',
        'Please upload your CV first to create interview sessions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upload CV', onPress: () => router.push('/interviews/cv-upload') }
        ]
      );
      return;
    }
    
    router.push('/interviews/setup');
  };

  const handleInterviewPress = (interviewId: string) => {
    router.push(`/interviews/${interviewId}/details` as any);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'junior': return 'text-green-400';
      case 'mid': return 'text-yellow-400';
      case 'senior': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'technical': return 'code';
      case 'behavioral': return 'people';
      case 'leadership': return 'trending-up';
      default: return 'chatbubble';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row justify-between items-center py-6">
          <View>
            <Text className="text-white text-2xl font-bold">Interviews</Text>
            <Text className="text-gray-400 text-sm mt-1">
              Practice with AI-powered mock interviews
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => router.push('/interviews/cv-upload')}
            className="bg-gray-800 p-3 rounded-full"
          >
            <Ionicons name="document-text" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* CV Status */}
        {!cv && (
          <View className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="warning" size={20} color="#fbbf24" />
              <Text className="text-yellow-400 font-medium ml-2">CV Required</Text>
            </View>
            <Text className="text-gray-300 mt-2 text-sm">
              Upload your CV to get personalized interview questions and feedback.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/interviews/cv-upload')}
              className="mt-3"
            >
              <Text className="text-yellow-400 font-medium">Upload CV →</Text>
            </TouchableOpacity>
          </View>
        )}

        {cv && (
          <View className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text className="text-green-400 font-medium ml-2">CV Ready</Text>
            </View>
            <Text className="text-gray-300 mt-1 text-sm">
              {cv.skills.length} skills • {cv.experience_years} years experience
            </Text>
          </View>
        )}

        {/* New Interview Button */}
        <TouchableOpacity
          onPress={handleStartNewInterview}
          className="bg-blue-600 rounded-lg p-4 mb-6 flex-row items-center justify-center"
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text className="text-white font-semibold ml-2 text-lg">
            Start New Interview
          </Text>
        </TouchableOpacity>

        {/* Recent Interviews */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Recent Interviews
          </Text>
          
          {interviewsLoading ? (
            <View className="bg-gray-800 rounded-lg p-6 items-center">
              <Text className="text-gray-400">Loading interviews...</Text>
            </View>
          ) : !interviews || interviews.length === 0 ? (
            <View className="bg-gray-800 rounded-lg p-6 items-center">
              <Ionicons name="chatbubble-outline" size={48} color="#6b7280" />
              <Text className="text-gray-400 text-lg font-medium mt-4">
                No interviews yet
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                Start your first mock interview to begin practicing
              </Text>
            </View>
          ) : (
            interviews.map((interview) => (
              <TouchableOpacity
                key={interview._id}
                onPress={() => handleInterviewPress(interview._id)}
                className="bg-gray-800 rounded-lg p-4 mb-3"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Ionicons 
                        name={getInterviewTypeIcon(interview.interview_type) as any}
                        size={16} 
                        color="#9ca3af" 
                      />
                      <Text className="text-white font-semibold ml-2">
                        {interview.role_title}
                      </Text>
                    </View>
                    
                    <Text className="text-gray-300 mb-1">
                      {interview.company}
                    </Text>
                    
                    <View className="flex-row items-center">
                      <Text className={`text-sm font-medium capitalize ${getDifficultyColor(interview.difficulty)}`}>
                        {interview.difficulty}
                      </Text>
                      <Text className="text-gray-500 text-sm ml-2">•</Text>
                      <Text className="text-gray-500 text-sm ml-2 capitalize">
                        {interview.interview_type}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="items-end">
                    <Text className="text-gray-500 text-xs">
                      {formatDate(interview.created_at)}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InterviewsHome;