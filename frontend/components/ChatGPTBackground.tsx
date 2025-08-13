import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ChatGPTBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

export default function ChatGPTBackground({ children, style }: ChatGPTBackgroundProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Base multicolored gradient layer */}
      <LinearGradient
        colors={[
          '#7C3AED', // Purple
          '#EC4899', // Pink-Magenta
          '#F59E0B', // Orange-Yellow
          '#F59E0B', // Orange-Gold (Our new accent)
          '#06B6D4', // Cyan-Teal
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={styles.baseGradient}
      />
      
      {/* Secondary diagonal gradient for more complexity */}
      <LinearGradient
        colors={[
          'rgba(139, 69, 19, 0.3)', // Brown-Orange
          'rgba(147, 51, 234, 0.4)', // Purple
          'rgba(245, 158, 11, 0.3)', // Orange-Gold
          'rgba(16, 185, 129, 0.2)', // Green-Teal
        ]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.secondaryGradient}
      />
      
      {/* Dark overlay for sophistication and text readability */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.7)',
          'rgba(0, 0, 0, 0.8)',
          'rgba(0, 0, 0, 0.75)'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.5, 1]}
        style={styles.darkOverlay}
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
  baseGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  secondaryGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6,
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});