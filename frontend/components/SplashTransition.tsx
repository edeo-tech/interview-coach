import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator } from 'react-native';

interface SplashTransitionProps {
  onTransitionComplete: () => void;
}

const SplashTransition: React.FC<SplashTransitionProps> = ({ onTransitionComplete }) => {
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onTransitionComplete();
      });
    }, 3000); // Changed from 200ms to 3000ms (3 seconds)

    return () => clearTimeout(timer);
  }, [fadeAnim, onTransitionComplete]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.innerContainer}>
        <ActivityIndicator 
          size="large" 
          color="#ffffff" 
          style={styles.activityIndicator}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: '#151a31',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151a31',
  },
  activityIndicator: {
    transform: [{ scale: 2.5 }], // Makes the activity indicator massive
  },
});

export default SplashTransition;