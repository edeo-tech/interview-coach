import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MorphingBackgroundProps {
  children: React.ReactNode;
  style?: any;
  mode?: 'normal' | 'expanded';
  animationDuration?: number;
}

export default function MorphingBackground({ 
  children, 
  style, 
  mode = 'normal',
  animationDuration = 1200 
}: MorphingBackgroundProps) {
  
  // Animation values for organic morphing
  // Main expanding crystal
  const prismTop = useRef(new Animated.Value(SCREEN_HEIGHT * 0.15)).current;
  const prismRight = useRef(new Animated.Value(SCREEN_WIDTH * 0.1)).current;
  const prismWidth = useRef(new Animated.Value(120)).current;
  const prismHeight = useRef(new Animated.Value(200)).current;
  const prismRotation = useRef(new Animated.Value(20)).current;
  const prismOpacity = useRef(new Animated.Value(Platform.OS === 'android' ? 0.4 : 0.6)).current;
  
  // Secondary prisms rearranging
  const prism2Top = useRef(new Animated.Value(SCREEN_HEIGHT * 0.75)).current;
  const prism2Left = useRef(new Animated.Value(SCREEN_WIDTH * 0.15)).current;
  const prism2Scale = useRef(new Animated.Value(1)).current;
  const prism2Rotation = useRef(new Animated.Value(-30)).current;
  
  const prism3Top = useRef(new Animated.Value(SCREEN_HEIGHT * 0.6)).current;
  const prism3Right = useRef(new Animated.Value(SCREEN_WIDTH * 0.25)).current;
  const prism3Scale = useRef(new Animated.Value(1)).current;
  const prism3Rotation = useRef(new Animated.Value(45)).current;
  
  // Bright accents flowing
  const accent1Top = useRef(new Animated.Value(SCREEN_HEIGHT * 0.35)).current;
  const accent1Left = useRef(new Animated.Value(SCREEN_WIDTH * 0.35)).current;
  const accent1Scale = useRef(new Animated.Value(1)).current;
  
  const accent2Top = useRef(new Animated.Value(SCREEN_HEIGHT * 0.5)).current;
  const accent2Right = useRef(new Animated.Value(SCREEN_WIDTH * 0.3)).current;
  const accent2Scale = useRef(new Animated.Value(1)).current;
  
  // Streaks reshaping
  const streak1Rotation = useRef(new Animated.Value(15)).current;
  const streak1Scale = useRef(new Animated.Value(1)).current;
  const streak2Rotation = useRef(new Animated.Value(-40)).current;
  const streak2Scale = useRef(new Animated.Value(1)).current;
  const streak3Rotation = useRef(new Animated.Value(35)).current;
  const streak3Scale = useRef(new Animated.Value(1)).current;
  
  // Other elements opacity
  const otherElementsOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (mode === 'expanded') {
      // Create a staggered, organic morphing sequence
      
      // Phase 1: Main crystal begins expansion (immediate) + fade other elements
      Animated.parallel([
        Animated.timing(prismTop, {
          toValue: -SCREEN_HEIGHT * 0.15, // Move up more
          duration: animationDuration * 1.2,
          useNativeDriver: false,
        }),
        Animated.timing(prismRight, {
          toValue: -SCREEN_WIDTH * 0.15, // Extend further left
          duration: animationDuration * 1.2,
          useNativeDriver: false,
        }),
        Animated.timing(prismWidth, {
          toValue: SCREEN_WIDTH * 1.3,
          duration: animationDuration * 1.2,
          useNativeDriver: false,
        }),
        Animated.timing(prismHeight, {
          toValue: SCREEN_HEIGHT * 1.3,
          duration: animationDuration * 1.2,
          useNativeDriver: false,
        }),
        Animated.timing(prismRotation, {
          toValue: 8, // Gentle rotation
          duration: animationDuration * 1.2,
          useNativeDriver: false,
        }),
        Animated.timing(prismOpacity, {
          toValue: 0.75, // Prominent but not overwhelming
          duration: animationDuration,
          useNativeDriver: false,
        }),
        // Fade other static elements so animated ones become visible
        Animated.timing(otherElementsOpacity, {
          toValue: 0.3, // Fade but don't completely hide
          duration: animationDuration * 0.8,
          useNativeDriver: false,
        }),
      ]).start();
      
      // Phase 2: Secondary elements rearrange (slight delay for organic feel)
      setTimeout(() => {
        Animated.parallel([
          // Prism 2 flows to bottom-left corner
          Animated.timing(prism2Top, {
            toValue: SCREEN_HEIGHT * 0.85,
            duration: animationDuration * 0.9,
            useNativeDriver: false,
          }),
          Animated.timing(prism2Left, {
            toValue: SCREEN_WIDTH * 0.05,
            duration: animationDuration * 0.9,
            useNativeDriver: false,
          }),
          Animated.timing(prism2Scale, {
            toValue: 0.7, // Smaller but still visible
            duration: animationDuration * 0.9,
            useNativeDriver: false,
          }),
          Animated.timing(prism2Rotation, {
            toValue: -45, // More dramatic angle
            duration: animationDuration * 0.9,
            useNativeDriver: false,
          }),
          
          // Prism 3 flows to top-left corner
          Animated.timing(prism3Top, {
            toValue: SCREEN_HEIGHT * 0.15,
            duration: animationDuration * 0.8,
            useNativeDriver: false,
          }),
          Animated.timing(prism3Right, {
            toValue: SCREEN_WIDTH * 0.8, // Move to left side
            duration: animationDuration * 0.8,
            useNativeDriver: false,
          }),
          Animated.timing(prism3Scale, {
            toValue: 0.8,
            duration: animationDuration * 0.8,
            useNativeDriver: false,
          }),
          Animated.timing(prism3Rotation, {
            toValue: 60, // Flow with the main crystal
            duration: animationDuration * 0.8,
            useNativeDriver: false,
          }),
        ]).start();
      }, 150);
      
      // Phase 3: Accent elements migrate (more delay)
      setTimeout(() => {
        Animated.parallel([
          // Accent 1 flows toward bottom
          Animated.timing(accent1Top, {
            toValue: SCREEN_HEIGHT * 0.75,
            duration: animationDuration * 0.7,
            useNativeDriver: false,
          }),
          Animated.timing(accent1Left, {
            toValue: SCREEN_WIDTH * 0.15,
            duration: animationDuration * 0.7,
            useNativeDriver: false,
          }),
          Animated.timing(accent1Scale, {
            toValue: 0.6,
            duration: animationDuration * 0.7,
            useNativeDriver: false,
          }),
          
          // Accent 2 flows toward top
          Animated.timing(accent2Top, {
            toValue: SCREEN_HEIGHT * 0.25,
            duration: animationDuration * 0.7,
            useNativeDriver: false,
          }),
          Animated.timing(accent2Right, {
            toValue: SCREEN_WIDTH * 0.8,
            duration: animationDuration * 0.7,
            useNativeDriver: false,
          }),
          Animated.timing(accent2Scale, {
            toValue: 0.5,
            duration: animationDuration * 0.7,
            useNativeDriver: false,
          }),
        ]).start();
      }, 300);
      
      // Phase 4: Streaks adapt to new layout (final phase)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(streak1Rotation, {
            toValue: 25, // Flow around expanded crystal
            duration: animationDuration * 0.6,
            useNativeDriver: false,
          }),
          Animated.timing(streak1Scale, {
            toValue: 0.8,
            duration: animationDuration * 0.6,
            useNativeDriver: false,
          }),
          Animated.timing(streak2Rotation, {
            toValue: -25, // Complement the main crystal
            duration: animationDuration * 0.6,
            useNativeDriver: false,
          }),
          Animated.timing(streak2Scale, {
            toValue: 0.7,
            duration: animationDuration * 0.6,
            useNativeDriver: false,
          }),
          Animated.timing(streak3Rotation, {
            toValue: 50, // Flow naturally
            duration: animationDuration * 0.6,
            useNativeDriver: false,
          }),
          Animated.timing(streak3Scale, {
            toValue: 0.6,
            duration: animationDuration * 0.6,
            useNativeDriver: false,
          }),
        ]).start();
      }, 450);
    } else {
      // Return to normal state - reverse all animations
      Animated.parallel([
        // Reset main prism
        Animated.timing(prismTop, {
          toValue: SCREEN_HEIGHT * 0.15,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(prismRight, {
          toValue: SCREEN_WIDTH * 0.1,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(prismWidth, {
          toValue: 120,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(prismHeight, {
          toValue: 200,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(prismRotation, {
          toValue: 20,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(prismOpacity, {
          toValue: Platform.OS === 'android' ? 0.4 : 0.6,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        
        // Reset other elements opacity
        Animated.timing(otherElementsOpacity, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        
        // Reset secondary elements
        Animated.timing(prism2Top, {
          toValue: SCREEN_HEIGHT * 0.75,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(prism2Left, {
          toValue: SCREEN_WIDTH * 0.15,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(prism2Scale, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(prism2Rotation, {
          toValue: -30,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        
        // Reset all other elements...
        Animated.timing(prism3Top, {
          toValue: SCREEN_HEIGHT * 0.6,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(prism3Right, {
          toValue: SCREEN_WIDTH * 0.25,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(prism3Scale, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(prism3Rotation, {
          toValue: 45,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        
        // Reset accents
        Animated.timing(accent1Top, {
          toValue: SCREEN_HEIGHT * 0.35,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(accent1Left, {
          toValue: SCREEN_WIDTH * 0.35,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(accent1Scale, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        
        Animated.timing(accent2Top, {
          toValue: SCREEN_HEIGHT * 0.5,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(accent2Right, {
          toValue: SCREEN_WIDTH * 0.3,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(accent2Scale, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        
        // Reset streaks
        Animated.timing(streak1Rotation, {
          toValue: 15,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(streak1Scale, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(streak2Rotation, {
          toValue: -40,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(streak2Scale, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(streak3Rotation, {
          toValue: 35,
          duration: animationDuration,
          useNativeDriver: false,
        }),
        Animated.timing(streak3Scale, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [mode, animationDuration]);

  return (
    <View style={[styles.container, style]}>
      {/* Dark base background */}
      <LinearGradient
        colors={[
          '#0F172A', // Dark slate
          '#1E293B', // Slate grey
          '#111827', // Dark grey
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.darkBase}
      />
      
      {/* Animated colorful streaks - repositioning around expanded crystal */}
      <Animated.View
        style={[
          styles.streak,
          styles.streak1,
          {
            transform: [
              { 
                rotate: streak1Rotation.interpolate({
                  inputRange: [15, 25],
                  outputRange: ['15deg', '25deg'],
                  extrapolate: 'clamp'
                })
              },
              { scale: streak1Scale }
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(124, 58, 237, 0.4)', // Purple
            'rgba(124, 58, 237, 0.1)',
            'rgba(124, 58, 237, 0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.3 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.streak,
          styles.streak2,
          {
            transform: [
              { 
                rotate: streak2Rotation.interpolate({
                  inputRange: [-40, -25],
                  outputRange: ['-40deg', '-25deg'],
                  extrapolate: 'clamp'
                })
              },
              { scale: streak2Scale }
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(19, 0, 57, 0.17)', // Bright yellow-gold
            'rgba(236, 72, 153, 0.5)', // Pink
            'rgba(245, 158, 11, 0.3)', // Orange
            'rgba(245, 158, 11, 0)',
          ]}
          start={{ x: 0.7, y: 0.2 }}
          end={{ x: 0.1, y: 0.8 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.streak,
          styles.streak3,
          {
            transform: [
              { 
                rotate: streak3Rotation.interpolate({
                  inputRange: [35, 50],
                  outputRange: ['35deg', '50deg'],
                  extrapolate: 'clamp'
                })
              },
              { scale: streak3Scale }
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(6, 182, 212, 0.4)', // Cyan
            'rgba(16, 185, 129, 0.3)', // Emerald
            'rgba(16, 185, 129, 0)',
          ]}
          start={{ x: 0.8, y: 0.6 }}
          end={{ x: 0.2, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
      
      {/* Static background streaks - faded during animation */}
      <Animated.View style={{ opacity: otherElementsOpacity }}>
        {/* Keep some static elements for depth */}
      </Animated.View>
      
      {/* Organic dark sections - animated opacity */}
      <Animated.View style={{ opacity: otherElementsOpacity }}>
        {/* Organic dark section - Top curved area */}
        <LinearGradient
          colors={[
            '#0B1426', // Very dark navy
            '#0F172A', // Dark slate
            'rgba(15, 23, 42, 0.8)',
            'rgba(15, 23, 42, 0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 0.6 }}
          style={styles.darkSectionTop}
        />
        
        {/* Organic dark section - Bottom flowing area */}
        <LinearGradient
          colors={[
            '#111827', // Dark grey
            '#0B1426', // Very dark navy
            'rgba(11, 20, 38, 0.9)',
            'rgba(11, 20, 38, 0)',
          ]}
          start={{ x: 1, y: 1 }}
          end={{ x: 0.2, y: 0.4 }}
          style={styles.darkSectionBottom}
        />
      </Animated.View>
      
      {/* The MAIN morphing prism - this will expand */}
      <Animated.View 
        style={[
          styles.prism,
          {
            position: 'absolute',
            top: prismTop,
            right: prismRight,
            width: prismWidth,
            height: prismHeight,
            opacity: prismOpacity,
            transform: [
              {
                rotate: prismRotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={
            mode === 'expanded'
              ? [
                  'rgba(168, 85, 247, 0.25)', // More prominent purple
                  'rgba(124, 58, 237, 0.20)', // Rich purple
                  'rgba(99, 102, 241, 0.15)', // Indigo
                  'rgba(79, 70, 229, 0.10)', // Darker indigo
                  'rgba(67, 56, 202, 0.05)', // Deep indigo
                ]
              : [
                  'rgba(255, 255, 255, 0.12)',
                  'rgba(255, 255, 255, 0.06)',
                  'rgba(255, 255, 255, 0.02)',
                ]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.prismGradient}
        />
      </Animated.View>
      
      {/* Animated secondary prisms - repositioning */}
      <Animated.View
        style={[
          styles.prism,
          {
            position: 'absolute',
            top: prism2Top,
            left: prism2Left,
            width: 80,
            height: 150,
            transform: [
              { 
                rotate: prism2Rotation.interpolate({
                  inputRange: [-30, -45],
                  outputRange: ['-30deg', '-45deg'],
                  extrapolate: 'clamp'
                })
              },
              { scale: prism2Scale }
            ],
            opacity: Platform.OS === 'android' ? 0.2 : 0.4,
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(124, 58, 237, 0.15)',
            'rgba(236, 72, 153, 0.08)',
            'rgba(6, 182, 212, 0.04)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.prismGradient}
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.prism,
          {
            position: 'absolute',
            top: prism3Top,
            right: prism3Right,
            width: 60,
            height: 100,
            transform: [
              { 
                rotate: prism3Rotation.interpolate({
                  inputRange: [45, 60],
                  outputRange: ['45deg', '60deg'],
                  extrapolate: 'clamp'
                })
              },
              { scale: prism3Scale }
            ],
            opacity: Platform.OS === 'android' ? 0.3 : 0.5,
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(245, 158, 11, 0.2)',
            'rgba(16, 185, 129, 0.1)',
            'rgba(16, 185, 129, 0.03)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.prismGradient}
        />
      </Animated.View>
      
      {/* Static background elements - faded during animation */}
      <Animated.View style={{ opacity: otherElementsOpacity }}>
        {/* Keep some static elements for layering */}
      </Animated.View>
      
      {/* Animated bright central accents - flowing to new positions */}
      <Animated.View
        style={[
          styles.brightAccent,
          {
            position: 'absolute',
            top: accent1Top,
            left: accent1Left,
            width: 90,
            height: 60,
            borderRadius: 25,
            transform: [{ rotate: '-15deg' }, { scale: accent1Scale }],
            opacity: Platform.OS === 'android' ? 0.5 : 0.7,
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(252, 180, 0, 0.6)', // Bright yellow-gold
            'rgba(245, 158, 11, 0.4)', // Orange-gold
            'rgba(249, 115, 22, 0.3)', // Orange
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.accentGradient}
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.brightAccent,
          {
            position: 'absolute',
            top: accent2Top,
            right: accent2Right,
            width: 70,
            height: 80,
            borderRadius: 25,
            transform: [{ rotate: '25deg' }, { scale: accent2Scale }],
            opacity: Platform.OS === 'android' ? 0.4 : 0.6,
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(168, 85, 247, 0.8)', // Bright purple
            'rgba(139, 92, 246, 0.6)', // Violet
            'rgba(236, 72, 153, 0.5)', // Pink
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.accentGradient}
        />
      </Animated.View>
      
      {/* Additional overlays - animated opacity */}
      <Animated.View style={{ opacity: otherElementsOpacity }}>
        {/* Additional blur-like streak overlay */}
        <LinearGradient
          colors={[
            'rgba(139, 92, 246, 0.08)', // Violet
            'rgba(139, 92, 246, 0)',
            'rgba(236, 72, 153, 0.06)', // Pink
            'rgba(236, 72, 153, 0)',
          ]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.blurOverlay}
        />
        
        {/* Subtle light refraction effect */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.03)',
            'rgba(255, 255, 255, 0.01)',
            'rgba(255, 255, 255, 0.02)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.lightRefraction}
        />
      </Animated.View>
      
      {/* Frosted glass blur overlay */}
      <BlurView
        intensity={100}
        tint="dark"
        style={styles.blurOverlayGlass}
      />
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

// Reuse most styles from ChatGPTBackground with some additions
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  darkBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  streak: {
    position: 'absolute',
  },
  streak1: {
    top: -50,
    left: -100,
    right: -50,
    height: '40%',
    transform: [{ rotate: '15deg' }],
  },
  streak2: {
    top: '40%',
    left: -60,
    right: -40,
    height: '40%',
    transform: [{ rotate: '-40deg' }],
  },
  streak3: {
    bottom: -80,
    left: -60,
    right: -100,
    height: '45%',
    transform: [{ rotate: '35deg' }],
  },
  prism: {
    borderRadius: 20,
  },
  prism2: {
    position: 'absolute',
    bottom: '25%',
    left: '15%',
    width: 80,
    height: 150,
    transform: [{ rotate: '-30deg' }],
    opacity: Platform.OS === 'android' ? 0.2 : 0.4,
  },
  prism3: {
    position: 'absolute',
    top: '60%',
    right: '25%',
    width: 60,
    height: 100,
    transform: [{ rotate: '45deg' }],
    opacity: Platform.OS === 'android' ? 0.3 : 0.5,
  },
  prismGradient: {
    flex: 1,
    borderRadius: 20,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: Platform.OS === 'android' ? 0.5 : 0.7,
  },
  darkSectionTop: {
    position: 'absolute',
    top: -40,
    left: -20,
    right: '30%',
    height: '35%',
    transform: [{ rotate: '-8deg' }],
    opacity: Platform.OS === 'android' ? 0.6 : 0.8,
  },
  darkSectionBottom: {
    position: 'absolute',
    bottom: -60,
    left: '25%',
    right: -30,
    height: '40%',
    transform: [{ rotate: '12deg' }],
    opacity: Platform.OS === 'android' ? 0.55 : 0.75,
  },
  brightAccent: {
    position: 'absolute',
    borderRadius: 25,
  },
  brightAccent1: {
    top: '35%',
    left: '35%',
    width: 90,
    height: 60,
    transform: [{ rotate: '-15deg' }],
    opacity: Platform.OS === 'android' ? 0.5 : 0.7,
  },
  brightAccent2: {
    top: '50%',
    right: '30%',
    width: 70,
    height: 80,
    transform: [{ rotate: '25deg' }],
    opacity: Platform.OS === 'android' ? 0.4 : 0.6,
  },
  accentGradient: {
    flex: 1,
    borderRadius: 25,
  },
  lightRefraction: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 2,
    opacity: Platform.OS === 'android' ? 0.6 : 0.8,
  },
  blurOverlayGlass: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});