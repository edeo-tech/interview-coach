import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import useHapticsSafely from '../hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';
import { TYPOGRAPHY } from '../constants/Typography';
import Colors from '../constants/Colors';

interface InterviewLikelihoodRevealProps {
  score: number;
  onContinue: () => void;
}

const getAdvancementLabel = (score: number) => {
  if (score >= 90) return 'Very Likely';
  if (score >= 80) return 'Likely';
  if (score >= 70) return 'Moderate';
  if (score >= 60) return 'Unlikely';
  return 'Very Unlikely';
};

const getScoreColor = (score: number): string => {
  if (score >= 90) return Colors.semantic.successAlt;
  if (score >= 80) return Colors.accent.blueAlt;
  if (score >= 70) return Colors.accent.gold;
  if (score >= 60) return Colors.semantic.warning;
  return Colors.semantic.error;
};

const getScoreMessage = (score: number): string => {
  if (score >= 90) return "Excellent! You're very likely to advance to the next interview round.";
  if (score >= 80) return "Strong showing! You have a high probability of progressing forward.";
  if (score >= 70) return "Solid performance! You have a moderate chance of advancing.";
  if (score >= 60) return "Room for improvement, but you still have a chance to progress.";
  return "Consider practicing more before your next interview to improve your advancement odds.";
};

const InterviewLikelihoodReveal: React.FC<InterviewLikelihoodRevealProps> = ({ 
  score, 
  onContinue 
}) => {
  const isMountedRef = useRef(true);
  const { impactAsync, notificationAsync } = useHapticsSafely();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [progressAnim] = useState(new Animated.Value(0));
  const [textFadeAnim] = useState(new Animated.Value(0));
  const [buttonFadeAnim] = useState(new Animated.Value(0));
  
  // State for animated progress
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    startRevealAnimation();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const startRevealAnimation = () => {
    // Phase 1: Fade in container
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      if (!isMountedRef.current) return;
      
      // Phase 2: Scale in donut with bounce
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }).start(() => {
        if (!isMountedRef.current) return;
        
        // Phase 3: Animate progress and numbers
        startProgressAnimation();
      });
    });
  };

  const startProgressAnimation = () => {
    // Haptic feedback for progress start
    impactAsync(ImpactFeedbackStyle.Light);
    
    // Animate the SVG progress
    Animated.timing(progressAnim, {
      toValue: score,
      duration: 2000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Animate the number counting up
    const interval = setInterval(() => {
      if (!isMountedRef.current) {
        clearInterval(interval);
        return;
      }
      
      setDisplayScore(prev => {
        const increment = Math.ceil((score - prev) * 0.08);
        const newScore = prev + increment;
        
        if (newScore >= score) {
          clearInterval(interval);
          if (isMountedRef.current) {
            setDisplayScore(score);
            // Success haptic when reaching final score
            notificationAsync(NotificationFeedbackType.Success);
            // Show text and button after number completes
            showTextAndButton();
          }
          return score;
        }
        return newScore;
      });
    }, 40);
  };

  const showTextAndButton = () => {
    // Phase 4: Show description text
    Animated.timing(textFadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      if (!isMountedRef.current) return;
      
      // Phase 5: Show continue button
      setTimeout(() => {
        if (isMountedRef.current) {
          Animated.timing(buttonFadeAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start();
        }
      }, 800);
    });
  };

  const handleContinue = () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    onContinue();
  };

  const CircularProgress = ({ score, size = 180 }: { score: number, size?: number }) => {
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const color = getScoreColor(score);

    return (
      <View style={styles.circularProgressContainer}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Svg width={size} height={size}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={Colors.glass.background}
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (displayScore / 100) * circumference}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
        </Animated.View>
        
        {/* Center content */}
        <View style={styles.circularProgressCenter}>
          <Text style={[styles.circularProgressScore, { color }]}>
            {displayScore}%
          </Text>
          <Text style={styles.circularProgressLabel}>
            {getAdvancementLabel(score)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
        
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Will You Advance?</Text>
        </View>
        
        <View style={styles.subtitleContainer}>
          <Text style={styles.mainSubtitle}>Your likelihood of progressing to the next interview round:</Text>
        </View>

        <View style={styles.progressSection}>
          <CircularProgress score={score} />
        </View>

        <Animated.View style={[styles.messageContainer, { opacity: textFadeAnim }]}>
          <Text style={styles.resultMessage}>
            {getScoreMessage(score)}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, { opacity: buttonFadeAnim }]}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>View Detailed Feedback</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </Animated.View>

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
    backgroundColor: Colors.black,
    zIndex: 1000,
  },
  mainContent: {
    flex: 1,
    paddingTop: 120,
    paddingBottom: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    ...TYPOGRAPHY.displayMedium,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  subtitleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 60,
  },
  mainSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  circularProgressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  circularProgressScore: {
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 4,
  },
  circularProgressLabel: {
    color: Colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  messageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 30,
  },
  resultMessage: {
    fontSize: 19,
    fontWeight: '500',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: Colors.glass.purple,
    borderWidth: 2,
    borderColor: Colors.brand.primary,
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});

export default InterviewLikelihoodReveal;