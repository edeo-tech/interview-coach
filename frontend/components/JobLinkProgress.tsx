import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import ChatGPTBackground from './ChatGPTBackground';
import { GlassStyles, GlassTextColors } from '../constants/GlassStyles';
import useHapticsSafely from '../hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';

interface JobAnalysisStage {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  duration: number; // in milliseconds
}

const JOB_ANALYSIS_STAGES: JobAnalysisStage[] = [
  {
    id: 'fetching',
    title: 'Finding job posting',
    subtitle: 'Retrieving job details from the web',
    icon: 'search-outline',
    duration: 2000,
  },
  {
    id: 'analyzing',
    title: 'Understanding requirements',
    subtitle: 'Analyzing role responsibilities and skills',
    icon: 'analytics-outline',
    duration: 2500,
  },
  {
    id: 'researching',
    title: 'Researching company',
    subtitle: 'Learning about interview process and values',
    icon: 'business-outline',
    duration: 2800,
  },
  {
    id: 'mapping',
    title: 'Mapping interview stages',
    subtitle: 'Identifying typical interview steps',
    icon: 'map-outline',
    duration: 2200,
  },
  {
    id: 'building',
    title: 'Creating mock process',
    subtitle: 'Building your personalized experience',
    icon: 'construct-outline',
    duration: 1500,
  },
];

interface JobLinkProgressProps {
  onComplete: () => void;
}

