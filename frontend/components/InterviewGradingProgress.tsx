import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import useHapticsSafely from '../hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';
import { TYPOGRAPHY } from '../constants/Typography';
import Colors from '../constants/Colors';

interface GradingStage {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  duration: number; // in milliseconds
}

const GRADING_STAGES: GradingStage[] = [
  {
    id: 'transcribing',
    title: 'Processing interview',
    subtitle: 'Converting your conversation to text',
    icon: 'mic-outline',
    duration: 1900, // Reduced to 12s total (proportionally scaled)
  },
  {
    id: 'analyzing',
    title: 'Analyzing responses',
    subtitle: 'Understanding your answers and approach',
    icon: 'analytics-outline',
    duration: 2300, // Reduced to 12s total (proportionally scaled)
  },
  {
    id: 'evaluating',
    title: 'Evaluating performance',
    subtitle: 'Assessing communication and technical skills',
    icon: 'trending-up-outline',
    duration: 2600, // Reduced to 12s total (proportionally scaled)
  },
  {
    id: 'comparing',
    title: 'Comparing to standards',
    subtitle: 'Benchmarking against role requirements',
    icon: 'bar-chart-outline',
    duration: 2100, // Reduced to 12s total (proportionally scaled)
  },
  {
    id: 'personalizing',
    title: 'Creating feedback',
    subtitle: 'Generating personalized insights',
    icon: 'bulb-outline',
    duration: 1800, // Reduced to 12s total (proportionally scaled)
  },
  {
    id: 'finalizing',
    title: 'Finalizing results',
    subtitle: 'Preparing your comprehensive report',
    icon: 'checkmark-circle-outline',
    duration: 1400, // Reduced to 12s total (proportionally scaled) - will wait at 98%
  },
];

interface InterviewGradingProgressProps {
  onComplete: () => void;
  isFeedbackReady?: boolean; // External signal for when feedback is actually ready
}

