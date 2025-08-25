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

  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
    },
    style,
  ];

  const logoStyle = [
    styles.logo,
    {
      width: size,
      height: size,
    },
    imageStyle,
  ];

  if (!logoUrl || (error && fallbackError)) {
    // Show fallback icon
    return (
      <View style={containerStyle}>
        <Ionicons 
          name={fallbackIconName}
          size={size * 0.7} 
          color={fallbackIconColor} 
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
  },
  logo: {
    backgroundColor: 'transparent',
  },
});

export default BrandfetchLogo;