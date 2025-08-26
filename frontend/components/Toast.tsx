import React, { useEffect, useState } from 'react';
import { View, Text, Animated, StyleSheet, ViewStyle, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
          backgroundColor: 'rgba(34, 197, 94, 0.15)', // Design system success light
          borderColor: 'rgba(34, 197, 94, 0.25)',
          iconColor: '#22C55E', // Design system success
          iconName: 'checkmark-circle' as const,
        };
      case 'error':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.15)', // Design system error light
          borderColor: 'rgba(239, 68, 68, 0.25)',
          iconColor: '#EF4444', // Design system error
          iconName: 'close-circle' as const,
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(217, 119, 6, 0.15)', // Design system warning light
          borderColor: 'rgba(217, 119, 6, 0.25)',
          iconColor: '#D97706', // Design system warning
          iconName: 'warning' as const,
        };
      case 'info':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.15)', // Design system info light
          borderColor: 'rgba(59, 130, 246, 0.25)',
          iconColor: '#3B82F6', // Design system info
          iconName: 'information-circle' as const,
        };
      default:
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.12)', // Default glass
          borderColor: 'rgba(255, 255, 255, 0.15)',
          iconColor: '#60A5FA', // Design system accent
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
          backgroundColor: toastStyles.backgroundColor,
          borderColor: toastStyles.borderColor,
          opacity: fadeAnim,
          transform: [{ translateY }],
          top: insets.top + 10,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons 
          name={toastStyles.iconName} 
          size={20} 
          color={toastStyles.iconColor} 
          style={styles.icon}
        />
        <Text style={styles.message}>{toast.message}</Text>
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
    paddingHorizontal: 16, // Design system spacing
    paddingVertical: 12, // Design system spacing
    borderRadius: 12, // Design system border radius
    borderWidth: 1,
    // Design system shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
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
    color: '#FFFFFF', // Design system text primary
    fontSize: 14, // Design system body small
    fontWeight: '500',
    flex: 1,
    fontFamily: 'Inter', // Design system body font
  },
});