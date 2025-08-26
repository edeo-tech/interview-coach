import { useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const useOnboardingNavigation = () => {
  const navigation = useNavigation();
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const navigateWithTransition = (route: string) => {
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
      router.push(route as any);
    });
  };

  const animateIn = (direction: 'forward' | 'back' = 'forward') => {
    if (direction === 'back') {
      // For back navigation, slide in from left or no animation
      contentTranslateX.setValue(-SCREEN_WIDTH);
      contentOpacity.setValue(0);
    } else {
      // For forward navigation, slide in from right
      contentTranslateX.setValue(SCREEN_WIDTH);
      contentOpacity.setValue(0);
    }

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
  };

  const animateInInstantly = () => {
    // For back navigation - just appear without animation
    contentTranslateX.setValue(0);
    contentOpacity.setValue(1);
  };

  return {
    contentTranslateX,
    contentOpacity,
    navigateWithTransition,
    animateIn,
    animateInInstantly,
  };
};