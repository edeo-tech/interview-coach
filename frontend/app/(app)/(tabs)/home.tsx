import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { mockInterviewCards } from '@/data/mockInterviews';
import { InterviewCard } from '@/_interfaces/interviews/interview';

const InterviewCardComponent = ({ interview, onPress }: { interview: InterviewCard; onPress: () => void }) => {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return '#10B981';
            case 'Medium': return '#F59E0B';
            case 'Hard': return '#EF4444';
            default: return '#6B7280';
        }
    };

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View style={styles.cardHeader}>
                <Image source={{ uri: interview.companyLogo }} style={styles.companyLogo} />
                <View style={styles.headerInfo}>
                    <Text style={styles.companyName}>{interview.companyName}</Text>
                    <Text style={styles.role}>{interview.role}</Text>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(interview.difficulty) }]}>
                    <Text style={styles.difficultyText}>{interview.difficulty}</Text>
                </View>
            </View>
            
            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Ionicons name="layers-outline" size={20} color="#6B7280" />
                    <Text style={styles.statLabel}>Attempts</Text>
                    <Text style={styles.statValue}>{interview.attempts}</Text>
                </View>
                
                <View style={styles.stat}>
                    <Ionicons name="trending-up-outline" size={20} color="#6B7280" />
                    <Text style={styles.statLabel}>Avg Score</Text>
                    <Text style={styles.statValue}>
                        {interview.attempts > 0 ? `${interview.averageScore}%` : 'N/A'}
                    </Text>
                </View>
                
                <View style={styles.stat}>
                    <Ionicons name="time-outline" size={20} color="#6B7280" />
                    <Text style={styles.statLabel}>Duration</Text>
                    <Text style={styles.statValue}>{interview.duration}m</Text>
                </View>
            </View>
            
            <View style={styles.topicsContainer}>
                {interview.topics.slice(0, 3).map((topic, index) => (
                    <View key={index} style={styles.topicBadge}>
                        <Text style={styles.topicText}>{topic}</Text>
                    </View>
                ))}
            </View>
        </Pressable>
    );
};

export default function Home() {
    const router = useRouter();

    const handleCardPress = (interview: InterviewCard) => {
        router.push({
            pathname: '/mock-interview',
            params: {
                interviewId: interview.id,
                companyName: interview.companyName,
                role: interview.role,
                difficulty: interview.difficulty,
                topics: JSON.stringify(interview.topics),
            }
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Practice Interviews</Text>
                    <Text style={styles.headerSubtitle}>Select a company to start practicing</Text>
                </View>

                {mockInterviewCards.map((interview) => (
                    <InterviewCardComponent
                        key={interview.id}
                        interview={interview}
                        onPress={() => handleCardPress(interview)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        padding: 20,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: 'Inter_700Bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
    },
    card: {
        backgroundColor: '#1a1a1a',
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    companyLogo: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#fff',
        padding: 8,
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    companyName: {
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
        color: '#fff',
        marginBottom: 2,
    },
    role: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#9CA3AF',
    },
    difficultyBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    difficultyText: {
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
        color: '#fff',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    stat: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
        marginTop: 4,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: '#fff',
    },
    topicsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    topicBadge: {
        backgroundColor: '#374151',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    topicText: {
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
        color: '#D1D5DB',
    },
});