const JobLinkProgress: React.FC<JobLinkProgressProps> = ({ onComplete }) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { impactAsync, notificationAsync } = useHapticsSafely();
  
  // Animation values
  const progressAnim = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const fadeAnim = useState(new Animated.Value(1))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];
  const successAnim = useState(new Animated.Value(0))[0];
  const burstAnim = useState(new Animated.Value(0))[0];
  const ringAnim = useState(new Animated.Value(0))[0];
  
  // Stage transition animations
  const stageTextOpacity = useState(new Animated.Value(1))[0];
  const stageIconOpacity = useState(new Animated.Value(1))[0];
  
  // Burst particles
  const [burstParticles] = useState(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      scale: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotation: (i * 30), // 30 degrees apart
    }))
  );

  useEffect(() => {
    startProgressAnimation();
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
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
      if (stageIndex >= JOB_ANALYSIS_STAGES.length) {
        // All stages complete - trigger success animation
        setIsComplete(true);
        triggerSuccessAnimation();
        return;
      }

      const stage = JOB_ANALYSIS_STAGES[stageIndex];
      const stageProgress = (stageIndex + 1) / JOB_ANALYSIS_STAGES.length;
      const targetProgress = stageProgress * 100;

      // Animate stage transition
      Animated.parallel([
        // Fade out current content
        Animated.timing(stageTextOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(stageIconOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Update stage after fade out
        setCurrentStageIndex(stageIndex);
        
        // Haptic feedback for stage transition
        impactAsync(ImpactFeedbackStyle.Light);
        
        // Fade in new content
        Animated.parallel([
          Animated.timing(stageTextOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(stageIconOpacity, {
            toValue: 1,
            duration: 300,
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
        currentProgress += (targetProgress - currentProgress) * 0.05;
        setProgress(Math.min(currentProgress, targetProgress));
        
        if (currentProgress >= targetProgress - 1) {
          clearInterval(progressInterval);
          setTimeout(() => {
            stageIndex++;
            animateStage();
          }, 300); // Brief pause between stages
        }
      }, 50);
    };

    animateStage();
  };

  const triggerSuccessAnimation = () => {
    // Stop pulse animation
    pulseAnim.stopAnimation();
    
    // Success haptic feedback
    notificationAsync(NotificationFeedbackType.Success);
    
    // Success animation sequence
    Animated.sequence([
      // Scale up the circle
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      // Scale back to normal and trigger burst
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Trigger burst animation
        Animated.timing(burstAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Ring expansion
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // Show success checkmark
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animate burst particles
    const particleAnimations = burstParticles.map((particle, index) => {
      const angle = (particle.rotation * Math.PI) / 180;
      const distance = 80;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      
      return Animated.parallel([
        Animated.timing(particle.scale, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateX, {
          toValue: endX,
          duration: 600,
          delay: index * 50,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: endY,
          duration: 600,
          delay: index * 50,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]);
    });
    
    Animated.parallel(particleAnimations).start();
    
    // Fade out particles
    setTimeout(() => {
      const fadeOutAnimations = burstParticles.map((particle, index) => 
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 400,
          delay: index * 30,
          useNativeDriver: true,
        })
      );
      Animated.parallel(fadeOutAnimations).start();
    }, 800);
    
    // Wait a moment then call onComplete - extended timing for celebration
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onComplete();
      });
    }, 2500);
  };

  const currentStage = JOB_ANALYSIS_STAGES[currentStageIndex];
  const circumference = 2 * Math.PI * 100; // radius = 100
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      {/* Design System Background */}
      <LinearGradient
        colors={[
          '#0F172A', // primary 900
          '#1E293B', // primary 800
          '#334155', // primary 700
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      {/* Design System Accent Streaks for job flow */}
      <LinearGradient
        colors={[
          'rgba(34, 197, 94, 0.08)', // success green
          'rgba(168, 85, 247, 0.05)', // purple 400
          'rgba(252, 180, 0, 0)', // gold 400
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.7 }}
        style={styles.accentStreak}
      />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          {/* Burst Ring Effect - Design System Colors */}
          <Animated.View 
            style={[
              styles.burstRing,
              {
                transform: [
                  { scale: ringAnim },
                ],
                opacity: Animated.subtract(1, ringAnim),
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.6)', 'rgba(168, 85, 247, 0.4)', 'rgba(252, 180, 0, 0.2)']}
              style={styles.ringGradient}
            />
          </Animated.View>

          <Animated.View 
            style={[
              styles.progressCircle,
              {
                transform: [
                  { scale: Animated.multiply(scaleAnim, pulseAnim) }
                ]
              }
            ]}
          >
          <Svg width={240} height={240} style={styles.svg}>
            <Defs>
              <SvgLinearGradient id="jobProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#22C55E" stopOpacity="1" />
                <Stop offset="50%" stopColor="#A855F7" stopOpacity="1" />
                <Stop offset="100%" stopColor="#FCB000" stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            {/* Background circle */}
            <Circle
              cx="120"
              cy="120"
              r="100"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            <Circle
              cx="120"
              cy="120"
              r="100"
              stroke="url(#jobProgressGradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 120 120)"
            />
          </Svg>
          
          {/* Burst Particles */}
          <View style={styles.burstContainer}>
            {burstParticles.map((particle) => (
              <Animated.View
                key={particle.id}
                style={[
                  styles.burstParticle,
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
                <LinearGradient
                  colors={['#22C55E', '#A855F7']}
                  style={styles.particleGradient}
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
                <Ionicons name="checkmark" size={60} color="#22C55E" />
              </Animated.View>
            ) : (
              <Animated.View style={[styles.iconContainer, { opacity: stageIconOpacity }]}>
                <Ionicons 
                  name={currentStage?.icon as any} 
                  size={52} 
                  color="#22C55E" 
                />
                <Text style={styles.progressText}>
                  {Math.round(progress)}%
                </Text>
              </Animated.View>
            )}
          </View>
          </Animated.View>
        </View>

        {/* Stage Information - Design System Typography */}
        <View style={styles.stageInfoContainer}>
          <Animated.View style={[styles.stageInfo, { opacity: stageTextOpacity }]}>
            <Text style={styles.stageTitle} numberOfLines={1} ellipsizeMode="tail">
              {isComplete ? '🎯 Ready to interview!' : currentStage?.title}
            </Text>
            <Text style={styles.stageSubtitle} numberOfLines={2} ellipsizeMode="tail">
              {isComplete ? 'Your personalized mock interview process is ready' : currentStage?.subtitle}
            </Text>
          </Animated.View>
        </View>

      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    top: -50,
    left: -50,
    right: -50,
    height: '60%',
    transform: [{ rotate: '15deg' }],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 36,
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  burstRing: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    alignItems: 'center',
    justifyContent: 'center',
    top: -40, // Center on progress circle
    left: -40,
  },
  ringGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 160,
  },
  progressCircle: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  burstContainer: {
    position: 'absolute',
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burstParticle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  particleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
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
    color: '#FFFFFF',
    fontSize: 24, // heading h3
    fontWeight: '700',
    marginTop: 16,
    fontFamily: 'SpaceGrotesk',
    letterSpacing: -0.01,
  },
  successIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageInfoContainer: {
    height: 100,
    width: '100%',
    position: 'relative',
    paddingHorizontal: 16,
  },
  stageInfo: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageTitle: {
    color: '#FFFFFF',
    fontSize: 28, // heading h1
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    height: 36,
    lineHeight: 36,
    paddingHorizontal: 4,
    fontFamily: 'SpaceGrotesk',
    letterSpacing: -0.01,
  },
  stageSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    height: 50,
    paddingHorizontal: 4,
    fontFamily: 'Inter',
  },
});

export default JobLinkProgress;