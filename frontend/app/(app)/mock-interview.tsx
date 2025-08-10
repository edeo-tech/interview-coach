import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useConversation } from '@elevenlabs/react-native';

export default function MockInterview() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [interviewNotes, setInterviewNotes] = useState<string[]>([]);
    
    const topics = params.topics ? JSON.parse(params.topics as string) : [];

    const conversation = useConversation({
        onConnect: () => {
            console.log('Connected to interview AI');
            setInterviewStarted(true);
        },
        onDisconnect: () => {
            console.log('Disconnected from interview AI');
            setInterviewStarted(false);
        },
        onMessage: (message) => {
            console.log('AI Message:', message);
            if (message.type === 'transcript' && message.role === 'assistant') {
                setInterviewNotes(prev => [...prev, `AI: ${message.message}`]);
            } else if (message.type === 'transcript' && message.role === 'user') {
                setInterviewNotes(prev => [...prev, `You: ${message.message}`]);
            }
        },
        onError: (error) => console.error('Interview AI Error:', error),
        clientTools: {
            record_interview_feedback: (parameters: unknown) => {
                const feedbackParams = parameters as {
                    strengths: string[];
                    improvements: string[];
                    score: number;
                    summary: string;
                };
                console.log('Interview Feedback:', feedbackParams);
                return "Feedback recorded successfully!";
            },
            evaluate_answer: (parameters: unknown) => {
                const answerParams = parameters as {
                    question: string;
                    answer: string;
                    rating: number;
                    feedback: string;
                };
                console.log('Answer Evaluation:', answerParams);
                return "Answer evaluated!";
            },
        },
    });

    const startInterview = useCallback(async () => {
        try {
            const interviewContext = {
                company: params.companyName,
                role: params.role,
                difficulty: params.difficulty,
                topics: topics,
                instructions: `You are conducting a mock interview for ${params.role} position at ${params.companyName}. 
                Focus on these topics: ${topics.join(', ')}. 
                Difficulty level: ${params.difficulty}.
                Start with a brief introduction and then ask relevant interview questions.
                Provide constructive feedback after each answer.`
            };

            await conversation.startSession({
                agentId: process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID || 'your-agent-id-here',
                overrides: {
                    voice: {
                        stability: 0.8,
                        similarity_boost: 0.75,
                    },
                    context: interviewContext,
                },
            });
        } catch (error) {
            console.error('Failed to start interview:', error);
        }
    }, [conversation, params, topics]);

    const endInterview = useCallback(async () => {
        await conversation.endSession();
        setInterviewStarted(false);
    }, [conversation]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (interviewStarted) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [interviewStarted]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <View style={styles.headerInfo}>
                    <Text style={styles.companyName}>{params.companyName}</Text>
                    <Text style={styles.role}>{params.role}</Text>
                </View>
                {interviewStarted && (
                    <View style={styles.timer}>
                        <Ionicons name="time-outline" size={16} color="#3B82F6" />
                        <Text style={styles.timerText}>{formatDuration(duration)}</Text>
                    </View>
                )}
            </View>

            <ScrollView 
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {!interviewStarted ? (
                    <View style={styles.welcomeContainer}>
                        <Ionicons name="briefcase" size={64} color="#3B82F6" style={styles.welcomeIcon} />
                        <Text style={styles.welcomeTitle}>Ready for your interview?</Text>
                        <Text style={styles.welcomeSubtitle}>
                            This is a {params.difficulty} level interview focusing on:
                        </Text>
                        <View style={styles.topicsContainer}>
                            {topics.map((topic: string, index: number) => (
                                <View key={index} style={styles.topicBadge}>
                                    <Text style={styles.topicText}>{topic}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={styles.instructions}>
                            Press the button below to start. The AI interviewer will guide you through the process.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.interviewContainer}>
                        <Text style={styles.interviewTitle}>Interview in Progress</Text>
                        <View style={styles.notesContainer}>
                            {interviewNotes.map((note, index) => (
                                <View key={index} style={[
                                    styles.noteItem,
                                    note.startsWith('You:') ? styles.userNote : styles.aiNote
                                ]}>
                                    <Text style={styles.noteText}>{note}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <Pressable
                    style={[
                        styles.micButton,
                        conversation.status === 'connected' && styles.micButtonActive
                    ]}
                    onPress={conversation.status === 'disconnected' ? startInterview : endInterview}
                >
                    <View style={[
                        styles.micButtonInner,
                        conversation.status === 'connected' && styles.micButtonInnerActive
                    ]}>
                        <Ionicons 
                            name={conversation.status === 'connected' ? 'stop' : 'mic'} 
                            size={32} 
                            color="#fff" 
                        />
                    </View>
                </Pressable>
                <Text style={styles.statusText}>
                    {conversation.status === 'connected' ? 'Tap to end interview' : 'Tap to start interview'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
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
    },
    role: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
        marginTop: 2,
    },
    timer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    timerText: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: '#3B82F6',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
    },
    welcomeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    welcomeIcon: {
        marginBottom: 24,
    },
    welcomeTitle: {
        fontSize: 28,
        fontFamily: 'Inter_700Bold',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    welcomeSubtitle: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
        marginBottom: 16,
        textAlign: 'center',
    },
    topicsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
    },
    topicBadge: {
        backgroundColor: '#374151',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    topicText: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: '#D1D5DB',
    },
    instructions: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#9CA3AF',
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
    },
    interviewContainer: {
        flex: 1,
    },
    interviewTitle: {
        fontSize: 20,
        fontFamily: 'Inter_600SemiBold',
        color: '#fff',
        marginBottom: 16,
    },
    notesContainer: {
        flex: 1,
    },
    noteItem: {
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
    },
    userNote: {
        backgroundColor: '#1E40AF',
        alignSelf: 'flex-end',
        maxWidth: '80%',
    },
    aiNote: {
        backgroundColor: '#1a1a1a',
        alignSelf: 'flex-start',
        maxWidth: '80%',
        borderWidth: 1,
        borderColor: '#333',
    },
    noteText: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#fff',
        lineHeight: 20,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 30,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    micButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    micButtonActive: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    micButtonInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 5,
    },
    micButtonInnerActive: {
        backgroundColor: '#EF4444',
        shadowColor: '#EF4444',
    },
    statusText: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: '#6B7280',
    },
});