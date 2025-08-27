import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ChatGPTBackground from './ChatGPTBackground';
import OnboardingProgress from './OnboardingProgress';
import Colors from '../constants/Colors';

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  currentStep,
  totalSteps,
  children,
  showBackButton = false,
  onBackPress
}) => {
  const navigation = useNavigation();
  // Animation for content sliding
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    React.useCallback(() => {
      // For the old OnboardingLayout - just animate in from right
      contentTranslateX.setValue(SCREEN_WIDTH);
      contentOpacity.setValue(0);

      // Slide in animation
      Animated.parallel([
        Animated.timing(contentTranslateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }, [])
  );

  const slideOutAndNavigate = (navigationFn: () => void) => {
    // Slide out current content to the left
    Animated.parallel([
      Animated.timing(contentTranslateX, {
        toValue: -SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Navigate after animation completes
      navigationFn();
    });
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        {/* Persistent elements - these stay in place */}
        <View style={styles.persistentHeader}>
          <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
        </View>
        
        {/* Animated content container */}
        <Animated.View 
          style={[
            styles.animatedContent,
            {
              transform: [{ translateX: contentTranslateX }],
              opacity: contentOpacity,
            }
          ]}
        >
          {children}
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
    backgroundColor: Colors.transparent,
  },
  persistentHeader: {
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    // Remove padding - OnboardingProgress handles its own padding
  },
  animatedContent: {
    flex: 1,
  },
});

export default OnboardingLayout;
export { OnboardingLayout };