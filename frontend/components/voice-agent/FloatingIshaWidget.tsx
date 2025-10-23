import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import ColorsLight from '@/constants/ColorsLight';
import { useIshaConversation } from '@/hooks/voice-agent/useIshaConversation';

const WIDGET_SIZE = 56;
const PULSE_SCALE = 1.08;
const PULSE_DURATION = 1200; // Slower, calmer pulse

export const FloatingIshaWidget = () => {
  const insets = useSafeAreaInsets();
  const conversation = useIshaConversation();

  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  const isActive = conversation.status === 'connected';
  const isSpeaking = conversation.isSpeaking || false;

  // Pulse animation when speaking
  useEffect(() => {
    if (isSpeaking) {
      // First, smoothly fade in from 0
      scale.value = withTiming(1, { duration: 0 });
      pulseOpacity.value = withTiming(0, { duration: 400, easing: Easing.bezier(0.4, 0.0, 0.2, 1) });

      // Then start the pulsing loop
      setTimeout(() => {
        scale.value = withRepeat(
          withSequence(
            withTiming(PULSE_SCALE, { duration: PULSE_DURATION, easing: Easing.bezier(0.4, 0.0, 0.2, 1) }),
            withTiming(1, { duration: PULSE_DURATION, easing: Easing.bezier(0.4, 0.0, 0.2, 1) })
          ),
          -1,
          false
        );
        pulseOpacity.value = withRepeat(
          withSequence(
            withTiming(0.4, { duration: PULSE_DURATION, easing: Easing.bezier(0.4, 0.0, 0.2, 1) }),
            withTiming(0, { duration: PULSE_DURATION, easing: Easing.bezier(0.4, 0.0, 0.2, 1) })
          ),
          -1,
          false
        );
      }, 100);
    } else {
      scale.value = withTiming(1, { duration: 300 });
      pulseOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isSpeaking]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const handlePress = async () => {
    try {
      if (isActive) {
        await conversation.endSession();
      } else {
        await conversation.startSession();
      }
    } catch (error) {
      console.error('Error toggling Isha conversation:', error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          bottom: Platform.OS === 'ios' ? insets.bottom + 76 : 76,
          right: 16,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Pulse ring when speaking */}
      {isSpeaking && (
        <Animated.View
          style={[
            styles.pulseRing,
            animatedPulseStyle,
            {
              backgroundColor: isActive ? ColorsLight.accent.gold : ColorsLight.brand.primary,
            },
          ]}
        />
      )}

      {/* Main button */}
      <Animated.View style={animatedButtonStyle}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isActive ? ColorsLight.accent.gold : ColorsLight.brand.primary,
            },
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          {isActive ? (
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={ColorsLight.white}
            />
          ) : (
            <MaterialIcons
              name="multitrack-audio"
              size={24}
              color={ColorsLight.white}
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Active indicator dot */}
      {isActive && (
        <View style={styles.activeDot}>
          <View style={styles.activeDotInner} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: WIDGET_SIZE,
    height: WIDGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  button: {
    width: WIDGET_SIZE,
    height: WIDGET_SIZE,
    borderRadius: WIDGET_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...ColorsLight.shadow.large,
  },
  pulseRing: {
    position: 'absolute',
    width: WIDGET_SIZE + 16,
    height: WIDGET_SIZE + 16,
    borderRadius: (WIDGET_SIZE + 16) / 2,
    zIndex: -1,
  },
  activeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ColorsLight.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...ColorsLight.shadow.small,
  },
  activeDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ColorsLight.semantic.success,
  },
});
