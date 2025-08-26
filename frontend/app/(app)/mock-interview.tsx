import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated, PanResponder, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';
import { useCV } from '../../_queries/interviews/cv';
import { useStartAttempt, useAddTranscript, useFinishAttempt, useInterview } from '../../_queries/interviews/interviews';
import { useAuth } from '../../context/authentication/AuthContext';
import MockInterviewConversation from '../../components/MockInterviewConversation';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../hooks/haptics/useHapticsSafely';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import { GlassStyles, GlassTextColors } from '../../constants/GlassStyles';
import { InterviewType } from '../../_interfaces/interviews/interview-types';

const { width: screenWidth } = Dimensions.get('window');

// Agent interview link data
const AGENT_INTERVIEW_LINK = {
    "phone_screen": {
        "name": "Niamh Morissey",
        "agent_id": "agent_3201k2d96cp0fv7rvw0j3nbe3fd6",
        "profile_picture": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    "initial_hr_interview": {
        "name": "Sam Tyldesley",
        "agent_id": "agent_9101k2qdcg74f6bteqwe4y2se5ct",
        "profile_picture": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    "mock_sales_call": {
        "name": "Jane Smith",
        "agent_id": "agent_5701k3kk62prf8b9f2cnrdbtwghz",
        "profile_picture": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    "presentation_pitch": {
        "name": "Paddy Beaumont",
        "agent_id": "agent_9901k3kkamqwekbvd26e4hf2g4td",
        "profile_picture": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    "technical_screening_call": {
        "name": "Louise O'Brien",
        "agent_id": "agent_3801k3kkcnpvfenvzpzbkfxcxr1x",
        "profile_picture": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    "system_design_interview": {
        "name": "Daniel Jones",
        "agent_id": "agent_4801k3kkeazve138emwhjrnqmg0p",
        "profile_picture": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    "portfolio_review": {
        "name": "Ruby Galloway",
        "agent_id": "agent_9101k3kkfyv6e21ry5rmsf6w4p7q",
        "profile_picture": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    "case_study": {
        "name": "Conor Duffy",
        "agent_id": "agent_6501k3kkhnqmf098ndn7bgvath91",
        "profile_picture": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    "behavioral_interview": {
        "name": "Brenda Newman",
        "agent_id": "agent_0501k3kkksrkewj9mhys46xvtq50",
        "profile_picture": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    "values_interview": {
        "name": "Victor Phelps",
        "agent_id": "agent_2701k3kkp3w4ec99d0pvsxdx41gn",
        "profile_picture": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    "team_fit_interview": {
        "name": "Fran Haines",
        "agent_id": "agent_9501k3kkq19hedptvztph0k5p1e3",
        "profile_picture": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    "interview_with_business_partner_client_stakeholder": {
        "name": "John McGrath",
        "agent_id": "agent_2601k3km0bxbe62aness666ye02n",
        "profile_picture": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format"
    },
    "executive_leadership_round": {
        "name": "Ethan Ford",
        "agent_id": "agent_5201k3km2snnffbv0qtmfbxhd6p1",
        "profile_picture": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format"
    }
};

// Function to map InterviewType enum to JSON keys
function getInterviewTypeKey(interviewType: string): string {
    const typeMapping: { [key: string]: string } = {
        [InterviewType.PhoneScreen]: "phone_screen",
        [InterviewType.InitialHRInterview]: "initial_hr_interview",
        [InterviewType.MockSalesCall]: "mock_sales_call",
        [InterviewType.PresentationPitch]: "presentation_pitch",
        [InterviewType.TechnicalScreeningCall]: "technical_screening_call",
        [InterviewType.SystemDesignInterview]: "system_design_interview",
        [InterviewType.PortfolioReview]: "portfolio_review",
        [InterviewType.CaseStudy]: "case_study",
        [InterviewType.BehavioralInterview]: "behavioral_interview",
        [InterviewType.ValuesInterview]: "values_interview",
        [InterviewType.TeamFitInterview]: "team_fit_interview",
        [InterviewType.InterviewWithBusinessPartnerClientStakeholder]: "interview_with_business_partner_client_stakeholder",
        [InterviewType.ExecutiveLeadershipRound]: "executive_leadership_round"
    };
    
    return typeMapping[interviewType] || "phone_screen"; // Default fallback
}

const SlideToAnswer = ({ onAnswer, onDecline }: { onAnswer: () => void; onDecline: () => void }) => {
    const slideAnim = React.useRef(new Animated.Value(0)).current;
    const [hasAnswered, setHasAnswered] = useState(false);
    
    const SLIDE_WIDTH = screenWidth - 80; // Container width minus padding
    const BUTTON_SIZE = 80;
    const SLIDE_THRESHOLD = SLIDE_WIDTH - BUTTON_SIZE - 20; // Leave some margin
    
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
            const { dx } = gestureState;
            if (dx >= 0 && dx <= SLIDE_THRESHOLD) {
                slideAnim.setValue(dx);
            }
        },
        onPanResponderRelease: (_, gestureState) => {
            const { dx } = gestureState;
            if (dx >= SLIDE_THRESHOLD && !hasAnswered) {
                // Slide completed - answer the call
                setHasAnswered(true);
                Animated.timing(slideAnim, {
                    toValue: SLIDE_THRESHOLD,
                    duration: 150,
                    useNativeDriver: false,
                }).start(() => {
                    onAnswer();
                });
            } else {
                // Slide not completed - return to start
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: false,
                    tension: 150,
                    friction: 8,
                }).start();
            }
        },
    });

    return (
        <View style={styles.slideContainer}>
            {/* Slide to Answer */}
            <View style={styles.slideTrack}>
                <View style={styles.slideTextContainer}>
                    <Animated.Text 
                        style={[
                            styles.slideText,
                            {
                                opacity: slideAnim.interpolate({
                                    inputRange: [0, SLIDE_THRESHOLD * 0.7],
                                    outputRange: [0.6, 0],
                                    extrapolate: 'clamp',
                                }),
                            }
                        ]}
                    >
                        slide to answer
                    </Animated.Text>
                </View>
                <Animated.View
                    style={[
                        styles.slideButton,
                        {
                            transform: [{ translateX: slideAnim }],
                        },
                    ]}
                    {...panResponder.panHandlers}
                >
                    <Ionicons name="call" size={28} color="#fff" />
                </Animated.View>
            </View>
            
        </View>
    );
};

export default function MockInterview() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [callState, setCallState] = useState<'incoming' | 'connecting' | 'active' | 'ended'>(
        params.callState as 'incoming' || 'incoming'
    );
    const [duration, setDuration] = useState(0);
    const [interviewNotes, setInterviewNotes] = useState<string[]>([]);
    const { posthogScreen, posthogCapture } = usePosthogSafely();
    const { impactAsync } = useHapticsSafely();
    
    // Fetch user data and CV
    const { auth } = useAuth();
    const { data: cvProfile } = useCV();
    const { data: interviewData } = useInterview(params.interviewId as string);
    const startAttempt = useStartAttempt();
    const addTranscript = useAddTranscript();
    const finishAttempt = useFinishAttempt();

    useFocusEffect(
        React.useCallback(() => {
            if (Platform.OS === 'web') return;
            posthogScreen('mock_interview');
        }, [posthogScreen])
    );

    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    
    const topics = params.topics ? JSON.parse(params.topics as string) : [];
    
    // Interviewer profile - changes based on interview type (check both API data and URL params)
    const currentInterviewType = interviewData?.interview_type || params.interviewType as string;
    
    // Get agent info based on interview type
    const getAgentInfo = () => {
        const interviewTypeKey = getInterviewTypeKey(currentInterviewType);
        const agentData = AGENT_INTERVIEW_LINK[interviewTypeKey as keyof typeof AGENT_INTERVIEW_LINK];
        
        return {
            name: agentData?.name || 'Niamh Morissey',
            avatar: agentData?.profile_picture || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format',
            role: getInterviewerRole(currentInterviewType),
            agentId: agentData?.agent_id || 'agent_3201k2d96cp0fv7rvw0j3nbe3fd6'
        };
    };
    
    // Helper function to determine interviewer role based on interview type
    const getInterviewerRole = (type: string): string => {
        switch (type) {
            case InterviewType.MockSalesCall:
                return 'Director of Operations';
            case InterviewType.TechnicalScreeningCall:
            case InterviewType.SystemDesignInterview:
                return 'Senior Technical Interviewer';
            case InterviewType.InitialHRInterview:
            case InterviewType.BehavioralInterview:
                return 'HR Manager';
            case InterviewType.ExecutiveLeadershipRound:
                return 'VP of Engineering';
            case InterviewType.PortfolioReview:
                return 'Design Lead';
            default:
                return 'Senior Interviewer';
        }
    };
    
    const interviewer = getAgentInfo();

    const conversationConfig = useMemo(() => ({
        onConnect: () => {
            posthogCapture('interview_started', {
                interview_id: params.interviewId as string,
                attempt_id: attemptId,
                role: params.role as string,
                company: params.companyName as string,
                difficulty: params.difficulty as string,
                has_cv: !!cvProfile
            });
            setCallState('active');
            
            // Set a timeout to check if AI speaks within 10 seconds
            setTimeout(() => {
                if (interviewNotes.length === 0) {
                    console.log('⚠️ AI has not spoken yet after 10 seconds');
                }
            }, 10000);
        },
        onDisconnect: () => {
            // Don't automatically change state - let the user control ending
        },
        onMessage: (evt: any) => {
            // Normalize event shape: sometimes { message: {...}, source }, sometimes already flat
            const e = evt?.message?.type ? evt.message : evt;
          
            // Capture conversation_id from initiation event
            if (e.type === 'conversation_initiation_metadata') {
                const convId = e.conversation_initiation_metadata_event?.conversation_id;
                if (convId && attemptId) {
                    console.log('📝 Captured conversation_id:', convId);
                    console.log('📝 Updating attempt with conversation_id...');
                    setConversationId(convId);
                    
                    // Immediately update the attempt with the conversation_id
                    try {
                        const updatePayload = {
                            interviewId: params.interviewId as string,
                            attemptId: attemptId,
                            conversationId: convId
                        };
                        console.log('📝 Sending update to backend:', updatePayload);
                        // TODO: Add an API call here to update the attempt with conversation_id
                        // await updateAttemptConversationId.mutateAsync(updatePayload);
                    } catch (error) {
                        console.error('❌ Failed to update attempt with conversation_id:', error);
                    }
                }
                return;
            }

            // For all other events, just show that interview is active
            // We'll get the complete transcript from ElevenLabs API after the call
        },
        onError: (error: any) => {
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
                return "Feedback recorded successfully!";
            },
            evaluate_answer: (parameters: unknown) => {
                const answerParams = parameters as {
                    question: string;
                    answer: string;
                    rating: number;
                    feedback: string;
                };
                return "Answer evaluated!";
            },
        },
    }), [interviewNotes.length]);

    const buildInterviewPrompt = useCallback(() => {
        const userName = auth?.name || 'Candidate';
        const userSkills = cvProfile?.skills?.join(', ') || 'Not specified';
        const experienceYears = cvProfile?.experience_years || 0;
        const cvSummary = cvProfile?.raw_text?.substring(0, 800) || 'No CV available';
        
        const currentInterviewType = interviewData?.interview_type || params.interviewType as string;
        
        if (currentInterviewType === InterviewType.MockSalesCall) {
            return `You are ${interviewer.name}, a ${interviewer.role} at TechFlow Solutions, participating in a sales call simulation.

PROSPECT PROFILE (YOU):
- Role: ${interviewer.role} at TechFlow Solutions
- Company: Mid-market (100-1000 employees) Technology company  
- Pain Points: Manual processes, inefficient workflows, scaling challenges, budget constraints
- Personality: Busy, professionally skeptical but fair
- Buying Authority: Can influence decisions, but needs to consult with leadership for final approval
- Current Situation: Evaluating solutions but not in a rush to buy

SALESPERSON INFORMATION:
- Name: ${userName}
- Experience Level: ${experienceYears} years
- Key Skills: ${userSkills}
- They're calling about: ${params.role} role at ${params.companyName}

YOUR BEHAVIOR AS A PROSPECT:
1. **Don't volunteer information** - Make ${userName} ask good discovery questions
2. **Be realistically skeptical** - Don't be immediately interested or hostile  
3. **Have objections ready**: Use 2-3 realistic objections during the conversation
4. **Show buying signals gradually** if they demonstrate good sales skills
5. **Respond naturally** - like a real busy executive would

CONVERSATION GUIDELINES:
- Start with: "Hi, I have about 10 minutes. What's this about?"
- Don't lead the conversation - let ${userName} drive it
- Ask clarifying questions if their pitch is vague: "Can you be more specific?"
- Bring up objections naturally during the conversation
- If they handle objections well, show some interest
- End the call after 8-12 minutes with next steps (or lack thereof)

OBJECTIONS TO USE (pick 2-3 based on conversation flow):
- "We're already using [competitor solution] and it works fine"
- "This isn't the right time, maybe next quarter"  
- "I'd need to see a detailed ROI analysis first"
- "Our budget for this type of solution is very limited"
- "I'll need buy-in from several other departments"

Remember: You're a realistic prospect, not an interviewer. Be challenging but fair, and reward good sales technique with engagement. This is practice for ${userName} to improve their sales skills.`;
        } else {
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
        }
    }, [auth, cvProfile, interviewer, params, topics, interviewData]);

    const acceptCall = useCallback(async (conversation: any) => {
        posthogCapture('interview_call_answered', {
            interview_id: params.interviewId as string,
            role: params.role as string,
            company: params.companyName as string,
            difficulty: params.difficulty as string,
            topics_count: topics.length
        });
        setCallState('connecting');
        
        // Use the correct agent_id from the interviewer mapping
        const agentId = interviewer.agentId;

        // Start attempt on backend regardless of ElevenLabs agent handling (client handles audio)
        let newAttemptId: string | null = null;
        try {
            const res = await startAttempt.mutateAsync(params.interviewId as string);
            newAttemptId = res.data.attempt_id;
            
            if (!newAttemptId) {
                console.error('❌ Backend returned no attempt_id');
                setCallState('incoming');
                return;
            }
            
            setAttemptId(newAttemptId);
        } catch (e) {
            console.error('❌ Failed to start attempt:', e);
            setCallState('incoming');
            return;
        }

        try {
            const prompt = buildInterviewPrompt();
            
            // Try without prompt override first to see if agent speaks
            console.log('📝 Starting ElevenLabs session with attemptId:', newAttemptId);
            console.log('📝 Interview type from API:', interviewData?.interview_type);
            console.log('📝 Interview type from params:', params.interviewType);
            console.log('📝 Final interview type:', currentInterviewType);
            console.log('📝 AgentId:', agentId);
            console.log('📝 Interviewer name:', interviewer.name);
            
            const sessionConfig = {
                agentId: agentId,
                userId: newAttemptId, // Keep this for compatibility
                dynamicVariables: {
                    user_id: newAttemptId,  // ✅ Add attemptId to dynamicVariables as recommended
                    candidate_name: auth?.name || 'Candidate',
                    job_title: String(params.role || ''),
                    company: String(params.companyName || ''),
                    cv_data: cvProfile?.raw_text || '',
                    job_description: topics.join(', '),
                }
            };
            
            console.log('📝 Session config dynamicVariables:', sessionConfig.dynamicVariables);
            
            const sessionResult = await conversation.startSession(sessionConfig);
            
            console.log('✅ ElevenLabs session started successfully');
            console.log('📝 Session result:', sessionResult);
            
            // If startSession returns a conversationId, capture it
            if (sessionResult?.conversationId) {
                console.log('📝 Got conversationId from startSession:', sessionResult.conversationId);
                setConversationId(sessionResult.conversationId);
            }
            
        } catch (error) {
            console.error('❌ Failed to start ElevenLabs session:', error);
            // console.error('   Error details:', {
            //     message: error?.message,
            //     stack: error?.stack,
            //     name: error?.name
            // });
            setCallState('incoming'); // Reset to incoming state on error
        }
    }, [buildInterviewPrompt, auth, params]);

    const declineCall = useCallback(() => {
        posthogCapture('interview_call_declined', {
            interview_id: params.interviewId as string,
            role: params.role as string,
            company: params.companyName as string,
            difficulty: params.difficulty as string
        });
        setCallState('ended');
        router.back();
    }, [router, posthogCapture, params]);

    const endInterview = useCallback(async (conversation: any) => {
        try {
            await conversation.endSession();
            posthogCapture('interview_ended', {
                interview_id: params.interviewId as string,
                attempt_id: attemptId,
                duration_seconds: duration,
                role: params.role as string,
                company: params.companyName as string
            });
            setCallState('ended');
            
            // Navigate immediately to grading screen (with loading state)
            if (attemptId && params.interviewId) {
                router.replace({
                    pathname: '/interviews/[id]/attempts/[attemptId]/grading',
                    params: { id: params.interviewId as string, attemptId, is_from_interview: 'true' }
                });
                
                // Trigger backend finish in background (webhook will handle the rest)
                try {
                    await finishAttempt.mutateAsync({
                        interviewId: params.interviewId as string,
                        attemptId: attemptId,
                        durationSeconds: duration,
                        conversationId: conversationId || undefined
                    });
                } catch (e) {
                    console.log('Error finishing attempt:', e);
                }
            }
        } catch (error) {
            setCallState('ended');
        }
    }, [attemptId, params.interviewId, duration, finishAttempt, router]);

    // Incoming call haptic effects
    useEffect(() => {
        let hapticInterval: ReturnType<typeof setInterval>;
        
        if (callState === 'incoming') {
            // Start haptic feedback pattern (more constant iPhone-like vibration)
            const triggerHapticPattern = () => {
                // Longer vibration sequence for more constant feel
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setTimeout(() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }, 150);
                setTimeout(() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }, 300);
                setTimeout(() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }, 450);
            };
            
            // Trigger haptics immediately
            triggerHapticPattern();
            
            // Repeat more frequently for constant feel
            hapticInterval = setInterval(triggerHapticPattern, 1000);
        }

        // Cleanup function
        return () => {
            if (hapticInterval) {
                clearInterval(hapticInterval);
            }
        };
    }, [callState]);

    // Duration timer effect
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
                <ChatGPTBackground style={styles.container}>
                    {callState !== 'incoming' && callState !== 'connecting' && (
                        <View style={styles.header}>
                            <View style={styles.headerInfo}>
                                <Text style={styles.companyName}>{params.companyName}</Text>
                                <Text style={styles.role}>{params.role}</Text>
                            </View>
                        {callState === 'active' && (
                            <View style={styles.timer}>
                                <Ionicons name="time-outline" size={16} color="#F59E0B" />
                                <Text style={styles.timerText}>{formatDuration(duration)}</Text>
                            </View>
                        )}
                        </View>
                    )}

                    <ScrollView 
                        style={styles.content}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {callState === 'incoming' && (
                            <View style={styles.iphoneCallContainer}>
                                <View style={styles.iphoneHeader}>
                                    <Text style={styles.iphoneCallerName}>{interviewer.name}</Text>
                                </View>
                                
                                <View style={styles.iphoneMiddleSection}>
                                    <View style={styles.iphoneAvatarContainer}>
                                        <Image 
                                            source={{ uri: interviewer.avatar }}
                                            style={styles.iphoneAvatarImage}
                                            resizeMode="cover"
                                        />
                                    </View>
                                    
                                    <Text style={styles.iphoneCallStatus}>calling...</Text>
                                    
                                    <View style={styles.iphoneCallSpacer} />
                                    
                                    <Text style={styles.iphoneCallSubtext}>{params.companyName} • {params.role}</Text>
                                    
                                    {/* Instructions based on interview type */}
                                    <View style={styles.instructionsContainer}>
                                        {currentInterviewType === InterviewType.MockSalesCall ? (
                                            <View style={styles.salesInstructionsCard}>
                                                <View style={styles.instructionsHeader}>
                                                    <Ionicons name="trending-up" size={20} color="#F59E0B" />
                                                    <Text style={styles.instructionsTitle}>Sales Call Simulation</Text>
                                                </View>
                                                <Text style={styles.instructionsSubtitle}>You are the salesperson, they are the prospect</Text>
                                                <View style={styles.instructionsList}>
                                                    <Text style={styles.instructionItem}>• Lead the conversation and ask discovery questions</Text>
                                                    <Text style={styles.instructionItem}>• Uncover their pain points and business needs</Text>
                                                    <Text style={styles.instructionItem}>• Handle objections professionally</Text>
                                                    <Text style={styles.instructionItem}>• Close for a specific next step</Text>
                                                </View>
                                            </View>
                                        ) : (
                                            // <View style={styles.standardInstructionsCard}>
                                            //     <View style={styles.instructionsHeader}>
                                            //         <Ionicons name="people" size={20} color="#3b82f6" />
                                            //         <Text style={styles.instructionsTitle}>Interview Tips</Text>
                                            //     </View>
                                            //     <View style={styles.instructionsList}>
                                            //         <Text style={styles.instructionItem}>• Speak clearly and take your time</Text>
                                            //         <Text style={styles.instructionItem}>• Use specific examples from your experience</Text>
                                            //         <Text style={styles.instructionItem}>• Ask clarifying questions if needed</Text>
                                            //         <Text style={styles.instructionItem}>• Stay confident and be yourself</Text>
                                            //     </View>
                                            // </View>
                                            null
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}

                        {callState === 'connecting' && (
                            <View style={styles.iphoneCallContainer}>
                                <View style={styles.iphoneHeader}>
                                    <Text style={styles.iphoneCallerName}>{interviewer.name}</Text>
                                </View>
                                
                                <View style={styles.iphoneMiddleSection}>
                                    <View style={styles.iphoneAvatarContainer}>
                                        <Image 
                                            source={{ uri: interviewer.avatar }}
                                            style={styles.iphoneAvatarImage}
                                            resizeMode="cover"
                                        />
                                    </View>
                                    
                                    <Text style={styles.iphoneCallStatus}>connecting...</Text>
                                    
                                    <View style={styles.iphoneCallSpacer} />
                                    
                                    <Text style={styles.iphoneCallSubtext}>{params.companyName} • {params.role}</Text>
                                </View>
                            </View>
                        )}

                        {callState === 'active' && (
                            <View style={styles.activeCallContainer}>
                                {/* iPhone-style Active Call Interface */}
                                <View style={styles.activeCallHeader}>
                                    <Text style={styles.activeCallStatus}>Interview in progress</Text>
                                    <Text style={styles.activeCallDuration}>{formatDuration(duration)}</Text>
                                </View>

                                {/* Large Centered Profile */}
                                <View style={styles.activeCallMiddle}>
                                    <View style={styles.activeCallAvatarContainer}>
                                        <Image 
                                            source={{ uri: interviewer.avatar }}
                                            style={styles.activeCallAvatarImage}
                                            resizeMode="cover"
                                        />
                                    </View>
                                    <Text style={styles.activeCallInterviewerName}>{interviewer.name}</Text>
                                    <Text style={styles.activeCallInterviewerRole}>{interviewer.role}</Text>
                                    
                                    {/* Recording indicator */}
                                    <View style={styles.activeCallRecordingContainer}>
                                        <View style={styles.activeCallRecordingDot} />
                                        <Text style={styles.activeCallRecordingText}>Recording</Text>
                                    </View>
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
                            <SlideToAnswer
                                onAnswer={() => acceptCall(conversation)}
                                onDecline={declineCall}
                            />
                        )}



                        {callState === 'active' && (
                            <>
                                <View style={styles.callControls}>
                                    <TouchableOpacity
                                        style={[styles.callControlButton, styles.endCallButton]}
                                        onPress={() => {
                                            // Heavy impact for ending interview - critical action
                                            impactAsync(ImpactFeedbackStyle.Heavy);
                                            endInterview(conversation);
                                        }}
                                    >
                                        <Ionicons name="call" size={28} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                                
                                <Text style={styles.statusText}>
                                    Tap the red button to end the interview
                                </Text>
                            </>
                        )}

                        {callState === 'ended' && (
                            <TouchableOpacity
                                style={styles.backToMenuButton}
                                onPress={() => {
                                    // Light impact for navigation back - minor action
                                    impactAsync(ImpactFeedbackStyle.Light);
                                    router.back();
                                }}
                            >
                                <Text style={styles.backToMenuText}>Back to Interview Details</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ChatGPTBackground>
            )}
        </MockInterviewConversation>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.15)',
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
        color: GlassTextColors.primary,
    },
    role: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: GlassTextColors.muted,
        marginTop: 2,
    },
    timer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    timerText: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: '#F59E0B',
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
        color: GlassTextColors.primary,
        marginBottom: 12,
        textAlign: 'center',
    },
    incomingCallSubtitle: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: GlassTextColors.muted,
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
        color: GlassTextColors.primary,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    endedSubtitle: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: GlassTextColors.muted,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    interviewerProfile: {
        alignItems: 'center',
        marginBottom: 32,
        ...GlassStyles.container,
        borderRadius: 20,
        padding: 24,
    },
    interviewerAvatar: {
        fontSize: 64,
        marginBottom: 12,
    },
    interviewerName: {
        fontSize: 20,
        fontFamily: 'Inter_600SemiBold',
        color: GlassTextColors.primary,
        marginBottom: 4,
    },
    interviewerRole: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: GlassTextColors.muted,
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
        color: GlassTextColors.primary,
        marginBottom: 12,
        textAlign: 'center',
    },
    welcomeSubtitle: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: GlassTextColors.muted,
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
        color: GlassTextColors.muted,
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
    interviewerInfoSmall: {
        flex: 1,
    },
    interviewerNameSmall: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: GlassTextColors.primary,
    },
    interviewerRoleSmall: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: GlassTextColors.muted,
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
        color: GlassTextColors.muted,
        textAlign: 'center',
    },
    noteItem: {
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
    },
    userNote: {
        backgroundColor: '#F59E0B',
        alignSelf: 'flex-end',
        maxWidth: '80%',
    },
    aiNote: {
        ...GlassStyles.container,
        alignSelf: 'flex-start',
        maxWidth: '80%',
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
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F59E0B',
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
    connectingFooter: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    backToMenuButton: {
        ...GlassStyles.interactive,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    backToMenuText: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: GlassTextColors.primary,
    },
    statusText: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: GlassTextColors.muted,
    },
    // iPhone Call Interface Styles
    iphoneCallContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 60,
    },
    iphoneHeader: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iphoneCallerName: {
        fontSize: 42,
        fontFamily: 'Inter_300Light',
        color: GlassTextColors.primary,
        textAlign: 'center',
        marginBottom: 16,
    },
    iphoneCallStatus: {
        fontSize: 18,
        fontFamily: 'Inter_400Regular',
        color: GlassTextColors.muted,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    iphoneCallSubtext: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: GlassTextColors.muted,
        textAlign: 'center',
    },
    iphoneMiddleSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iphoneAvatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    iphoneAvatar: {
        fontSize: 50,
    },
    iphoneAvatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    iphoneCallSpacer: {
        height: 32,
    },
    interviewerAvatarSmallImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    // Slide to Answer Styles
    slideContainer: {
        alignItems: 'center',
        paddingBottom: 40,
        paddingHorizontal: 40,
        width: '100%',
    },
    slideTrack: {
        width: '100%',
        height: 80,
        backgroundColor: 'rgba(128, 90, 168, 0.6)', // Purple/pink like iPhone
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        position: 'relative',
        overflow: 'hidden',
    },
    slideTextContainer: {
        position: 'absolute',
        right: 45, // Move text slightly to the right
        width: 180,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    slideText: {
        color: 'rgba(255, 255, 255, 0.6)', // Darker style text
        fontSize: 20,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
    },
    slideButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#34C759',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8
            }
        }),
    },
    declineButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FF3B30',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '135deg' }],
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            }
        }),
    },
    // iPhone-style Active Call Styles
    activeCallContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 20,
    },
    activeCallHeader: {
        alignItems: 'center',
        marginBottom: 40,
    },
    activeCallStatus: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: GlassTextColors.muted,
        textAlign: 'center',
        marginBottom: 8,
    },
    activeCallDuration: {
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
        color: '#F59E0B',
        textAlign: 'center',
    },
    activeCallMiddle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60,
    },
    activeCallAvatarContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(245, 158, 11, 0.3)',
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#F59E0B',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
            }
        }),
    },
    activeCallAvatarImage: {
        width: 160,
        height: 160,
        borderRadius: 80,
    },
    activeCallInterviewerName: {
        fontSize: 28,
        fontFamily: 'Inter_300Light',
        color: GlassTextColors.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    activeCallInterviewerRole: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: GlassTextColors.muted,
        textAlign: 'center',
        marginBottom: 24,
    },
    activeCallRecordingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.25)',
    },
    activeCallRecordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        marginRight: 8,
    },
    activeCallRecordingText: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: '#EF4444',
    },
    // Instructions Card Styles
    instructionsContainer: {
        marginTop: 32,
        paddingHorizontal: 20,
        width: '100%',
    },
    salesInstructionsCard: {
        ...GlassStyles.card,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        marginBottom: 20,
    },
    standardInstructionsCard: {
        ...GlassStyles.card,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        marginBottom: 20,
    },
    instructionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    instructionsTitle: {
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
        color: GlassTextColors.primary,
        marginLeft: 8,
    },
    instructionsSubtitle: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        color: '#F59E0B',
        marginBottom: 16,
        textAlign: 'center',
    },
    instructionsList: {
        gap: 8,
    },
    instructionItem: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: GlassTextColors.muted,
        lineHeight: 20,
    },
});