const InterviewGradingProgress: React.FC<InterviewGradingProgressProps> = ({ onComplete, isFeedbackReady = false }) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [waitingForFeedback, setWaitingForFeedback] = useState(false);
  const isMountedRef = useRef(true);
  const { impactAsync, notificationAsync } = useHapticsSafely();
  
  // Animation values
  const progressAnim = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const fadeAnim = useState(new Animated.Value(1))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];
  const successAnim = useState(new Animated.Value(0))[0];
  const ringAnim = useState(new Animated.Value(0))[0];
  
  // Stage transition animations
  const stageTextOpacity = useState(new Animated.Value(1))[0];
  const stageIconOpacity = useState(new Animated.Value(1))[0];
  
  // Animated sparkle particles for success
  const [sparkleParticles] = useState(() => 
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      scale: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotation: (i * 22.5), // 22.5 degrees apart for 16 particles
      delay: i * 60,
    }))
  );

  useEffect(() => {
    startProgressAnimation();
    startPulseAnimation();
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      // Stop all animations
      progressAnim.stopAnimation();
      pulseAnim.stopAnimation();
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
      successAnim.stopAnimation();
      ringAnim.stopAnimation();
      stageTextOpacity.stopAnimation();
      stageIconOpacity.stopAnimation();
    };
  }, []);

  // Monitor feedback ready status
  useEffect(() => {
    if (isFeedbackReady && waitingForFeedback && isMountedRef.current) {
      console.log('✅ Feedback is ready, completing animation...');
      completeFromWaiting();
    }
  }, [isFeedbackReady, waitingForFeedback]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const startProgressAnimation = () => {
    let currentProgress = 0;
    let stageIndex = 0;
    
    const animateStage = () => {
      if (stageIndex >= GRADING_STAGES.length) {
        // All stages complete - trigger success animation
        setIsComplete(true);
        triggerSuccessAnimation();
        return;
      }

      const stage = GRADING_STAGES[stageIndex];
      const stageProgress = (stageIndex + 1) / GRADING_STAGES.length;
      const targetProgress = stageProgress * 100;

      // Animate stage transition
      Animated.parallel([
        // Fade out current content
        Animated.timing(stageTextOpacity, {
          toValue: 0,
          duration: 300, // Increased from 250
          useNativeDriver: true,
        }),
        Animated.timing(stageIconOpacity, {
          toValue: 0,
          duration: 300, // Increased from 250
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!isMountedRef.current) return;
        
        // Update stage after fade out
        setCurrentStageIndex(stageIndex);
        
        // Haptic feedback for stage transition
        impactAsync(ImpactFeedbackStyle.Light);
        
        // Fade in new content
        Animated.parallel([
          Animated.timing(stageTextOpacity, {
            toValue: 1,
            duration: 500, // Increased from 400
            useNativeDriver: true,
          }),
          Animated.timing(stageIconOpacity, {
            toValue: 1,
            duration: 500, // Increased from 400
            useNativeDriver: true,
          }),
        ]).start();
      });

      // Animate to this stage's progress
      Animated.timing(progressAnim, {
        toValue: targetProgress,
        duration: stage.duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();

      // Update progress state for display
      const progressInterval = setInterval(() => {
        if (!isMountedRef.current) {
          clearInterval(progressInterval);
          return;
        }
        
        const isLastStage = stageIndex === GRADING_STAGES.length - 1;
        const maxProgress = isLastStage ? 98 : targetProgress; // Stop at 98% on last stage
        
        currentProgress += (maxProgress - currentProgress) * 0.06; // Slower progress increment
        setProgress(Math.min(currentProgress, maxProgress));
        
        if (currentProgress >= maxProgress - 0.5) {
          clearInterval(progressInterval);
          
          if (!isMountedRef.current) return;
          
          if (isLastStage) {
            // Last stage reached 98% - wait for feedback to be ready
            console.log('🔄 Reached 98%, waiting for feedback to be ready...');
            setWaitingForFeedback(true);
            return;
          }
          
          setTimeout(() => {
            if (isMountedRef.current) {
              stageIndex++;
              animateStage();
            }
          }, 500); // Slightly longer pause between stages
        }
      }, 80); // Slower update interval
    };

    animateStage();
  };

  const completeFromWaiting = () => {
    console.log('✅ Feedback ready - completing final 2% and playing success animation...');
    
    // Complete the final 2% smoothly
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 1200, // Slower completion
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Update progress to 100% with smooth animation
    const finalProgressInterval = setInterval(() => {
      if (!isMountedRef.current) {
        clearInterval(finalProgressInterval);
        return;
      }
      
      setProgress(prev => {
        const newProgress = prev + (100 - prev) * 0.12;
        if (newProgress >= 99.8) {
          clearInterval(finalProgressInterval);
          if (isMountedRef.current) {
            setProgress(100);
            
            // Wait a moment then trigger success animation  
            setTimeout(() => {
              if (isMountedRef.current) {
                console.log('🎉 Starting success animation sequence...');
                setIsComplete(true);
                triggerSuccessAnimationThenComplete();
              }
            }, 500); // Slightly longer pause to see 100%
          }
        }
        return newProgress;
      });
    }, 60);
  };

  const triggerSuccessAnimationThenComplete = () => {
    // Stop pulse animation
    pulseAnim.stopAnimation();
    
    // Success haptic feedback
    notificationAsync(NotificationFeedbackType.Success);
    
    console.log('🎊 Playing full success animation before transition...');
    
    // Success animation sequence
    Animated.sequence([
      // Scale up the circle with bounce
      Animated.timing(scaleAnim, {
        toValue: 1.25,
        duration: 400,
        easing: Easing.out(Easing.back(1.8)),
        useNativeDriver: true,
      }),
      // Scale back to normal and trigger effects
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Ring expansion for celebration
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // Show success checkmark
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('✅ Success animation complete - starting sparkles...');
    });
    
    // Animate sparkle particles
    const sparkleAnimations = sparkleParticles.map((particle, index) => {
      const angle = (particle.rotation * Math.PI) / 180;
      const distance = 90 + (index % 2) * 20; // Varied distances
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      
      return Animated.sequence([
        Animated.delay(particle.delay),
        Animated.parallel([
          Animated.timing(particle.scale, {
            toValue: 0.8 + (index % 3) * 0.2, // Varied sizes
            duration: 400,
            easing: Easing.out(Easing.back(2)),
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateX, {
            toValue: endX,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateY, {
            toValue: endY,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Twinkle effect
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: 0.4,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Fade out sparkles
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);
    });
    
    Animated.parallel(sparkleAnimations).start();
    
    // Wait for FULL celebration sequence to complete before transitioning
    setTimeout(() => {
      if (!isMountedRef.current) return;
      
      console.log('🎊 Full success celebration complete - transitioning to feedback...');
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        if (isMountedRef.current) {
          onComplete();
        }
      });
    }, 4500); // Extended timing to ensure full celebration plays (400 + 300 + 500 + 3300 sparkle time)
  };

  const triggerSuccessAnimation = () => {
    // Stop pulse animation
    pulseAnim.stopAnimation();
    
    // Success haptic feedback
    notificationAsync(NotificationFeedbackType.Success);
    
    // Success animation sequence
    Animated.sequence([
      // Scale up the circle with bounce
      Animated.timing(scaleAnim, {
        toValue: 1.25,
        duration: 400,
        easing: Easing.out(Easing.back(1.8)),
        useNativeDriver: true,
      }),
      // Scale back to normal and trigger effects
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Ring expansion for celebration
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // Show success checkmark
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animate sparkle particles
    const sparkleAnimations = sparkleParticles.map((particle, index) => {
      const angle = (particle.rotation * Math.PI) / 180;
      const distance = 90 + (index % 2) * 20; // Varied distances
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      
      return Animated.sequence([
        Animated.delay(particle.delay),
        Animated.parallel([
          Animated.timing(particle.scale, {
            toValue: 0.8 + (index % 3) * 0.2, // Varied sizes
            duration: 400,
            easing: Easing.out(Easing.back(2)),
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateX, {
            toValue: endX,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateY, {
            toValue: endY,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Twinkle effect
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: 0.4,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Fade out sparkles
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);
    });
    
    Animated.parallel(sparkleAnimations).start();
    
    // Wait for full celebration sequence to complete
    setTimeout(() => {
      if (!isMounted) return;
      
      console.log('🎊 Success animation complete - transitioning to feedback...');
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        if (isMountedRef.current) {
          onComplete();
        }
      });
    }, 4000); // Extended from 3000 to 4000ms for full celebration
  };

  const currentStage = GRADING_STAGES[currentStageIndex];
  const circumference = 2 * Math.PI * 110; // radius = 110
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.container, { backgroundColor: Colors.black }]}>
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          {/* Success Ring Effect */}
          <Animated.View 
            style={[
              styles.successRing,
              {
                transform: [{ scale: ringAnim }],
                opacity: Animated.subtract(1, ringAnim),
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(168, 85, 247, 0.6)', 'rgba(34, 197, 94, 0.4)', 'rgba(245, 158, 11, 0.3)']}
              style={styles.ringGradient}
            />
          </Animated.View>

          <Animated.View 
            style={[
              styles.progressCircle,
              {
                transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }]
              }
            ]}
          >
            <Svg width={260} height={260} style={styles.svg}>
              <Defs>
                <SvgLinearGradient id="gradingProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#A855F7" stopOpacity="1" />
                  <Stop offset="40%" stopColor="#22C55E" stopOpacity="1" />
                  <Stop offset="80%" stopColor="#F59E0B" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#3B82F6" stopOpacity="1" />
                </SvgLinearGradient>
              </Defs>
              {/* Background circle */}
              <Circle
                cx="130"
                cy="130"
                r="110"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="14"
                fill="none"
              />
              {/* Progress circle */}
              <Circle
                cx="130"
                cy="130"
                r="110"
                stroke="url(#gradingProgressGradient)"
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 130 130)"
              />
            </Svg>
          
            {/* Sparkle Particles */}
            <View style={styles.sparkleContainer}>
              {sparkleParticles.map((particle) => (
                <Animated.View
                  key={particle.id}
                  style={[
                    styles.sparkleParticle,
                    {
                      transform: [
                        { translateX: particle.translateX },
                        { translateY: particle.translateY },
                        { scale: particle.scale },
                        { rotate: `${particle.rotation}deg` },
                      ],
                      opacity: particle.opacity,
                    }
                  ]}
                >
                  <Ionicons 
                    name="star" 
                    size={14} 
                    color={particle.id % 3 === 0 ? '#A855F7' : particle.id % 3 === 1 ? '#22C55E' : '#F59E0B'} 
                  />
                </Animated.View>
              ))}
            </View>
            
            {/* Center content */}
            <View style={styles.centerContent}>
              {isComplete ? (
                <Animated.View 
                  style={[
                    styles.successIcon,
                    {
                      transform: [{ scale: successAnim }],
                      opacity: successAnim,
                    }
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={70} color="#22C55E" />
                </Animated.View>
              ) : (
                <Animated.View style={[styles.iconContainer, { opacity: stageIconOpacity }]}>
                  <Ionicons 
                    name={currentStage?.icon as any} 
                    size={56} 
                    color="#A855F7" 
                  />
                  <Text style={styles.progressText}>
                    {Math.round(progress)}%
                  </Text>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        </View>

        {/* Stage Information */}
        <View style={styles.stageInfoContainer}>
          <Animated.View style={[styles.stageInfo, { opacity: stageTextOpacity }]}>
            <Text style={styles.stageTitle} numberOfLines={1} ellipsizeMode="tail">
              {isComplete ? '🎉 Feedback ready!' : currentStage?.title}
            </Text>
            <Text style={styles.stageSubtitle} numberOfLines={2} ellipsizeMode="tail">
              {isComplete 
                ? 'Your personalized interview feedback is complete' 
                : currentStage?.subtitle
              }
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  accentStreak: {
    position: 'absolute',
    top: -60,
    left: -60,
    right: -60,
    height: '70%',
    transform: [{ rotate: '12deg' }],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
    gap: 40,
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successRing: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    alignItems: 'center',
    justifyContent: 'center',
    top: -40,
    left: -40,
  },
  ringGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 170,
  },
  progressCircle: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  sparkleContainer: {
    position: 'absolute',
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleParticle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    ...TYPOGRAPHY.heading1,
    color: '#FFFFFF',
    marginTop: 18,
    fontWeight: '700',
  },
  successIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageInfoContainer: {
    height: 110,
    width: '100%',
    position: 'relative',
    paddingHorizontal: 20,
  },
  stageInfo: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageTitle: {
    ...TYPOGRAPHY.displaySmall,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    height: 40,
    paddingHorizontal: 8,
    fontWeight: '600',
  },
  stageSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    height: 54,
    paddingHorizontal: 8,
    lineHeight: 22,
  },
});

export default InterviewGradingProgress;