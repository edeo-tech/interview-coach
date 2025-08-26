import React, { useState } from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BrandfetchLogoProps {
  identifierType?: string;
  identifierValue?: string;
  fallbackUrl?: string; // For backward compatibility with company_logo_url
  size?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  fallbackIconColor?: string;
  fallbackIconName?: keyof typeof Ionicons.glyphMap;
  variant?: 'default' | 'glass' | 'subtle';
  showBorder?: boolean;
}

const BrandfetchLogo: React.FC<BrandfetchLogoProps> = ({
  identifierType,
  identifierValue,
  fallbackUrl,
  size = 32,
  style,
  imageStyle,
  fallbackIconColor = '#ffffff',
  fallbackIconName = 'briefcase-outline',
  variant = 'default',
  showBorder = false,
}) => {
  const [error, setError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  // Build Brandfetch CDN URL
  const buildBrandfetchUrl = () => {
    if (!identifierValue || !process.env.EXPO_PUBLIC_BRANDFETCH_CLIENT_ID) {
      return null;
    }

    // Use the identifier value directly in the URL
    const height = Math.round(size * 2); // 2x for retina displays
    const width = Math.round(size * 2);
    
    return `https://cdn.brandfetch.io/${identifierValue}/logo/theme/dark/fallback/icon/h/${height}/w/${width}?c=${process.env.EXPO_PUBLIC_BRANDFETCH_CLIENT_ID}`;
  };

  const brandfetchUrl = buildBrandfetchUrl();
  
  // Determine which URL to use
  const logoUrl = !error && brandfetchUrl ? brandfetchUrl : (!fallbackError && fallbackUrl ? fallbackUrl : null);

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.12)',
          border: showBorder ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          borderRadius: Math.max(8, size * 0.25), // Responsive border radius
          shadow: {
            color: '#000',
            offset: { width: 0, height: 2 },
            opacity: 0.1,
            radius: 4,
          }
        };
      case 'subtle':
        return {
          background: 'rgba(255, 255, 255, 0.08)',
          border: showBorder ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
          borderRadius: Math.max(6, size * 0.2),
          shadow: {
            color: '#000',
            offset: { width: 0, height: 1 },
            opacity: 0.05,
            radius: 2,
          }
        };
      default:
        return {
          background: 'transparent',
          border: showBorder ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          borderRadius: Math.max(8, size * 0.25),
          shadow: null
        };
    }
  };

  const variantStyles = getVariantStyles();

  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
      backgroundColor: variantStyles.background,
      borderWidth: showBorder ? 1 : 0,
      borderColor: variantStyles.border,
      borderRadius: variantStyles.borderRadius,
      ...(variantStyles.shadow && {
        shadowColor: variantStyles.shadow.color,
        shadowOffset: variantStyles.shadow.offset,
        shadowOpacity: variantStyles.shadow.opacity,
        shadowRadius: variantStyles.shadow.radius,
        elevation: variantStyles.shadow.radius, // Android shadow
      }),
    },
    style,
  ];

  const logoStyle = [
    styles.logo,
    {
      width: size,
      height: size,
      borderRadius: variantStyles.borderRadius,
    },
    imageStyle,
  ];

  if (!logoUrl || (error && fallbackError)) {
    // Show fallback icon with enhanced styling
    return (
      <View style={containerStyle}>
        <Ionicons 
          name={fallbackIconName}
          size={size * 0.6} // Slightly smaller for better visual balance
          color={fallbackIconColor} 
          style={styles.fallbackIcon}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Image 
        source={{ uri: logoUrl }}
        style={logoStyle}
        onError={() => {
          if (logoUrl === brandfetchUrl) {
            setError(true);
          } else {
            setFallbackError(true);
          }
        }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Glassmorphic backdrop blur effect (iOS only)
    // Note: React Native doesn't support backdrop-filter directly
    // This would need to be implemented with native modules or libraries
  },
  logo: {
    backgroundColor: 'transparent',
  },
  fallbackIcon: {
    // Ensure icon is properly centered and has consistent opacity
    opacity: 0.8,
  },
});

export default BrandfetchLogo;