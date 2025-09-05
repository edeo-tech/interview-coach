import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TYPOGRAPHY } from '../constants/Typography';
import Colors from '../constants/Colors';
import useHapticsSafely from '../hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle } from 'expo-haptics';

interface OnboardingSkipWarningProps {
  visible: boolean;
  onClose: () => void;
  onSkip: () => void;
  type: 'cv' | 'job';
}

const OnboardingSkipWarning: React.FC<OnboardingSkipWarningProps> = ({
  visible,
  onClose,
  onSkip,
  type
}) => {
  const { impactAsync } = useHapticsSafely();

  const handleSkip = () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    onSkip();
  };

  const handleClose = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    onClose();
  };

  const getContent = () => {
    if (type === 'cv') {
      return {
        title: 'Skip CV Upload?',
        message: 'You\'ll eventually need to upload your CV for the best interview experience. Without it, the demo will not be as personalized.',
        icon: 'document-text-outline'
      };
    } else {
      return {
        title: 'Skip Job Details?',
        message: 'You\'ll eventually need to add job details for targeted interview practice. Without it, the demo will be more generic.',
        icon: 'briefcase-outline'
      };
    }
  };

  const content = getContent();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={[
              Colors.glass.backgroundSecondary,
              Colors.glass.backgroundInput,
            ]}
            style={styles.modalContent}
          >
            {/* Header with Icon */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={content.icon as any} 
                  size={32} 
                  color={Colors.accent.gold} 
                />
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={Colors.text.quaternary} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>{content.title}</Text>
              <Text style={styles.message}>{content.message}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue Setup</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.8}
              >
                <Text style={styles.skipButtonText}>Skip for Now</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
  },
  modalContent: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.glass.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.goldMedium,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.glass.backgroundSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginBottom: 24,
  },
  title: {
    ...TYPOGRAPHY.heading2,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 12,
  },
  continueButton: {
    backgroundColor: Colors.glass.purple,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.brand.primary,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.text.primary,
  },
  skipButton: {
    backgroundColor: Colors.glass.backgroundSubtle,
    borderRadius: 28,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.borderSecondary,
  },
  skipButtonText: {
    ...TYPOGRAPHY.buttonMedium,
    color: Colors.text.tertiary,
  },
});

export default OnboardingSkipWarning;