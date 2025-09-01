import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { getNavigationDirection, setNavigationDirection } from '../../utils/navigationDirection';
import { TYPOGRAPHY } from '../../constants/Typography';
import Colors from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProblemValidation = () => {
  const { data } = useOnboarding();

  // Animation values - exactly like profile-setup
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const buttonTranslateY = useRef(new Animated.Value(0)).current;

  // Entrance animation - exactly like profile-setup with direction awareness
  useFocusEffect(
    React.useCallback(() => {
      // Determine slide direction based on last navigation direction
      const slideInFrom = getNavigationDirection() === 'back' ? -SCREEN_WIDTH : SCREEN_WIDTH;
      
      // Reset to slide-in position 
      contentTranslateX.setValue(slideInFrom);
      buttonTranslateY.setValue(30);
      contentOpacity.setValue(0);
      buttonOpacity.setValue(0);
      
      // Add a brief pause before sliding in new content for a more relaxed feel - exactly like profile-setup
      setTimeout(() => {
        // Animate in content and button together with gentle timing - exactly like profile-setup
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
          }),
          // Button animates in slightly after content starts, creating a nice cascade - exactly like profile-setup
          Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
              Animated.timing(buttonOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(buttonTranslateY, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              })
            ])
          ])
        ]).start();
      }, 100);
    }, [])
  );
  
  const handleContinue = () => {
    // Set direction for next screen
    setNavigationDirection('forward');
    
    // Slide out to left (forward direction) - exactly like profile-setup
    Animated.parallel([
      Animated.timing(contentTranslateX, {
        toValue: -SCREEN_WIDTH,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY, {
        toValue: 30,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Navigate after animation completes
      setTimeout(() => {
        router.push('/(onboarding)/demo');
      }, 100);
    });
  };

  const handleBack = () => {
    // Set direction for previous screen
    setNavigationDirection('back');
    
    // Slide out to right (back direction) - exactly like profile-setup
    Animated.parallel([
      Animated.timing(contentTranslateX, {
        toValue: SCREEN_WIDTH,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY, {
        toValue: 30,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      setTimeout(() => {
        router.back();
      }, 100);
    });
  };

  const getPrimaryProblem = () => {
    const ratings = {
      preparation: data.preparationRating || 0,
      communication: data.communicationRating || 0,
      nerves: data.nervesRating || 0,
    };

    // Find the highest rating (most problematic area)
    const highestRating = Math.max(...Object.values(ratings));
    const primaryProblemKey = Object.keys(ratings).find(key => ratings[key] === highestRating) || 'preparation';
    
    const problemMap = {
      preparation: 'lack of preparation',
      communication: 'communication issues', 
      nerves: 'interview nerves'
    };

    return {
      name: problemMap[primaryProblemKey],
      rating: highestRating,
      area: primaryProblemKey
    };
  };

  const primaryProblem = getPrimaryProblem();
  const industryName = data.industry ? data.industry.charAt(0).toUpperCase() + data.industry.slice(1) : 'your field';

  const getInsightText = () => {
    const hasFailedBefore = data.hasFailed;
    
    if (hasFailedBefore) {
      return `Looking back at your interview struggles, your main challenge was ${primaryProblem.name}.`;
    } else {
      return `Based on your self-assessment, your biggest interview concern is ${primaryProblem.name}.`;
    }
  };

  const getInsightBullets = () => {
    switch (primaryProblem.area) {
      case 'preparation':
        return [
          '73% of failed interviews trace back to inadequate preparation',
          'Most rejections happen to qualified candidates who "wing it"',
          'Strategic preparation beats raw qualifications every time'
        ];
      case 'communication':
        return [
          '68% of rejections happen due to poor communication skills',
          'Technical skills matter less than clear articulation',
          'Strong communicators stand out instantly'
        ];
      case 'nerves':
        return [
          '61% of qualified candidates self-sabotage due to anxiety',
          'Interview nerves are manageable with the right techniques',
          'Confidence can be learned and practiced'
        ];
      default:
        return [
          'Most interview failures aren\'t about credentials',
          'Preparation and presentation matter more than experience',
          'Success comes from mastering the interview process'
        ];
    }
  };

  const getSolutionTitle = () => {
    switch (primaryProblem.area) {
      case 'preparation':
        return 'Strategic preparation is the difference';
      case 'communication':
        return 'Clear communication sets you apart';
      case 'nerves':
        return 'Confidence can be mastered';
      default:
        return 'Success is about preparation, not perfection';
    }
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress 
          currentStep={14} 
          totalSteps={17}
          onBack={handleBack}
        />
        
        {/* Animated content container - exactly like profile-setup */}
        <Animated.View 
          style={[
            styles.animatedContent,
            {
              transform: [{ translateX: contentTranslateX }],
              opacity: contentOpacity,
            }
          ]}
        >
          <ScrollView 
            style={styles.scrollContent} 
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {/* Header Section */}
              <View style={styles.headerSection}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name="analytics" 
                    size={48} 
                    color={Colors.brand.primary} 
                  />
                </View>
                <Text style={styles.screenTitle}>Here's what we found</Text>
                <Text style={styles.introText}>
                  {getInsightText()}
                </Text>
              </View>

              {/* Problem Highlight Card */}
              <View style={styles.problemCard}>
                <View style={styles.problemHeader}>
                  <View style={styles.problemIcon}>
                    <Ionicons 
                      name={primaryProblem.area === 'preparation' ? 'library' : 
                            primaryProblem.area === 'communication' ? 'chatbubbles' : 'heart'} 
                      size={24} 
                      color={Colors.brand.primary} 
                    />
                  </View>
                  <Text style={styles.problemLabel}>Primary Challenge</Text>
                </View>
                <Text style={styles.highlightText}>
                  {primaryProblem.name}
                </Text>
                <View style={styles.ratingIndicator}>
                  <Text style={styles.ratingText}>Severity: {primaryProblem.rating}/5</Text>
                  <View style={styles.ratingBar}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <View 
                        key={level}
                        style={[
                          styles.ratingDot,
                          level <= primaryProblem.rating && styles.ratingDotActive
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>
              
              {/* Insights Section */}
              <View style={styles.insightsSection}>
                <Text style={styles.sectionTitle}>
                  {getSolutionTitle()}
                </Text>
                <View style={styles.insightContainer}>
                  {getInsightBullets().map((insight, index) => (
                    <View key={index} style={styles.insightRow}>
                      <View style={styles.insightBullet}>
                        <Ionicons name="checkmark" size={14} color={Colors.brand.primary} />
                      </View>
                      <Text style={styles.insightItem}>
                        {insight}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Next Steps Preview */}
              <View style={styles.nextStepsCard}>
                <View style={styles.nextStepsHeader}>
                  <Ionicons name="rocket" size={20} color={Colors.accent.gold} />
                  <Text style={styles.nextStepsTitle}>What's next?</Text>
                </View>
                <Text style={styles.nextStepsText}>
                  We'll show you exactly how to tackle {primaryProblem.name} with personalized practice sessions.
                </Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>

        <Animated.View 
          style={[
            styles.bottomContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>I want to be prepared</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
  },
  animatedContent: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 100, // Space for button
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingVertical: 32,
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.glass.backgroundInput,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
    fontFamily: 'Nunito-SemiBold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  introText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: 8,
    lineHeight: 22,
  },
  
  // Problem Card
  problemCard: {
    backgroundColor: Colors.glass.backgroundInput,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  problemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  problemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.glass.purpleTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  problemLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightText: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily: 'Nunito-SemiBold',
    color: Colors.brand.primary,
    marginBottom: 16,
  },
  ratingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: Colors.text.tertiary,
  },
  ratingBar: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.glass.border,
  },
  ratingDotActive: {
    backgroundColor: Colors.brand.primary,
  },
  
  // Insights Section
  insightsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    fontFamily: 'Nunito-SemiBold',
    color: Colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  insightContainer: {
    gap: 12,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  insightBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.glass.purpleTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  insightItem: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  
  // Next Steps Card
  nextStepsCard: {
    backgroundColor: Colors.glass.backgroundInput,
    borderRadius: 24,
    padding: 20,
  },
  nextStepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextStepsTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Nunito-SemiBold',
    color: Colors.accent.gold,
    marginLeft: 8,
  },
  nextStepsText: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.glass.purple,
    borderWidth: 1,
    borderColor: Colors.brand.primaryRGB,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.white,
    marginRight: 8,
  },
});

export default ProblemValidation;