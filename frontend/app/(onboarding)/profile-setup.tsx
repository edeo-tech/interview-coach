import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  Image, 
  TextInput,
  KeyboardAvoidingView,
  Animated,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { TYPOGRAPHY } from '../../constants/Typography';
import Colors from '../../constants/Colors';
import useHapticsSafely from '../../hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle } from 'expo-haptics';
import { useAuth } from '../../context/authentication/AuthContext';
import { useUpdateProfile } from '../../_queries/users/auth/users';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Step = 'profile' | 'name' | 'age';

const ProfileSetup = () => {
  const { data, updateData } = useOnboarding();
  const { auth } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const [currentStep, setCurrentStep] = useState<Step>('profile');
  const [name, setName] = useState(data.name || auth?.name || '');
  const [age, setAge] = useState(data.age || '');
  const { impactAsync } = useHapticsSafely();

  useEffect(() => {
    console.log('auth?.name', auth?.name);
    console.log('data.name', data.name);
    console.log('name', name);
    console.log('age', age);
    setName(auth?.name || data.name || '');
    setAge(data.age || '');
  }, [auth?.name, data.age]);

  // Animation values
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const buttonTranslateY = useRef(new Animated.Value(0)).current;

  const getStepNumber = (step: Step): number => {
    switch (step) {
      case 'profile': return 3;
      case 'name': return 4;
      case 'age': return 5;
      default: return 3;
    }
  };

  const animateToStep = (direction: 'forward' | 'back', newStep: Step) => {
    const slideOutValue = direction === 'forward' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    const slideInValue = direction === 'forward' ? SCREEN_WIDTH : -SCREEN_WIDTH;

    // Animate out both content and button together
    Animated.parallel([
      Animated.timing(contentTranslateX, {
        toValue: slideOutValue,
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
      // NOW change the step after the content has animated out
      setCurrentStep(newStep);
      
      // Reset position for new content
      contentTranslateX.setValue(slideInValue);
      buttonTranslateY.setValue(30);
      
      // Add a brief pause before sliding in new content for a more relaxed feel
      setTimeout(() => {
        // Animate in content and button together with gentle timing
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
          // Button animates in slightly after content starts, creating a nice cascade
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
    });
  };

  const handleNext = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    console.log('Handle Next');
    
    if (currentStep === 'profile') {
      animateToStep('forward', 'name');
    } else if (currentStep === 'name' && name.trim()) {
      updateData('name', name.trim());
      
      // Save name to user document
      console.log('Saving name to user document', name.trim());
      updateProfileMutation.mutate({ name: name.trim() });
      
      animateToStep('forward', 'age');
    } else if (currentStep === 'age' && isValidAge) {
      const ageValue = parseInt(age.trim());
      updateData('age', age.trim());
      
      // Save age to user document
      console.log('Saving age to user document', ageValue);
      updateProfileMutation.mutate({ age: ageValue });
      
      // Navigate to section transition screen
      router.push('/(onboarding)/section-transition');
    }
  };

  const handleBack = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    
    if (currentStep === 'age') {
      animateToStep('back', 'name');
    } else if (currentStep === 'name') {
      animateToStep('back', 'profile');
    } else {
      // Go back to previous screen
      router.back();
    }
  };

  const isValidAge = age.trim() && !isNaN(Number(age)) && Number(age) >= 16 && Number(age) <= 100;

  const canProceed = () => {
    switch (currentStep) {
      case 'profile': return true;
      case 'name': return name.trim() !== '';
      case 'age': return isValidAge;
      default: return false;
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'profile':
        return (
          <View style={styles.content}>
            {/* Building-related icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="construct-outline" size={64} color={Colors.brand.primary} />
            </View>
            
            {/* Typography following design system hierarchy */}
            <View style={styles.titleContainer}>
              <Text style={styles.titleMain}>Let's build your</Text>
              <Text style={styles.titleBrand}>profile</Text>
            </View>
            
            <Text style={styles.subtitle}>
              We'll create a personalized interview prep plan tailored just for you.
            </Text>
          </View>
        );

      case 'name':
        return (
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={48} color={Colors.brand.primary} />
            </View>
            
            <View style={styles.titleSection}>
              <Text style={styles.screenTitle}>What's your name?</Text>
              <Text style={styles.subtitle}>
                We'll use this to personalize your experience
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your first name"
                placeholderTextColor={Colors.text.disabled}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus={true}
              />
            </View>
          </View>
        );

      case 'age':
        return (
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={48} color={Colors.brand.primary} />
            </View>
            
            <View style={styles.titleSection}>
              <Text style={styles.screenTitle}>What's your age?</Text>
              <Text style={styles.subtitle}>
                Thanks, {name}. We'll tailor this to you.
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="25"
                placeholderTextColor={Colors.text.disabled}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                autoFocus={true}
                maxLength={2}
                returnKeyType="done"
                textContentType="none"
                selectTextOnFocus={true}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 'profile': return "Let's start building";
      case 'name': return 'Continue';
      case 'age': return 'Continue';
      default: return 'Continue';
    }
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress 
          currentStep={getStepNumber(currentStep)} 
          totalSteps={5}
          onBack={handleBack}
        />
        
        <KeyboardAvoidingView 
          style={styles.keyboardContainer} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
            {renderContent()}
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
              style={[
                styles.primaryButton, 
                !canProceed() && styles.primaryButtonDisabled
              ]} 
              onPress={handleNext}
              disabled={!canProceed()}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>{getButtonText()}</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
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
  keyboardContainer: {
    flex: 1,
  },
  animatedContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  
  // Icon section - simplified like welcome screen
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconImage: {
    width: 80,
    height: 80,
  },
  
  // Typography - using enhanced typography system
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleMain: {
    ...TYPOGRAPHY.displaySmall,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  titleBrand: {
    ...TYPOGRAPHY.heroMedium,
    color: Colors.brand.primary,
    textAlign: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  screenTitle: {
    ...TYPOGRAPHY.pageTitle,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.tertiary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  
  // Input styling
  inputContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: Colors.glass.backgroundInput,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 24,
    fontSize: 18,
    color: Colors.text.primary,
    textAlign: 'center',
    width: '100%',
  },
  
  // Button section
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.glass.purple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.brand.primaryRGB,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.glass.purpleSubtle,
    borderColor: Colors.glass.purpleLight,
    shadowOpacity: 0,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.text.primary,
    marginRight: 8,
  },
});

export default ProfileSetup;