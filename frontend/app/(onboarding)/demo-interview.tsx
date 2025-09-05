import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated, PanResponder, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';
import { useCV } from '../../_queries/interviews/cv';
import { useGetConversationToken } from '../../_queries/interviews/conversation-token';
import { useAuth } from '../../context/authentication/AuthContext';
import MockInterviewConversation from '../../components/MockInterviewConversation';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../hooks/haptics/useHapticsSafely';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { GlassStyles, GlassTextColors } from '../../constants/GlassStyles';
import { InterviewType } from '../../_interfaces/interviews/interview-types';
import Colors from '../../constants/Colors';
import { getNavigationDirection, setNavigationDirection } from '../../utils/navigationDirection';
import { TYPOGRAPHY } from '../../constants/Typography';

const { width: screenWidth } = Dimensions.get('window');

const SlideToAnswer = ({ onAnswer, onDecline }: { onAnswer: () => void; onDecline: () => void }) => {
    const slideAnim = React.useRef(new Animated.Value(0)).current;
    const [hasAnswered, setHasAnswered] = useState(false);
    
    const SLIDE_WIDTH = screenWidth - 80;
    const BUTTON_SIZE = 80;
    const SLIDE_THRESHOLD = SLIDE_WIDTH - BUTTON_SIZE - 20;
    
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
                setHasAnswered(true);
                Animated.timing(slideAnim, {
                    toValue: SLIDE_THRESHOLD,
                    duration: 150,
                    useNativeDriver: false,
                }).start(() => {
                    onAnswer();
                });
            } else {
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
                    <Ionicons name="call" size={28} color={Colors.text.primary} />
                </Animated.View>
            </View>
            
            <TouchableOpacity 
                style={styles.cantTalkButton} 
                onPress={onDecline}
                activeOpacity={0.7}
            >
                <Text style={styles.cantTalkText}>Can't talk right now</Text>
            </TouchableOpacity>
        </View>
    );
};

