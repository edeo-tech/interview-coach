import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface ChatGPTBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

export default function ChatGPTBackground({ children, style }: ChatGPTBackgroundProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Pure black background */}
      <View style={[styles.darkBase, { backgroundColor: '#000000' }]} />
      
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
    position: 'absolute',
    borderRadius: 20,
  },
  prism1: {
    top: '15%',
    right: '10%',
    width: 120,
    height: 200,
    transform: [{ rotate: '20deg' }],
    opacity: Platform.OS === 'android' ? 0.4 : 0.6,
  },
  prism2: {
    bottom: '25%',
    left: '15%',
    width: 80,
    height: 150,
    transform: [{ rotate: '-30deg' }],
    opacity: Platform.OS === 'android' ? 0.2 : 0.4,
  },
  prism3: {
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