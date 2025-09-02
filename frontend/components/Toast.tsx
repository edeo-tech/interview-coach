import React, { useEffect, useState } from 'react';
import { View, Text, Animated, StyleSheet, ViewStyle, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY } from '../constants/Typography';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onHide: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onHide }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-100));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Slide in and fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    const timer = setTimeout(() => {
      hideToast();
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(toast.id);
    });
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          backgroundColor: Colors.glass.success, // Design system success light
          borderColor: Colors.glass.successBorder,
          iconColor: Colors.semantic.success, // Design system success
          iconName: 'checkmark-circle' as const,
        };
      case 'error':
        return {
          backgroundColor: Colors.glass.error, // Design system error light
          borderColor: Colors.glass.errorBorder,
          iconColor: Colors.semantic.error, // Design system error
          iconName: 'close-circle' as const,
        };
      case 'warning':
        return {
          backgroundColor: Colors.glass.warning, // Design system warning light
          borderColor: Colors.glass.warning,
          iconColor: Colors.semantic.warningDark, // Design system warning
          iconName: 'warning' as const,
        };
      case 'info':
        return {
          backgroundColor: Colors.glass.info, // Design system info light
          borderColor: Colors.glass.infoBorder,
          iconColor: Colors.semantic.infoAlt, // Design system info
          iconName: 'information-circle' as const,
        };
      default:
        return {
          backgroundColor: Colors.glass.background, // Default glass
          borderColor: Colors.glass.border,
          iconColor: Colors.accent.blue, // Design system accent
          iconName: 'information-circle' as const,
        };
    }
  };

  const toastStyles = getToastStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: Colors.black,
          borderColor: toastStyles.borderColor,
          opacity: fadeAnim,
          transform: [{ translateY }],
          top: insets.top + 10,
        },
      ]}
    >
      <View style={[styles.colorOverlay, { backgroundColor: toastStyles.backgroundColor }]}>
        <View style={styles.content}>
          <Ionicons 
            name={toastStyles.iconName} 
            size={20} 
            color={toastStyles.iconColor} 
            style={styles.icon}
          />
          <Text style={styles.message}>{toast.message}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      message,
      type,
      duration,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Create context value
  const contextValue = {
    showToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <View style={styles.toastContainer} pointerEvents="box-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onHide={hideToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

// Create Toast Context
interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  container: {
    position: 'absolute',
    left: 20, // Design system spacing
    right: 20, // Design system spacing
    borderRadius: 12, // Design system border radius
    borderWidth: 1,
    // Design system shadow
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
    overflow: 'hidden', // Ensure border radius clips children
  },
  colorOverlay: {
    paddingHorizontal: 16, // Design system spacing
    paddingVertical: 12, // Design system spacing
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Design system spacing
  },
  icon: {
    marginRight: 4, // Design system spacing
  },
  message: {
    ...TYPOGRAPHY.labelMedium,
    color: Colors.white, // Design system text primary
    flex: 1,
  },
});