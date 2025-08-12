import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCV } from '../../_queries/interviews/cv';
import { useAuth } from '../../context/authentication/AuthContext';
import MockInterviewConversation from '../../components/MockInterviewConversation';

export default function MockInterview() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [callState, setCallState] = useState<'incoming' | 'connecting' | 'active' | 'ended'>(
        params.callState as 'incoming' || 'incoming'
    );
    const [duration, setDuration] = useState(0);
    const [interviewNotes, setInterviewNotes] = useState<string[]>([]);
    
    // Fetch user data and CV
    const { auth } = useAuth();
    const { data: cvProfile } = useCV();
    
    const topics = params.topics ? JSON.parse(params.topics as string) : [];
    
    // Generate random interviewer profile
    const interviewerProfiles = [
        { name: 'Sarah Chen', avatar: '👩‍💼', role: 'Senior Engineering Manager' },
        { name: 'Marcus Johnson', avatar: '👨‍💼', role: 'Technical Lead' },
        { name: 'Elena Rodriguez', avatar: '👩‍💼', role: 'Principal Engineer' },
        { name: 'David Kim', avatar: '👨‍💼', role: 'Engineering Director' },
        { name: 'Priya Patel', avatar: '👩‍💼', role: 'Staff Software Engineer' },
        { name: 'Alex Thompson', avatar: '👨‍💼', role: 'Head of Engineering' }
    ];
    
    const [interviewer] = useState(() => {
        const randomIndex = Math.floor(Math.random() * interviewerProfiles.length);
        return interviewerProfiles[randomIndex];
    });

    const conversationConfig = useMemo(() => ({
        onConnect: () => {
            console.log('🎤 Connected to interview AI successfully');
            setCallState('active');
            
            // Set a timeout to check if AI speaks within 10 seconds
            setTimeout(() => {
                console.log('⏰ 10 seconds passed since connection - checking if AI has spoken...');
                if (interviewNotes.length === 0) {
                    console.log('⚠️ AI has not spoken yet after 10 seconds');
                }
            }, 10000);
        },
        onDisconnect: () => {
            console.log('🔌 Disconnected from interview AI');
            // Don't automatically change state - let the user control ending
            console.log('ℹ️ Connection ended, but not changing UI state automatically');
        },
        onMessage: (message: any) => {
            console.log('📝 AI Message received:', JSON.stringify(message, null, 2));
            
            // Handle different message types based on ElevenLabs SDK structure
            if (message.message && typeof message.message === 'object') {
                const msg = message.message as any;
                
                console.log('🔍 Message type:', msg.type);
                console.log('🔍 Message source:', message.source);
                
                // Handle conversation initiation
                if (msg.type === 'conversation_initiation_metadata') {
                    console.log('✅ Conversation initiated, waiting for AI to speak...');
                    
                    // Try sending an initial message to trigger AI response
                    setTimeout(() => {
                        console.log('🚀 Sending initial trigger message to start conversation...');
                        // This might trigger the AI to start speaking
                        // Some agents need a user input first
                    }, 2000);
                    
                    return;
                }
                
                // Handle transcript messages
                if (msg.type === 'transcript' || msg.type === 'agent_response') {
                    if (message.source === 'ai') {
                        const text = msg.text || msg.content || msg.message || '';
                        console.log('🎤 AI spoke:', text);
                        setInterviewNotes(prev => [...prev, `AI: ${text}`]);
                    } else if (message.source === 'user') {
                        const text = msg.text || msg.content || msg.message || '';
                        console.log('🎙️ User spoke:', text);
                        setInterviewNotes(prev => [...prev, `You: ${text}`]);
                    }
                }
                
                // Handle any other message types
                console.log('🔍 All message properties:', Object.keys(msg));
            } else {
                console.log('⚠️ Unexpected message format:', message);
            }
        },
        onError: (error: any) => {
            console.error('❌ Interview AI Error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            setCallState('incoming'); // Reset to incoming state on error
        },
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
    }), [interviewNotes.length]);

    const buildInterviewPrompt = useCallback(() => {
        const userName = auth?.name || 'Candidate';
        const userSkills = cvProfile?.skills?.join(', ') || 'Not specified';
        const experienceYears = cvProfile?.experience_years || 0;
        const cvSummary = cvProfile?.raw_text?.substring(0, 800) || 'No CV available';
        
        return `You are ${interviewer.name}, a ${interviewer.role} conducting a mock interview for a ${params.role} position at ${params.companyName}.

CANDIDATE INFORMATION:
- Name: ${userName}
- Experience Level: ${experienceYears} years
- Key Skills: ${userSkills}
- CV Summary: ${cvSummary}

JOB DETAILS:
- Company: ${params.companyName}
- Role: ${params.role}
- Difficulty Level: ${params.difficulty}
- Focus Areas: ${topics.join(', ')}

INTERVIEW GUIDELINES:
1. You are a professional, experienced interviewer conducting a supportive interview
2. Start with a warm greeting: "Hello ${userName}, I'm ${interviewer.name}, and I'm excited to interview you today for the ${params.role} position at ${params.companyName}."
3. Ask relevant questions based on the candidate's background and the role requirements
4. Ask ONE question at a time and wait for responses
5. Adapt questions based on their experience level (${experienceYears} years) and skills
6. Focus on topics: ${topics.join(', ')}
7. Be encouraging but thorough - if they struggle, provide gentle guidance
8. After 8-10 questions, provide brief feedback and wrap up gracefully
9. Maintain a conversational, professional tone throughout

Remember: This is a practice interview to help ${userName} improve their interview skills. Be supportive while maintaining interview realism.`;
    }, [auth, cvProfile, interviewer, params, topics]);

    const acceptCall = useCallback(async (conversation: any) => {
        setCallState('connecting');
        
        const agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID;
        console.log('🚀 Starting interview session...');
        console.log('Agent ID:', agentId || 'NOT SET');
        console.log('Auth user:', auth?.name || 'Anonymous');
        console.log('Interview params:', {
            role: params.role,
            company: params.companyName,
            difficulty: params.difficulty
        });

        if (!agentId || agentId === 'your-agent-id-here') {
            console.error('❌ No valid ElevenLabs Agent ID configured!');
            console.error('Please set EXPO_PUBLIC_ELEVENLABS_AGENT_ID in your environment');
            setCallState('incoming');
            return;
        }

        try {
            const prompt = buildInterviewPrompt();
            console.log('📋 Built interview prompt length:', prompt.length);
            
            // Try without prompt override first to see if agent speaks
            const sessionConfig = {
                agentId: agentId,
                // Temporarily comment out overrides to test basic agent functionality
                // overrides: {
                //     agent: {
                //         prompt: {
                //             prompt: prompt
                //         }
                //     }
                // },
                dynamicVariables: {
                    candidate_name: auth?.name || 'Candidate',
                    job_title: params.role as string,
                    company: params.companyName as string
                }
            };

            console.log('🔧 Session config:', JSON.stringify(sessionConfig, null, 2));
            console.log('⏳ Calling conversation.startSession...');
            
            await conversation.startSession(sessionConfig);
            console.log('✅ conversation.startSession completed successfully');
            console.log('ℹ️ Expecting AI to start speaking shortly with greeting...');
            
        } catch (error) {
            console.error('❌ Failed to start interview session:', error);
            console.error('Error type:', typeof error);
            console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
            setCallState('incoming'); // Reset to incoming state on error
        }
    }, [buildInterviewPrompt, auth, params]);

    const declineCall = useCallback(() => {
        setCallState('ended');
        router.back();
    }, [router]);

    const endInterview = useCallback(async (conversation: any) => {
        console.log('🛑 Ending interview session...');
        try {
            await conversation.endSession();
            console.log('✅ Interview session ended successfully');
            setCallState('ended');
        } catch (error) {
            console.error('❌ Error ending interview session:', error);
            setCallState('ended'); // Force end even if there's an error
        }
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (callState === 'active') {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [callState]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <MockInterviewConversation config={conversationConfig}>
            {(conversation) => (
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Pressable style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </Pressable>
                        <View style={styles.headerInfo}>
                            <Text style={styles.companyName}>{params.companyName}</Text>
                            <Text style={styles.role}>{params.role}</Text>
                        </View>
                        {callState === 'active' && (
                            <View style={styles.timer}>
                                <Ionicons name="time-outline" size={16} color="#3B82F6" />
                                <Text style={styles.timerText}>{formatDuration(duration)}</Text>
                            </View>
                        )}
                        {callState === 'incoming' && (
                            <View style={styles.incomingIndicator}>
                                <Ionicons name="call" size={16} color="#10B981" />
                                <Text style={styles.incomingText}>Incoming</Text>
                            </View>
                        )}
                        {callState === 'connecting' && (
                            <View style={styles.connectingIndicator}>
                                <Ionicons name="time-outline" size={16} color="#F59E0B" />
                                <Text style={styles.connectingText}>Connecting...</Text>
                            </View>
                        )}
                    </View>

                    <ScrollView 
                        style={styles.content}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {callState === 'incoming' && (
                            <View style={styles.incomingCallContainer}>
                                <View style={styles.interviewerProfile}>
                                    <Text style={styles.interviewerAvatar}>{interviewer.avatar}</Text>
                                    <Text style={styles.interviewerName}>{interviewer.name}</Text>
                                    <Text style={styles.interviewerRole}>{interviewer.role}</Text>
                                    <Text style={styles.interviewerCompany}>@ {params.companyName}</Text>
                                </View>
                                
                                <Text style={styles.incomingCallTitle}>Incoming Interview Call</Text>
                                <Text style={styles.incomingCallSubtitle}>
                                    {interviewer.name} is calling to start your {params.difficulty} level interview
                                </Text>
                                
                                <View style={styles.topicsContainer}>
                                    {topics.map((topic: string, index: number) => (
                                        <View key={index} style={styles.topicBadge}>
                                            <Text style={styles.topicText}>{topic}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {callState === 'connecting' && (
                            <View style={styles.connectingContainer}>
                                <View style={styles.interviewerProfileSmall}>
                                    <Text style={styles.interviewerAvatarSmall}>{interviewer.avatar}</Text>
                                    <View style={styles.interviewerInfoSmall}>
                                        <Text style={styles.interviewerNameSmall}>{interviewer.name}</Text>
                                        <Text style={styles.interviewerRoleSmall}>{interviewer.role}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.connectingStatus}>
                                    <View style={styles.spinner} />
                                    <Text style={styles.connectingText}>Connecting to {interviewer.name}...</Text>
                                </View>
                            </View>
                        )}

                        {callState === 'active' && (
                            <View style={styles.interviewContainer}>
                                {/* Call Screen Header */}
                                <View style={styles.callHeader}>
                                    <View style={styles.interviewerProfileSmall}>
                                        <Text style={styles.interviewerAvatarSmall}>{interviewer.avatar}</Text>
                                        <View style={styles.interviewerInfoSmall}>
                                            <Text style={styles.interviewerNameSmall}>{interviewer.name}</Text>
                                            <Text style={styles.interviewerRoleSmall}>{interviewer.role}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.callStatus}>
                                        <View style={styles.recordingIndicator} />
                                        <Text style={styles.callStatusText}>Recording</Text>
                                    </View>
                                </View>

                                {/* Transcript/Notes */}
                                <View style={styles.notesContainer}>
                                    {interviewNotes.map((note, index) => (
                                        <View key={index} style={[
                                            styles.noteItem,
                                            note.startsWith('You:') ? styles.userNote : styles.aiNote
                                        ]}>
                                            <Text style={styles.noteText}>{note}</Text>
                                        </View>
                                    ))}
                                    {interviewNotes.length === 0 && (
                                        <View style={styles.emptyNotes}>
                                            <Text style={styles.emptyNotesText}>
                                                Interview will start momentarily...
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        {callState === 'ended' && (
                            <View style={styles.endedContainer}>
                                <Ionicons name="checkmark-circle" size={64} color="#10B981" />
                                <Text style={styles.endedTitle}>Interview Complete</Text>
                                <Text style={styles.endedSubtitle}>
                                    Thank you for completing your interview with {interviewer.name}
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.footer}>
                        {callState === 'incoming' && (
                            <View style={styles.incomingCallButtons}>
                                <Pressable
                                    style={[styles.callActionButton, styles.declineButton]}
                                    onPress={declineCall}
                                >
                                    <Ionicons name="call" size={28} color="#fff" />
                                </Pressable>
                                
                                <Pressable
                                    style={[styles.callActionButton, styles.acceptButton]}
                                    onPress={() => acceptCall(conversation)}
                                >
                                    <Ionicons name="call" size={28} color="#fff" />
                                </Pressable>
                            </View>
                        )}

                        {callState === 'connecting' && (
                            <View style={styles.connectingFooter}>
                                <Text style={styles.statusText}>Connecting...</Text>
                            </View>
                        )}

                        {callState === 'active' && (
                            <>
                                <View style={styles.callControls}>
                                    <Pressable
                                        style={[styles.callControlButton, styles.muteButton]}
                                        onPress={() => {/* Handle mute */}}
                                    >
                                        <Ionicons name="mic-off" size={24} color="#fff" />
                                    </Pressable>
                                    
                                    <Pressable
                                        style={[styles.callControlButton, styles.endCallButton]}
                                        onPress={() => endInterview(conversation)}
                                    >
                                        <Ionicons name="call" size={28} color="#fff" />
                                    </Pressable>
                                    
                                    <Pressable
                                        style={[styles.callControlButton, styles.speakerButton]}
                                        onPress={() => {/* Handle speaker */}}
                                    >
                                        <Ionicons name="volume-high" size={24} color="#fff" />
                                    </Pressable>
                                </View>
                                
                                <Text style={styles.statusText}>
                                    Tap the red button to end the interview
                                </Text>
                            </>
                        )}

                        {callState === 'ended' && (
                            <Pressable
                                style={styles.backToMenuButton}
                                onPress={() => router.back()}
                            >
                                <Text style={styles.backToMenuText}>Back to Interview Details</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            )}
        </MockInterviewConversation>
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
    incomingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    incomingText: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: '#10B981',
    },
    connectingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    connectingText: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: '#F59E0B',
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
    incomingCallContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    incomingCallTitle: {
        fontSize: 28,
        fontFamily: 'Inter_700Bold',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    incomingCallSubtitle: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
        marginBottom: 24,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    connectingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    connectingStatus: {
        alignItems: 'center',
        marginTop: 32,
    },
    spinner: {
        width: 32,
        height: 32,
        borderWidth: 3,
        borderColor: '#F59E0B',
        borderTopColor: 'transparent',
        borderRadius: 16,
        marginBottom: 16,
    },
    endedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    endedTitle: {
        fontSize: 24,
        fontFamily: 'Inter_700Bold',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    endedSubtitle: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    interviewerProfile: {
        alignItems: 'center',
        marginBottom: 32,
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#333',
    },
    interviewerAvatar: {
        fontSize: 64,
        marginBottom: 12,
    },
    interviewerName: {
        fontSize: 20,
        fontFamily: 'Inter_600SemiBold',
        color: '#fff',
        marginBottom: 4,
    },
    interviewerRole: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#9CA3AF',
        marginBottom: 4,
    },
    interviewerCompany: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
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
    callHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        marginBottom: 16,
    },
    interviewerProfileSmall: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    interviewerAvatarSmall: {
        fontSize: 40,
        marginRight: 12,
    },
    interviewerInfoSmall: {
        flex: 1,
    },
    interviewerNameSmall: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: '#fff',
    },
    interviewerRoleSmall: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: '#9CA3AF',
        marginTop: 2,
    },
    callStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recordingIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        marginRight: 6,
    },
    callStatusText: {
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
        color: '#EF4444',
    },
    notesContainer: {
        flex: 1,
    },
    emptyNotes: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyNotesText: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
        textAlign: 'center',
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
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 30,
        marginBottom: 16,
        gap: 8,
    },
    startButtonText: {
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
        color: '#fff',
    },
    callControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        marginBottom: 16,
    },
    callControlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    muteButton: {
        backgroundColor: '#374151',
    },
    endCallButton: {
        backgroundColor: '#EF4444',
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    speakerButton: {
        backgroundColor: '#374151',
    },
    incomingCallButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 80,
        marginBottom: 16,
    },
    callActionButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptButton: {
        backgroundColor: '#10B981',
    },
    declineButton: {
        backgroundColor: '#EF4444',
        transform: [{ rotate: '135deg' }],
    },
    connectingFooter: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    backToMenuButton: {
        backgroundColor: '#374151',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    backToMenuText: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: '#fff',
    },
    statusText: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: '#6B7280',
    },
});