export default function DemoInterview() {
    const router = useRouter();
    const [callState, setCallState] = useState<'incoming' | 'connecting' | 'active' | 'ended'>('incoming');
    const [duration, setDuration] = useState(0);
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
    const [hasFetchedAgent, setHasFetchedAgent] = useState(false);
    const { posthogScreen, posthogCapture } = usePosthogSafely();
    const { impactAsync } = useHapticsSafely();
    
    const { auth } = useAuth();
    const { data: cvProfile } = useCV();
    const getConversationToken = useGetConversationToken();

    const [agentMetadata, setAgentMetadata] = useState<{ name: string; profile_picture: string } | null>(null);

    // Animation values
    const contentTranslateX = React.useRef(new Animated.Value(0)).current;
    const contentOpacity = React.useRef(new Animated.Value(1)).current;

    useFocusEffect(
        React.useCallback(() => {
            if (Platform.OS === 'web') return;
            posthogScreen('onboarding_demo_interview');
            
            // Only animate in once when the screen first loads
            if (!hasAnimatedIn) {
                const slideInFrom = getNavigationDirection() === 'back' ? -screenWidth : screenWidth;
                contentTranslateX.setValue(slideInFrom);
                contentOpacity.setValue(0);
                
                setTimeout(() => {
                    Animated.parallel([
                        Animated.timing(contentTranslateX, {
                            toValue: 0,
                            duration: 700,
                            useNativeDriver: true,
                        }),
                        Animated.timing(contentOpacity, {
                            toValue: 1,
                            duration: 600,
                            useNativeDriver: true,
                        })
                    ]).start(() => {
                        setHasAnimatedIn(true);
                    });
                }, 100);
            }
        }, [hasAnimatedIn, posthogScreen])
    );

    const getAgentInfo = () => {
        return {
            name: agentMetadata?.name || 'Niamh Morrissey',
            avatar: agentMetadata?.profile_picture || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format',
            role: 'Senior Interviewer'
        };
    };
    
    const interviewer = getAgentInfo();

    const conversationConfig = useMemo(() => ({
        onConnect: () => {
            posthogCapture('onboarding_demo_interview_started', {
                has_cv: !!cvProfile
            });
            setCallState('active');
        },
        onDisconnect: () => {
            handleCallEnded();
        },
        onMessage: (evt: any) => {
            const e = evt?.message?.type ? evt.message : evt;
            
            // Check if agent is ending the call
            if (e.type === 'conversation_ended' || e.type === 'user_disconnected') {
                handleCallEnded();
            }
        },
        onError: (error: any) => {
            console.error('Demo call error:', error);
            handleCallEnded();
        }
    }), [cvProfile]);

    const handleCallEnded = useCallback(() => {
        if (callState !== 'ended') {
            posthogCapture('onboarding_demo_interview_ended', {
                duration_seconds: duration
            });
            
            // Navigate directly to paywall
            setNavigationDirection('forward');
            router.replace({ 
                pathname: '/(app)/paywall',
                params: { source: 'onboarding' }
            });
        }
    }, [callState, duration, router, posthogCapture]);

    const acceptCall = useCallback(async (conversation: any) => {
        posthogCapture('onboarding_demo_interview_answered');
        setCallState('connecting');

        try {
            // Use a fake interview ID that backend recognizes for demo
            const demoInterviewId = 'demo_onboarding_interview';
            
            const tokenResponse = await getConversationToken.mutateAsync({
                interviewId: demoInterviewId,
                interviewType: InterviewType.GeneralInterview
            });
            
            setAgentMetadata(tokenResponse.agent_metadata);
            
            const sessionConfig = {
                conversationToken: tokenResponse.conversation_token,
                dynamicVariables: {
                    user_id: auth?.id || 'demo_user',
                    candidate_name: auth?.name || 'Candidate',
                    job_title: `${auth?.industry ? auth.industry + ' ' : ''}Consultant`,
                    company: 'Demo Company',
                    cv_data: cvProfile?.raw_text || '',
                    job_description: `${auth?.industry || 'General'} consulting interview practice session`,
                }
            };
            
            await conversation.startSession(sessionConfig);
            
        } catch (error) {
            console.error('Failed to start demo session:', error);
            setCallState('incoming');
        }
    }, [auth, cvProfile, getConversationToken]);

    const endInterview = useCallback(async (conversation: any) => {
        try {
            await conversation.endSession();
            handleCallEnded();
        } catch (error) {
            handleCallEnded();
        }
    }, [handleCallEnded]);

    const declineCall = useCallback(() => {
        posthogCapture('onboarding_demo_interview_declined');
        setNavigationDirection('forward');
        router.replace({ 
            pathname: '/(app)/paywall',
            params: { source: 'onboarding' }
        });
    }, [router, posthogCapture]);

    const handleBack = () => {
        setNavigationDirection('back');
        Animated.parallel([
            Animated.timing(contentTranslateX, {
                toValue: screenWidth,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(contentOpacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start(() => {
            router.back();
        });
    };

    // Incoming call haptic effects
    useEffect(() => {
        let hapticInterval: ReturnType<typeof setInterval>;
        
        if (callState === 'incoming') {
            const triggerHapticPattern = () => {
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
            
            triggerHapticPattern();
            hapticInterval = setInterval(triggerHapticPattern, 1000);
        }

        return () => {
            if (hapticInterval) {
                clearInterval(hapticInterval);
            }
        };
    }, [callState]);

    // Duration timer
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

    // Prefetch agent metadata once on component mount
    useEffect(() => {
        if (!hasFetchedAgent) {
            setHasFetchedAgent(true);
            const demoInterviewId = 'demo_onboarding_interview';
            
            getConversationToken.mutate({
                interviewId: demoInterviewId,
                interviewType: InterviewType.GeneralInterview
            }, {
                onSuccess: (data) => {
                    setAgentMetadata(data.agent_metadata);
                },
                onError: (error) => {
                    console.error('Failed to prefetch agent metadata:', error);
                }
            });
        }
    }, [hasFetchedAgent, getConversationToken]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <MockInterviewConversation config={conversationConfig}>
            {(conversation) => (
                <ChatGPTBackground style={styles.container}>

                    <Animated.View 
                        style={[
                            styles.content,
                            {
                                transform: [{ translateX: contentTranslateX }],
                                opacity: contentOpacity,
                            }
                        ]}
                    >
                        <ScrollView 
                            contentContainerStyle={styles.contentContainer}
                            showsVerticalScrollIndicator={false}
                        >
                            {(getConversationToken.isPending && !agentMetadata) ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={Colors.brand.primary} />
                                </View>
                            ) : callState === 'incoming' ? (
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
                                        
                                        <Text style={styles.iphoneCallSubtext}>Interview Coach • {auth?.industry ? `${auth.industry} ` : ''}Consultant Role</Text>
                                        
                                        <View style={styles.instructionsContainer}>
                                            <View style={styles.interviewTipsContainer}>
                                                <View style={styles.interviewTipsHeader}>
                                                    <Ionicons name="people" size={20} color={Colors.accent.blueAlt} />
                                                    <Text style={styles.interviewTipsTitle}>Interview Tips</Text>
                                                </View>
                                                <Text style={styles.interviewTipItem}>Speak clearly • Use examples • Be confident</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ) : callState === 'connecting' ? (
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
                                        
                                        <Text style={styles.iphoneCallSubtext}>Interview Coach • {auth?.industry ? `${auth.industry} ` : ''}Consultant Role</Text>
                                    </View>
                                </View>
                            ) : callState === 'active' ? (
                                <View style={styles.activeCallContainer}>
                                    <View style={styles.activeCallHeader}>
                                        <Text style={styles.activeCallDuration}>{formatDuration(duration)}</Text>
                                    </View>

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
                                        
                                        <View style={styles.activeCallRecordingContainer}>
                                            <View style={styles.activeCallRecordingDot} />
                                            <Text style={styles.activeCallRecordingText}>Recording</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : null}
                        </ScrollView>

                        <View style={styles.footer}>
                            {callState === 'incoming' && agentMetadata && (
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
                                                impactAsync(ImpactFeedbackStyle.Heavy);
                                                endInterview(conversation);
                                            }}
                                        >
                                            <Ionicons name="call" size={28} color={Colors.text.primary} />
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <Text style={styles.statusText}>
                                        Tap the red button to end the interview
                                    </Text>
                                </>
                            )}
                        </View>
                    </Animated.View>
                </ChatGPTBackground>
            )}
        </MockInterviewConversation>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
    },
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
    iphoneMiddleSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iphoneAvatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.glass.backgroundInput,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.glass.borderInteractive,
    },
    iphoneAvatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
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
    iphoneCallSpacer: {
        height: 32,
    },
    instructionsContainer: {
        marginTop: 32,
        paddingHorizontal: 20,
        width: '100%',
    },
    interviewTipsContainer: {
        marginTop: 16,
        paddingHorizontal: 20,
    },
    interviewTipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        justifyContent: 'center',
    },
    interviewTipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
        marginLeft: 8,
    },
    interviewTipItem: {
        fontSize: 14,
        color: Colors.text.quaternary,
        textAlign: 'center',
    },
    activeCallContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 60,
    },
    activeCallHeader: {
        alignItems: 'center',
        marginBottom: 40,
    },
    activeCallDuration: {
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
        color: Colors.brand.primary,
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
        backgroundColor: Colors.glass.backgroundSubtle,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.glass.purpleLight,
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: Colors.brand.primary,
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
        backgroundColor: Colors.glass.error,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.glass.errorBorder,
    },
    activeCallRecordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.semantic.error,
        marginRight: 8,
    },
    activeCallRecordingText: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: Colors.semantic.error,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 30,
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
    endCallButton: {
        backgroundColor: Colors.semantic.error,
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    statusText: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: GlassTextColors.muted,
    },
    slideContainer: {
        alignItems: 'center',
        paddingBottom: 40,
        paddingHorizontal: 40,
        width: '100%',
    },
    slideTrack: {
        width: '100%',
        height: 80,
        backgroundColor: Colors.gradient.iPhonePurple,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        position: 'relative',
        overflow: 'hidden',
    },
    slideTextContainer: {
        position: 'absolute',
        right: 45,
        width: 180,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    slideText: {
        color: Colors.text.quaternary,
        fontSize: 20,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
    },
    slideButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.semantic.success,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        ...Platform.select({
            ios: {
                shadowColor: Colors.black,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8
            }
        }),
    },
    cantTalkButton: {
        alignItems: 'center',
        paddingVertical: 16,
        marginTop: 20,
    },
    cantTalkText: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        color: GlassTextColors.muted,
    },
});