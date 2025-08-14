import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInterviews } from '../../../_queries/interviews/interviews';
import { useCV } from '../../../_queries/interviews/cv';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';
import ChatGPTBackground from '../../../components/ChatGPTBackground';

const InterviewsHome = () => {
  const { data: interviews, isLoading: interviewsLoading } = useInterviews();
  const { data: cv } = useCV();
  const { posthogScreen } = usePosthogSafely();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('interviews_list');
    }, [posthogScreen])
  );

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
    <ChatGPTBackground style={{flex: 1}}>
      <SafeAreaView className="flex-1">
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
              <Text className="text-green-400 font-medium ml-2">Your CV</Text>
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
                style={styles.interviewCard}
              >
                <View style={styles.interviewCardContent}>
                  <View style={styles.interviewCardLeft}>
                    {interview.company_logo_url ? (
                      <Image 
                        source={{ uri: interview.company_logo_url }}
                        style={styles.companyLogo}
                      />
                    ) : (
                      <View style={styles.logoPlaceholder}>
                        <Ionicons 
                          name={getInterviewTypeIcon(interview.interview_type) as any}
                          size={20} 
                          color="#9ca3af" 
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.interviewCardRight}>
                    <View style={styles.interviewHeader}>
                      <Ionicons 
                        name={getInterviewTypeIcon(interview.interview_type) as any}
                        size={16} 
                        color="#9ca3af" 
                      />
                      <Text style={styles.roleTitle}>
                        {interview.role_title}
                      </Text>
                    </View>
                    
                    <Text style={styles.companyName}>
                      {interview.company}
                    </Text>
                    
                    <View style={styles.metaRow}>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(interview.difficulty) === 'text-green-400' ? '#10b981' : getDifficultyColor(interview.difficulty) === 'text-yellow-400' ? '#f59e0b' : getDifficultyColor(interview.difficulty) === 'text-red-400' ? '#ef4444' : '#6b7280' }]}>
                        {interview.difficulty}
                      </Text>
                      <Text style={styles.separator}>•</Text>
                      <Text style={styles.typeText}>
                        {interview.interview_type}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>
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
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  interviewCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  interviewCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  interviewCardLeft: {
    marginRight: 12,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  interviewCardRight: {
    flex: 1,
  },
  interviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  companyName: {
    color: '#d1d5db',
    fontSize: 14,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  separator: {
    color: '#6b7280',
    fontSize: 12,
    marginHorizontal: 8,
  },
  typeText: {
    color: '#6b7280',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    color: '#6b7280',
    fontSize: 11,
    marginBottom: 4,
  },
});

export default InterviewsHome;