import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInterviews } from '../../../_queries/interviews/interviews';
import { useCV } from '../../../_queries/interviews/cv';

export default function Home() {
  const { data: interviews, isLoading: interviewsLoading } = useInterviews();
  const { data: cv } = useCV();

  const handleCreateNewInterview = () => {
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
    
    router.push('/interviews/create');
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
      case 'junior': return '#10b981';
      case 'mid': return '#f59e0b';
      case 'senior': return '#ef4444';
      default: return '#6b7280';
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Interviews</Text>
            <Text style={styles.headerSubtitle}>
              Practice with AI-powered mock interviews
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => router.push('/interviews/cv-upload')}
            style={styles.headerButton}
          >
            <Ionicons name="document-text" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* CV Status */}
        {!cv && (
          <View style={[styles.statusCard, styles.warningCard]}>
            <View style={styles.statusHeader}>
              <Ionicons name="warning" size={20} color="#fbbf24" />
              <Text style={styles.warningTitle}>CV Required</Text>
            </View>
            <Text style={styles.statusDescription}>
              Upload your CV to get personalized interview questions and feedback.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/interviews/cv-upload')}
              style={styles.statusAction}
            >
              <Text style={styles.warningAction}>Upload CV →</Text>
            </TouchableOpacity>
          </View>
        )}

        {cv && (
          <View style={[styles.statusCard, styles.successCard]}>
            <View style={styles.statusHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.successTitle}>CV Ready</Text>
            </View>
            <Text style={styles.statusDescription}>
              {cv.skills.length} skills • {cv.experience_years} years experience
            </Text>
          </View>
        )}

        {/* New Interview Button */}
        <TouchableOpacity
          onPress={handleCreateNewInterview}
          style={styles.newInterviewButton}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.newInterviewText}>
            Create New Interview
          </Text>
        </TouchableOpacity>

        {/* Recent Interviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recent Interviews
          </Text>
          
          {interviewsLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading interviews...</Text>
            </View>
          ) : !interviews || interviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={48} color="#6b7280" />
              <Text style={styles.emptyStateTitle}>
                No interviews yet
              </Text>
              <Text style={styles.emptyStateSubtitle}>
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
                    <View style={styles.interviewCardHeader}>
                      <Ionicons 
                        name={getInterviewTypeIcon(interview.interview_type) as any}
                        size={16} 
                        color="#9ca3af" 
                      />
                      <Text style={styles.interviewTitle}>
                        {interview.role_title}
                      </Text>
                    </View>
                    
                    <Text style={styles.interviewCompany}>
                      {interview.company}
                    </Text>
                    
                    <View style={styles.interviewLocation}>
                      <Ionicons name="location-outline" size={12} color="#6b7280" />
                      <Text style={styles.locationText}>
                        {interview.location || 'Remote'}
                      </Text>
                    </View>
                    
                    <View style={styles.interviewMeta}>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(interview.difficulty) }]}>
                        {interview.experience_level || interview.difficulty}
                      </Text>
                      <Text style={styles.metaSeparator}>•</Text>
                      <Text style={styles.interviewType}>
                        {interview.employment_type || 'Full-time'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.interviewCardRight}>
                    <Text style={styles.interviewDate}>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  headerButton: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 50,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  warningCard: {
    backgroundColor: 'rgba(146, 64, 14, 0.2)',
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  successCard: {
    backgroundColor: 'rgba(5, 46, 22, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningTitle: {
    color: '#fbbf24',
    fontWeight: '600',
    marginLeft: 8,
  },
  successTitle: {
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 8,
  },
  statusDescription: {
    color: '#d1d5db',
    fontSize: 14,
    marginTop: 8,
  },
  statusAction: {
    marginTop: 12,
  },
  warningAction: {
    color: '#fbbf24',
    fontWeight: '600',
  },
  newInterviewButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newInterviewText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#9ca3af',
  },
  emptyStateTitle: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  interviewCard: {
    backgroundColor: '#374151',
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
    flex: 1,
  },
  interviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  interviewTitle: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  interviewCompany: {
    color: '#d1d5db',
    marginBottom: 4,
  },
  interviewLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    color: '#6b7280',
    fontSize: 12,
    marginLeft: 4,
  },
  interviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  metaSeparator: {
    color: '#6b7280',
    fontSize: 12,
    marginHorizontal: 8,
  },
  interviewType: {
    color: '#6b7280',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  interviewCardRight: {
    alignItems: 'flex-end',
  },
  interviewDate: {
    color: '#6b7280',
    fontSize: 12,
  },
});

