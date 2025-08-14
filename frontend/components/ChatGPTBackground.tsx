import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface ChatGPTBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

export default function ChatGPTBackground({ children, style }: ChatGPTBackgroundProps) {
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
      
      {/* Colorful streak 1 - Top diagonal */}
      <LinearGradient
        colors={[
          'rgba(124, 58, 237, 0.4)', // Purple
          'rgba(124, 58, 237, 0.1)',
          'rgba(124, 58, 237, 0)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.3 }}
        style={[styles.streak, styles.streak1]}
      />
      
      {/* Colorful streak 2 - Middle curve */}
      <LinearGradient
        colors={[
          'rgba(236, 72, 153, 0.5)', // Pink
          'rgba(245, 158, 11, 0.3)', // Orange
          'rgba(245, 158, 11, 0)',
        ]}
        start={{ x: 0.7, y: 0.2 }}
        end={{ x: 0.1, y: 0.8 }}
        style={[styles.streak, styles.streak2]}
      />
      
      {/* Colorful streak 3 - Bottom curve */}
      <LinearGradient
        colors={[
          'rgba(6, 182, 212, 0.4)', // Cyan
          'rgba(16, 185, 129, 0.3)', // Emerald
          'rgba(16, 185, 129, 0)',
        ]}
        start={{ x: 0.8, y: 0.6 }}
        end={{ x: 0.2, y: 1 }}
        style={[styles.streak, styles.streak3]}
      />
      
      {/* Glassmorphic prism effect 1 - Large crystal */}
      <View style={[styles.prism, styles.prism1]}>
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.12)',
            'rgba(255, 255, 255, 0.06)',
            'rgba(255, 255, 255, 0.02)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.prismGradient}
        />
      </View>
      
      {/* Glassmorphic prism effect 2 - Medium crystal */}
      <View style={[styles.prism, styles.prism2]}>
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
      </View>
      
      {/* Glassmorphic prism effect 3 - Small accent */}
      <View style={[styles.prism, styles.prism3]}>
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
      </View>
      
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
      
      {/* Frosted glass blur overlay */}
      <BlurView
        intensity={1}
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
    top: '20%',
    left: -80,
    right: -80,
    height: '50%',
    transform: [{ rotate: '-25deg' }],
  },
  streak3: {
    bottom: -80,
    left: -60,
    right: -100,
    height: '45%',
    transform: [{ rotate: '35deg' }],
  },
  prism: {
    position: 'absolute',
    borderRadius: 20,
  },
  prism1: {
    top: '15%',
    right: '10%',
    width: 120,
    height: 200,
    transform: [{ rotate: '20deg' }],
    opacity: 0.6,
  },
  prism2: {
    bottom: '25%',
    left: '15%',
    width: 80,
    height: 150,
    transform: [{ rotate: '-30deg' }],
    opacity: 0.4,
  },
  prism3: {
    top: '60%',
    right: '25%',
    width: 60,
    height: 100,
    transform: [{ rotate: '45deg' }],
    opacity: 0.5,
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
    opacity: 0.7,
  },
  lightRefraction: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
  },
  blurOverlayGlass: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0.5,
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});