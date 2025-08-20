import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

interface UploadStage {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  duration: number; // in milliseconds
}

const UPLOAD_STAGES: UploadStage[] = [
  {
    id: 'uploading',
    title: 'Uploading document',
    subtitle: 'Securely transferring your CV',
    icon: 'cloud-upload-outline',
    duration: 1500,
  },
  {
    id: 'scanning',
    title: 'Scanning content',
    subtitle: 'Reading and extracting text',
    icon: 'scan-outline',
    duration: 2000,
  },
  {
    id: 'analyzing',
    title: 'Understanding experience',
    subtitle: 'Analyzing your skills and background',
    icon: 'analytics-outline',
    duration: 2500,
  },
  {
    id: 'processing',
    title: 'Building your profile',
    subtitle: 'Creating personalized interview questions',
    icon: 'construct-outline',
    duration: 2000,
  },
  {
    id: 'finalizing',
    title: 'Finalizing setup',
    subtitle: 'Preparing your interview experience',
    icon: 'checkmark-circle-outline',
    duration: 1000,
  },
];

interface CVUploadProgressProps {
  onComplete: () => void;
}

const CVUploadProgress: React.FC<CVUploadProgressProps> = ({ onComplete }) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  // Animation values
  const progressAnim = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const fadeAnim = useState(new Animated.Value(1))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];
  const successAnim = useState(new Animated.Value(0))[0];

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
      if (stageIndex >= UPLOAD_STAGES.length) {
        // All stages complete - trigger success animation
        setIsComplete(true);
        triggerSuccessAnimation();
        return;
      }

      const stage = UPLOAD_STAGES[stageIndex];
      const stageProgress = (stageIndex + 1) / UPLOAD_STAGES.length;
      const targetProgress = stageProgress * 100;

      setCurrentStageIndex(stageIndex);

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
    
    // Success animation sequence
    Animated.sequence([
      // Scale up the circle
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      // Scale back to normal
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // Show success checkmark
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Wait a moment then call onComplete
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          onComplete();
        });
      }, 1500);
    });
  };

  const currentStage = UPLOAD_STAGES[currentStageIndex];
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        {/* Progress Circle */}
        <View style={styles.progressContainer}>
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
            <Svg width={200} height={200} style={styles.svg}>
              {/* Background circle */}
              <Circle
                cx="100"
                cy="100"
                r="90"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <Circle
                cx="100"
                cy="100"
                r="90"
                stroke="#8b5cf6"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 100 100)"
              />
            </Svg>
            
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
                  <Ionicons name="checkmark" size={60} color="#10b981" />
                </Animated.View>
              ) : (
                <>
                  <Ionicons 
                    name={currentStage?.icon as any} 
                    size={48} 
                    color="#8b5cf6" 
                  />
                  <Text style={styles.progressText}>
                    {Math.round(progress)}%
                  </Text>
                </>
              )}
            </View>
          </Animated.View>
        </View>

        {/* Stage Information */}
        <View style={styles.stageInfo}>
          <Text style={styles.stageTitle}>
            {isComplete ? 'Success!' : currentStage?.title}
          </Text>
          <Text style={styles.stageSubtitle}>
            {isComplete ? 'Your CV has been processed successfully' : currentStage?.subtitle}
          </Text>
        </View>

        {/* Stage Indicators */}
        <View style={styles.stageIndicators}>
          {UPLOAD_STAGES.map((stage, index) => (
            <View
              key={stage.id}
              style={[
                styles.stageIndicator,
                index <= currentStageIndex && styles.stageIndicatorActive,
                index === currentStageIndex && !isComplete && styles.stageIndicatorCurrent,
              ]}
            />
          ))}
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={16} color="#10b981" />
            <Text style={styles.infoText}>Securely encrypted</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={16} color="#8b5cf6" />
            <Text style={styles.infoText}>Usually takes 10-15 seconds</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressCircle: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  successIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 40,
    padding: 20,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  stageInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stageTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  stageSubtitle: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  stageIndicators: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  stageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stageIndicatorActive: {
    backgroundColor: '#8b5cf6',
  },
  stageIndicatorCurrent: {
    backgroundColor: '#ffffff',
  },
  additionalInfo: {
    gap: 12,
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});

export default CVUploadProgress;